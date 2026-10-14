<template>
    <div class="sticky top-16 z-30 w-full px-4 py-2.5 bg-primary/10 dark:bg-primary/15 border-b border-primary/20 backdrop-blur-md transition-all">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <!-- Left: Room Badge & Status -->
            <div class="flex items-center gap-2.5">
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-mono font-semibold tracking-wider">
                    <Radio class="h-3.5 w-3.5 animate-pulse" />
                    <span>ROOM {{ roomCode }}</span>
                </div>

                <div class="flex items-center gap-1.5 font-medium text-foreground/90">
                    <span class="relative flex h-2 w-2">
                        <span 
                            :class="[
                                'absolute inline-flex h-full w-full rounded-full opacity-75',
                                isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
                            ]"
                        />
                        <span 
                            :class="[
                                'relative inline-flex rounded-full h-2 w-2',
                                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                            ]"
                        />
                    </span>
                    <span>{{ isConnected ? t('sync.status_synced') : t('sync.status_connecting') }}</span>
                </div>

                <span class="hidden sm:inline text-muted-foreground">•</span>

                <span class="hidden sm:inline text-muted-foreground">
                    {{ t('sync.follower_banner_mode') }}
                </span>
            </div>

            <!-- Right: Listener presence count & Leave button -->
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/60 border border-border/80 font-mono text-[11px] text-muted-foreground">
                    <Users class="h-3.5 w-3.5 text-primary" />
                    <span>{{ t('sync.listener_count', { count: listenerCount }) }}</span>
                </div>

                <button
                    type="button"
                    @click="$emit('leave')"
                    class="px-2.5 py-1 rounded-lg bg-muted/80 hover:bg-muted hover:text-foreground text-muted-foreground font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    :title="t('sync.leave_session_title')"
                >
                    <LogOut class="h-3.5 w-3.5" />
                    <span>{{ t('sync.leave_btn') }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Radio, Users, LogOut } from 'lucide-vue-next';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();

defineProps({
    roomCode: {
        type: String,
        required: true,
    },
    isConnected: {
        type: Boolean,
        default: true,
    },
    listenerCount: {
        type: Number,
        default: 1,
    },
    status: {
        type: String,
        default: 'paused',
    },
    ayahNumber: {
        type: Number,
        default: 1,
    },
});

defineEmits(['leave']);
</script>
