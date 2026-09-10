<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="open"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
                @click.self="close"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div
                    class="relative w-full max-w-md bg-card text-card-foreground border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
                >
                    <!-- Header -->
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Radio class="h-6 w-6 animate-pulse" />
                            </div>
                            <div>
                                <h3 id="modal-title" class="font-heading font-semibold text-lg leading-tight">
                                    Dengar Bersama
                                </h3>
                                <p class="text-xs text-muted-foreground mt-0.5">
                                    Sinkronisasi audio & ayat real-time multi-device
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            @click="close"
                            class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                            aria-label="Tutup Dialog"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- State 1: Room Not Created Yet -->
                    <div v-if="!roomSync.roomCode.value" class="space-y-4 pt-1">
                        <div class="p-4 rounded-xl bg-muted/50 border border-border/60 space-y-2.5 text-xs text-muted-foreground">
                            <div class="flex items-start gap-2.5">
                                <Users class="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>Bagikan audio dan highlight ayat yang Anda putar ke HP, tablet, atau laptop teman secara serentak.</span>
                            </div>
                            <div class="flex items-start gap-2.5">
                                <QrCode class="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>Cukup arahkan kamera smartphone ke QR Code untuk langsung bergabung tanpa perlu install aplikasi.</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            @click="handleCreateRoom"
                            :disabled="isCreating"
                            class="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                        >
                            <Loader2 v-if="isCreating" class="h-4 w-4 animate-spin" />
                            <Radio v-else class="h-4 w-4" />
                            <span>{{ isCreating ? 'Menyiapkan Ruang Sesi...' : 'Mulai Sesi Dengar Bersama' }}</span>
                        </button>
                    </div>

                    <!-- State 2: Active Host Room Session -->
                    <div v-else class="space-y-4 pt-1">
                        <!-- Live Status Indicator -->
                        <div class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                            <div class="flex items-center gap-2">
                                <span class="relative flex h-2.5 w-2.5">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span>Sesi Siaran Aktif</span>
                            </div>

                            <div class="flex items-center gap-1.5 font-mono text-[11px] bg-card px-2 py-0.5 rounded-md border border-emerald-500/20">
                                <Users class="h-3 w-3" />
                                <span>{{ roomSync.listenerCount.value }} Terhubung</span>
                            </div>
                        </div>

                        <!-- QR Code Container -->
                        <div class="flex flex-col items-center justify-center p-4 bg-white dark:bg-white rounded-2xl border border-border shadow-inner">
                            <div class="w-48 h-48 sm:w-52 sm:h-52" v-html="qrSvg" />
                            <p class="text-[11px] text-zinc-600 font-medium mt-2 flex items-center gap-1">
                                <QrCode class="h-3.5 w-3.5" />
                                <span>Scan dengan kamera HP untuk bergabung</span>
                            </p>
                        </div>

                        <!-- Room Code Card -->
                        <div class="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
                            <div>
                                <span class="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
                                    Kode Room Sesi
                                </span>
                                <span class="font-mono text-xl font-bold tracking-widest text-primary">
                                    {{ roomSync.roomCode.value }}
                                </span>
                            </div>

                            <button
                                type="button"
                                @click="copyRoomCode"
                                class="px-3 py-1.5 rounded-lg bg-card hover:bg-card/80 border border-border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Check v-if="codeCopied" class="h-3.5 w-3.5 text-emerald-500" />
                                <Copy v-else class="h-3.5 w-3.5" />
                                <span>{{ codeCopied ? 'Tersalin' : 'Salin Kode' }}</span>
                            </button>
                        </div>

                        <!-- Copy Link -->
                        <div class="flex items-center gap-2">
                            <input
                                type="text"
                                readonly
                                :value="roomSync.joinUrl.value"
                                class="flex-1 bg-muted/50 border border-border text-xs rounded-xl px-3 py-2 font-mono text-muted-foreground focus:outline-none"
                            />
                            <button
                                type="button"
                                @click="copyJoinLink"
                                class="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                            >
                                <Check v-if="linkCopied" class="h-3.5 w-3.5 text-emerald-500" />
                                <Share2 v-else class="h-3.5 w-3.5" />
                                <span>{{ linkCopied ? 'Tersalin' : 'Salin Link' }}</span>
                            </button>
                        </div>

                        <!-- Footer Controls -->
                        <div class="flex items-center justify-between pt-2 border-t border-border/60">
                            <button
                                type="button"
                                @click="handleEndSession"
                                class="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors cursor-pointer"
                            >
                                Tutup Sesi Bersama
                            </button>

                            <button
                                type="button"
                                @click="close"
                                class="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors cursor-pointer"
                            >
                                Siarkan di Latar Belakang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Radio, Users, QrCode, X, Copy, Check, Share2, Loader2 } from 'lucide-vue-next';
import { useRoomSync } from '@/composables/useRoomSync';
import { useQuranAudioPlayer } from '@/composables/useQuranAudioPlayer';
import { useUserPreferences } from '@/composables/useUserPreferences';
import { generateQRCodeSVG } from '@/lib/qrcode';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:open']);

const roomSync = useRoomSync();
const audioPlayer = useQuranAudioPlayer();
const userPreferences = useUserPreferences();

const isCreating = ref(false);
const codeCopied = ref(false);
const linkCopied = ref(false);

const close = () => {
    emit('update:open', false);
};

const qrSvg = computed(() => {
    if (!roomSync.joinUrl.value) return '';
    return generateQRCodeSVG(roomSync.joinUrl.value, {
        foreground: '#09090b',
        background: '#ffffff',
        margin: 2,
    });
});

const handleCreateRoom = async () => {
    isCreating.value = true;
    try {
        await roomSync.createRoom({
            surahId: audioPlayer.currentSurahId.value || 1,
            ayahNumber: audioPlayer.currentAyahNumber.value || 1,
            currentTime: audioPlayer.currentTime.value || 0,
            isPlaying: audioPlayer.isPlaying.value,
            reciterId: userPreferences.selectedReciterId.value || 7,
            mushafType: userPreferences.mushafType.value || 'uthmani',
        });
    } catch (e) {
        // Error handling handled in composable
    } finally {
        isCreating.value = false;
    }
};

const copyRoomCode = async () => {
    if (!roomSync.roomCode.value) return;
    try {
        await navigator.clipboard.writeText(roomSync.roomCode.value);
        codeCopied.value = true;
        setTimeout(() => { codeCopied.value = false; }, 2000);
    } catch (e) {}
};

const copyJoinLink = async () => {
    if (!roomSync.joinUrl.value) return;
    try {
        await navigator.clipboard.writeText(roomSync.joinUrl.value);
        linkCopied.value = true;
        setTimeout(() => { linkCopied.value = false; }, 2000);
    } catch (e) {}
};

const handleEndSession = async () => {
    await roomSync.closeRoom();
    close();
};
</script>
