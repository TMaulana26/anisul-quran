/**
 * Pure JavaScript self-contained QR Code Generator (SVG output)
 * Zero external dependencies. Generates clean scalable SVG path.
 */

// GF(256) Math for Reed-Solomon error correction
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) {
            x ^= 0x11d; // Generator polynomial x^8 + x^4 + x^3 + x^2 + 1
        }
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
})();

function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
        const next = new Array(poly.length + 1).fill(0);
        const factor = GF_EXP[i];
        for (let j = 0; j < poly.length; j++) {
            next[j] ^= gfMul(poly[j], factor);
            next[j + 1] ^= poly[j];
        }
        poly = next;
    }
    return poly;
}

function rsCalculateRemainder(data, polyDegree) {
    const gen = rsGeneratorPoly(polyDegree);
    const result = new Array(polyDegree).fill(0);

    for (let i = 0; i < data.length; i++) {
        const factor = data[i] ^ result.shift();
        result.push(0);
        if (factor !== 0) {
            for (let j = 0; j < gen.length - 1; j++) {
                result[j] ^= gfMul(gen[j + 1], factor);
            }
        }
    }
    return result;
}

// QR Table: Version capacities & ECC settings for Level M (15% error correction)
// Version 1..6 capacities for byte mode (Level M)
const QR_VERSIONS = [
    null, // index 0 unused
    { version: 1, size: 21, dataBytes: 16, ecBytes: 10, align: [] },
    { version: 2, size: 25, dataBytes: 28, ecBytes: 16, align: [6, 18] },
    { version: 3, size: 29, dataBytes: 44, ecBytes: 26, align: [6, 22] },
    { version: 4, size: 33, dataBytes: 64, ecBytes: 18 * 2, align: [6, 26], blocks: 2 },
    { version: 5, size: 37, dataBytes: 86, ecBytes: 24 * 2, align: [6, 30], blocks: 2 },
    { version: 6, size: 41, dataBytes: 108, ecBytes: 16 * 4, align: [6, 34], blocks: 4 },
];

/**
 * Encodes text into Byte Mode QR Code bitstream
 */
function encodeData(text, versionInfo) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const charCount = bytes.length;

    const bits = [];
    function pushBits(val, len) {
        for (let i = len - 1; i >= 0; i--) {
            bits.push((val >> i) & 1);
        }
    }

    // Mode: Byte (0100)
    pushBits(0b0100, 4);
    // Character count (8 bits for Version 1..9)
    pushBits(charCount, 8);

    // Data bytes
    for (const b of bytes) {
        pushBits(b, 8);
    }

    // Terminator (up to 4 zeroes)
    const capacityBits = versionInfo.dataBytes * 8;
    const termLen = Math.min(4, capacityBits - bits.length);
    pushBits(0, termLen);

    // Pad to 8-bit byte boundary
    while (bits.length % 8 !== 0) {
        bits.push(0);
    }

    // Convert bits to byte array
    const dataBytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) {
            b = (b << 1) | bits[i + j];
        }
        dataBytes.push(b);
    }

    // Fill remainder with alternating 0xEC and 0x11
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (dataBytes.length < versionInfo.dataBytes) {
        dataBytes.push(padBytes[padIdx % 2]);
        padIdx++;
    }

    return dataBytes;
}

/**
 * Pick optimal version for input string length
 */
function selectVersion(textLength) {
    for (let v = 1; v < QR_VERSIONS.length; v++) {
        const info = QR_VERSIONS[v];
        // Capacity in bytes = dataBytes - 3 (header & terminator)
        if (textLength + 3 <= info.dataBytes) {
            return info;
        }
    }
    // Fallback to highest supported version
    return QR_VERSIONS[QR_VERSIONS.length - 1];
}

/**
 * Build QR matrix with patterns, data, and mask
 */
