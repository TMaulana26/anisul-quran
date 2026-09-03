<script setup>
import { ref, onMounted, computed } from 'vue';
import { Link, Head, usePage } from '@inertiajs/vue3';
import AppLogo from '@/components/AppLogo.vue';
import SettingsDrawer from '@/components/player/SettingsDrawer.vue';
import { useUserPreferences } from '@/composables/useUserPreferences';
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
    SlidersHorizontal
} from '@lucide/vue';

defineProps({
    title: {
        type: String,
        default: "Anisul Qur'an",
    },
});

const page = usePage();
const userPreferences = useUserPreferences();
const { isDrawerOpen, openDrawer } = userPreferences;
const reciters = computed(() => page.props.reciters || []);

const isDark = ref(false);

const toggleTheme = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('anisul_theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('anisul_theme', 'light');
    }
};

onMounted(() => {
    const savedTheme = localStorage.getItem('anisul_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        isDark.value = true;
        document.documentElement.classList.add('dark');
    } else {
        isDark.value = false;
        document.documentElement.classList.remove('dark');
    }
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Head :title="title ? `${title} - Anisul Qur'an` : 'Anisul Qur\'an - Pemutar & Pembaca Al-Qur\'an Interaktif'" />

        <!-- Navigation Header -->
        <header class="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-all">
            <div class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <!-- Logo & Brand -->
                <Link href="/" class="flex items-center group">
                    <AppLogo size="38" show-text />
                </Link>

                <!-- Navigation Links & Action Controls -->
                <nav class="flex items-center gap-2 sm:gap-3">
                    <Link 
                        href="/" 
                        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Compass class="h-4 w-4" />
                        Daftar Surah
                    </Link>

                    <!-- Global Suasana / Vibe Switcher (Noor, Midnight, Warqah) -->
                    <div class="flex items-center p-1 rounded-xl border border-border/80 bg-card/80 text-xs font-semibold backdrop-blur-md shadow-2xs">
                        <button
                            type="button"
                            @click="userPreferences.setAppVibe('noor')"
                            class="px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                            :class="userPreferences.preferences.appVibe === 'noor'
                                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'"
                            title="Suasana Noor (Zamrud Sejuk)"
                        >
                            <Sparkles class="h-3.5 w-3.5" />
                            <span class="hidden md:inline">Noor</span>
                        </button>

                        <button
                            type="button"
                            @click="userPreferences.setAppVibe('midnight')"
                            class="px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                            :class="userPreferences.preferences.appVibe === 'midnight'
                                ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'"
                            title="Suasana Midnight (Emas Tahajjud)"
                        >
                            <Moon class="h-3.5 w-3.5" />
                            <span class="hidden md:inline">Midnight</span>
                        </button>

                        <button
                            type="button"
                            @click="userPreferences.setAppVibe('warqah')"
                            class="px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                            :class="userPreferences.preferences.appVibe === 'warqah'
                                ? 'bg-amber-800 dark:bg-amber-600 text-white shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'"
                            title="Suasana Warqah (Perkamen Klasik)"
                        >
                            <ScrollText class="h-3.5 w-3.5" />
                            <span class="hidden md:inline">Warqah</span>
                        </button>
                    </div>

                    <!-- Global Preferences & Settings Trigger Button -->
                    <button
                        @click="openDrawer"
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        title="Pengaturan & Preferensi Pengguna"
                        aria-label="Buka Pengaturan"
                    >
                        <SlidersHorizontal class="h-4 w-4" />
                    </button>

                    <!-- Dark / Light Theme Toggle -->
                    <button 
                        @click="toggleTheme" 
                        type="button" 
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
                        aria-label="Toggle theme"
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
        <SettingsDrawer :reciters="reciters" />
    </div>
</template>
