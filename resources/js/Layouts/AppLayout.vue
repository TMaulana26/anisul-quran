<script setup>
import { ref, onMounted, computed } from 'vue';
import { Link, Head, usePage, router } from '@inertiajs/vue3';
import AppLogo from '@/components/AppLogo.vue';
import SettingsDrawer from '@/components/player/SettingsDrawer.vue';
import { useUserPreferences } from '@/composables/useUserPreferences';
import { useI18n } from '@/composables/useI18n';
import { 
    BookOpen, 
    Moon, 
    Sun, 
    Volume2, 
    Radio, 
    Search, 
    Heart, 
    Compass,
    Sparkles,
    ScrollText,
    SlidersHorizontal,
    Languages
} from '@lucide/vue';

defineProps({
    title: {
        type: String,
        default: "Anisul Qur'an",
    },
});

const emit = defineEmits(['select-reciter']);

const page = usePage();
const userPreferences = useUserPreferences();
const { isDrawerOpen, openDrawer, isDark, toggleTheme } = userPreferences;
const { t, currentLocale, setLocale } = useI18n();
const reciters = computed(() => page.props.reciters || []);

const switchLocale = (newLocale) => {
    if (currentLocale.value === newLocale) return;
    setLocale(newLocale);
    router.reload({
        preserveScroll: true,
        preserveState: true,
    });
};
</script>

<template>
    <div class="min-h-screen flex flex-col bg-background text-foreground">
        <Head :title="title ? `${title} - Anisul Qur'an` : 'Anisul Qur\'an - Pemutar & Pembaca Al-Qur\'an Interaktif'" />

        <!-- Navigation Header -->
        <header class="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-all">
            <div class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
                <!-- Logo & Brand -->
                <Link href="/" class="inline-flex min-h-11 items-center group shrink-0">
                    <AppLogo size="38" show-text />
                </Link>

                <!-- Navigation Links & Action Controls -->
                <nav aria-label="Navigasi utama dan preferensi" class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    <Link 
                        href="/" 
                        class="hidden lg:inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Compass class="h-4 w-4" />
                        {{ t('nav.surah_list') }}
                    </Link>

                    <!-- Language Switcher Pill (ID | EN) — Available in SettingsDrawer on mobile (< 640px) -->
                    <div
                        role="group"
                        aria-label="Pilih Bahasa Terjemahan"
                        class="hidden sm:flex items-center p-0.5 rounded-xl border border-border/80 bg-card/80 text-xs font-bold backdrop-blur-md shadow-2xs"
                    >
                        <button
                            type="button"
                            @click="switchLocale('id')"
                            :aria-pressed="currentLocale === 'id'"
                            :class="currentLocale === 'id' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            title="Bahasa Indonesia (Kemenag RI)"
                            aria-label="Bahasa Indonesia"
                        >
                            ID
                        </button>
                        <button
                            type="button"
                            @click="switchLocale('en')"
                            :aria-pressed="currentLocale === 'en'"
                            :class="currentLocale === 'en' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            title="English (The Clear Quran)"
                            aria-label="English"
                        >
                            EN
                        </button>
                    </div>

                    <!-- Global Suasana / Vibe Switcher (Noor, Midnight, Warqah) -->
                    <div
                        role="group"
                        aria-label="Suasana Visual Aplikasi"
                        class="flex items-center p-0.5 rounded-xl border border-border/80 bg-card/80 text-xs font-semibold backdrop-blur-md shadow-2xs"
                    >
                        <button
                            type="button"
                            @click="userPreferences.setAppVibe('noor')"
                            :aria-label="t('nav.vibe_noor')"
                            :aria-pressed="userPreferences.preferences.appVibe === 'noor'"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-1.5 rounded-lg transition-all cursor-pointer gap-1.5"
                            :class="userPreferences.preferences.appVibe === 'noor'
                                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'"
                            :title="t('nav.vibe_noor')"
                        >
                            <Sparkles class="h-4 w-4 shrink-0" />
                            <span class="hidden md:inline">Noor</span>
                        </button>

                        <button
                            type="button"
                            @click="userPreferences.setAppVibe('midnight')"
                            :aria-label="t('nav.vibe_midnight')"
                            :aria-pressed="userPreferences.preferences.appVibe === 'midnight'"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-1.5 rounded-lg transition-all cursor-pointer gap-1.5"
                            :class="userPreferences.preferences.appVibe === 'midnight'
                                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'"
                            :title="t('nav.vibe_midnight')"
                        >
                            <Moon class="h-4 w-4 shrink-0" />
                            <span class="hidden md:inline">Midnight</span>
                        </button>

                        <button
                            type="button"
                            @click="userPreferences.setAppVibe('warqah')"
                            :aria-label="t('nav.vibe_warqah')"
                            :aria-pressed="userPreferences.preferences.appVibe === 'warqah'"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center px-2.5 py-1.5 rounded-lg transition-all cursor-pointer gap-1.5"
                            :class="userPreferences.preferences.appVibe === 'warqah'
                                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'"
                            :title="t('nav.vibe_warqah')"
                        >
                            <ScrollText class="h-4 w-4 shrink-0" />
                            <span class="hidden md:inline">Warqah</span>
                        </button>
                    </div>

                    <!-- Global Preferences & Settings Trigger Button -->
                    <button
                        @click="openDrawer"
                        type="button"
                        class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        :title="t('settings.title')"
                        :aria-label="t('settings.title')"
                    >
                        <SlidersHorizontal class="h-4 w-4" />
                    </button>

                    <!-- Dark / Light Theme Toggle -->
                    <button 
                        @click="toggleTheme" 
                        type="button" 
                        class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        :title="t('nav.theme_toggle')"
                        :aria-label="t('nav.theme_toggle')"
                    >
                        <Sun v-if="isDark" class="h-4 w-4 transition-transform rotate-0 scale-100" />
                        <Moon v-else class="h-4 w-4 transition-transform rotate-0 scale-100" />
                    </button>
                </nav>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 pb-24">
            <slot />
        </main>

        <!-- Footer -->
        <footer class="border-t border-border bg-card/50 text-muted-foreground text-xs py-8">
            <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div class="flex flex-col gap-1">
                    <p class="font-medium text-foreground">
                        Anisul Qur'an • أنِيسُ القُرْآن
                    </p>
                    <p>
                        Data resmi & audio tilawah didukung oleh 
                        <a href="https://quran.foundation" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary transition-colors">
                            Quran Foundation
                        </a> & Terjemahan Kemenag RI.
                    </p>
                </div>
                <div class="flex items-center gap-1 text-muted-foreground">
                    <span>Dirancang dengan penuh cinta untuk umat</span>
                    <Heart class="h-3.5 w-3.5 text-destructive fill-destructive inline" />
                </div>
            </div>
        </footer>

        <!-- Global Settings & Preferences Right Drawer -->
        <SettingsDrawer :reciters="reciters" @select-reciter="emit('select-reciter', $event)" />
    </div>
</template>