function buildMatrix(text) {
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text);
    const vInfo = selectVersion(textBytes.length);
    const size = vInfo.size;

    // matrix[row][col]: 0 = white, 1 = black, null = unassigned
    const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
    const isReserved = Array.from({ length: size }, () => new Array(size).fill(false));

    function setModule(r, c, val) {
        matrix[r][c] = val;
        isReserved[r][c] = true;
    }

    // 1. Finder patterns at 3 corners
    function drawFinder(row, col) {
        for (let r = -1; r <= 7; r++) {
            for (let c = -1; c <= 7; c++) {
                const nr = row + r;
                const nc = col + c;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                    if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
                        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
                        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                        setModule(nr, nc, isBorder || isCenter ? 1 : 0);
                    } else {
                        // Separator
                        setModule(nr, nc, 0);
                    }
                }
            }
        }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // 2. Alignment patterns
    const alignCoords = vInfo.align;
    if (alignCoords.length > 0) {
        for (const ar of alignCoords) {
            for (const ac of alignCoords) {
                // Skip if overlapping finder patterns
                if ((ar <= 8 && ac <= 8) || (ar <= 8 && ac >= size - 8) || (ar >= size - 8 && ac <= 8)) {
                    continue;
                }
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
                        const isCenter = r === 0 && c === 0;
                        setModule(ar + r, ac + c, isOuter || isCenter ? 1 : 0);
                    }
                }
            }
        }
    }

    // 3. Timing patterns
    for (let i = 8; i < size - 8; i++) {
        if (!isReserved[6][i]) setModule(6, i, i % 2 === 0 ? 1 : 0);
        if (!isReserved[i][6]) setModule(i, 6, i % 2 === 0 ? 1 : 0);
    }

    // 4. Dark module
    setModule(size - 8, 8, 1);

    // 5. Reserve format information areas
    for (let i = 0; i < 9; i++) {
        if (!isReserved[8][i]) isReserved[8][i] = true;
        if (!isReserved[i][8]) isReserved[i][8] = true;
    }
    for (let i = 0; i < 8; i++) {
        if (!isReserved[8][size - 1 - i]) isReserved[8][size - 1 - i] = true;
        if (!isReserved[size - 1 - i][8]) isReserved[size - 1 - i][8] = true;
    }

    // 6. Encode data and error correction
    const rawData = encodeData(text, vInfo);
    const ecBytesCount = vInfo.ecBytes / (vInfo.blocks || 1);
    const ecData = rsCalculateRemainder(rawData, ecBytesCount);
    const fullCodewords = [...rawData, ...ecData];

    // Convert full codewords to bitstream
    const fullBits = [];
    for (const b of fullCodewords) {
        for (let i = 7; i >= 0; i--) {
            fullBits.push((b >> i) & 1);
        }
    }

    // 7. Place data bits (zig-zag 2-column right to left)
    let bitIdx = 0;
    let upwards = true;
    for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
        if (rightCol === 6) rightCol--; // Skip vertical timing pattern col

        const rows = [];
        for (let r = 0; r < size; r++) rows.push(r);
        if (upwards) rows.reverse();

        for (const row of rows) {
            for (let c = 0; c < 2; c++) {
                const col = rightCol - c;
                if (!isReserved[row][col]) {
                    const bit = bitIdx < fullBits.length ? fullBits[bitIdx++] : 0;
                    matrix[row][col] = bit;
                }
            }
        }
        upwards = !upwards;
    }

    // 8. Apply Mask (Mask 0: (row + col) % 2 === 0)
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!isReserved[r][c]) {
                if ((r + c) % 2 === 0) {
                    matrix[r][c] ^= 1;
                }
            }
        }
    }

    // 9. Write Format Information (Level M, Mask 0 = 0b10000 -> BCH 15 bits: 0x5412 XOR)
    // Precomputed BCH(15, 5) code for Level M (00) and Mask 0 (000) = 101010000010010
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

    // Around top-left finder
    for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
    matrix[8][7] = formatBits[6];
    matrix[8][8] = formatBits[7];
    matrix[7][8] = formatBits[8];
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

    // Around other finders
    for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i];
    for (let i = 7; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i];

    return { matrix, size };
}

/**
 * Generate clean SVG from text
 * 
 * @param {string} text - URL or text to encode
 * @param {object} options - { margin: 2, size: 256, foreground: 'currentColor', background: 'transparent' }
 * @returns {string} SVG HTML string
 */
export function generateQRCodeSVG(text, options = {}) {
    if (!text) return '';

    const margin = options.margin ?? 2;
    const fg = options.foreground ?? 'currentColor';
    const bg = options.background ?? 'transparent';

    const { matrix, size } = buildMatrix(text);
    const totalSize = size + margin * 2;

    // Build SVG path
    let pathD = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (matrix[r][c] === 1) {
                const x = c + margin;
                const y = r + margin;
                pathD += `M${x},${y}h1v1h-1z `;
            }
        }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges" class="w-full h-full">
        ${bg !== 'transparent' ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}
        <path d="${pathD.trim()}" fill="${fg}"/>
    </svg>`;
}
