async function testFallback() {
    async function getFootnote(id) {
        let res = await fetch(`https://api.quran.com/api/v4/foot_notes/${id}`);
        if (res.ok) {
            const data = await res.json();
            return data.foot_note;
        }

        // Smart fallback: If 404, check preceding footnote ID (id - 1)
        console.log(`Footnote ${id} 404, attempting fallback to ${id - 1}...`);
        res = await fetch(`https://api.quran.com/api/v4/foot_notes/${id - 1}`);
        if (res.ok) {
            const data = await res.json();
            return data.foot_note;
        }

        return null;
    }

    const fn2 = await getFootnote(135063);
    console.log("Result for 135063 with fallback:", fn2);
}
testFallback();
