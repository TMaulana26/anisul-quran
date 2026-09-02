<script setup>
import { ref, onMounted } from 'vue';
import { Link, Head } from '@inertiajs/vue3';
import AppLogo from '@/components/AppLogo.vue';
import { 
    BookOpen, 
    Moon, 
    Sun, 
    Volume2, 
    Radio, 
    Search, 
    Heart, 
    Compass,
    Sparkles 
} from '@lucide/vue';

defineProps({
    title: {
        type: String,
        default: "Anisul Qur'an",
    },
});

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
                <nav class="flex items-center gap-2 sm:gap-4">
                    <Link 
                        href="/" 
                        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Compass class="h-4 w-4" />
                        Daftar Surah
                    </Link>

                    <!-- Dark / Light Theme Toggle -->
                    <button 
                        @click="toggleTheme" 
                        type="button" 
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
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
    </div>
</template>
