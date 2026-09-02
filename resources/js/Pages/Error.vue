<script setup>
import { computed } from 'vue';
import { Link, Head } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import { Compass, Home, RefreshCw, AlertCircle, ShieldAlert, ServerCrash, FileQuestion } from '@lucide/vue';

const props = defineProps({
    status: {
        type: Number,
        default: 404,
    },
    message: {
        type: String,
        default: null,
    },
});

const title = computed(() => {
    return {
        404: 'Halaman Tidak Ditemukan',
        500: 'Terjadi Kesalahan Server',
        503: 'Layanan Sedang Pemeliharaan',
        403: 'Akses Dibatasi',
    }[props.status] || 'Terjadi Kendala';
});

const description = computed(() => {
    if (props.message) return props.message;

    return {
        404: 'Maaf, surah, ayat, atau halaman yang Anda tuju tidak ditemukan atau URL mungkin salah ketik.',
        500: 'Server kami sedang mengalami kendala teknis internal. Tim kami sedang menanganinya.',
        503: 'Aplikasi sedang dalam peningkatan sistem berkala demi kenyamanan tilawah Anda. Silakan coba kembali sesaat lagi.',
        403: 'Anda tidak memiliki hak akses untuk membuka halaman atau direktori ini.',
    }[props.status] || 'Terjadi kesalahan yang tidak terduga saat memuat data.';
});

const reloadPage = () => {
    window.location.reload();
};
</script>

<template>
    <AppLayout :title="`${status} - ${title}`">
        <div class="container mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center space-y-8">
            <!-- Error Icon & Status Code Badge -->
            <div class="relative inline-flex items-center justify-center">
                <!-- Glowing background halo -->
                <div class="absolute -inset-4 rounded-full bg-primary/10 blur-xl"></div>
                
                <div class="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border border-border bg-card shadow-lg text-primary">
                    <FileQuestion v-if="status === 404" class="h-12 w-12 sm:h-14 sm:w-14" />
                    <ServerCrash v-else-if="status === 500" class="h-12 w-12 sm:h-14 sm:w-14 text-destructive" />
                    <ShieldAlert v-else-if="status === 403" class="h-12 w-12 sm:h-14 sm:w-14 text-amber-500" />
                    <AlertCircle v-else class="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
                </div>
            </div>

            <!-- Error Code & Title -->
            <div class="space-y-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Status {{ status }}
                </span>
                <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                    {{ title }}
                </h1>
                <p class="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    {{ description }}
                </p>
            </div>

            <!-- Action Navigation Buttons -->
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link 
                    href="/"
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 shadow-sm transition-all duration-200"
                >
                    <Home class="h-4 w-4" />
                    <span>Kembali ke Beranda</span>
                </Link>

                <button 
                    v-if="status >= 500"
                    @click="reloadPage"
                    type="button"
                    class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-muted transition-colors shadow-xs"
                >
                    <RefreshCw class="h-4 w-4" />
                    <span>Muat Ulang Halaman</span>
                </button>
            </div>
        </div>
    </AppLayout>
</template>
