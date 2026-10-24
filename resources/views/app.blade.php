<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <title inertia>{{ config('app.name', "Anisul Qur'an") }}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">

        <!-- Google Fonts: Fraunces, Nunito Sans & Arabic Fonts (Amiri, Scheherazade New, Noto Naskh Arabic, Gulzar) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <!-- Runtime Reverb Configuration for real-time WebSocket sync -->
        @php
            $reverbKey = config('reverb.apps.apps.0.key');
            $reverbHost = config('reverb.apps.apps.0.options.host');
            $reverbPort = config('reverb.apps.apps.0.options.port');
            $reverbScheme = config('reverb.apps.apps.0.options.scheme', 'https');
        @endphp
        <script>
            window.__REVERB_CONFIG__ = {
                key: @json($reverbKey),
                host: @json($reverbHost),
                port: @json($reverbPort),
                scheme: @json($reverbScheme),
            };
        </script>

        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <script>
            (function() {
                try {
                    const theme = localStorage.getItem('anisul_theme');
                    const vibe = localStorage.getItem('anisul_app_vibe') || localStorage.getItem('anisul_khusyu_theme') || 'noor';
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (theme === 'dark' || (!theme && (prefersDark || vibe === 'midnight'))) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    document.documentElement.setAttribute('data-vibe', vibe);
                } catch (e) {}
            })();
        </script>
        <x-inertia::head />
        <style>
            #app:empty {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
            }
            #app:empty::before {
                content: "Anisul Qur'an • أنِيسُ القُرْآن";
                font-weight: 700;
                font-size: 1.125rem;
                letter-spacing: -0.01em;
                opacity: 0.85;
            }
            #app:empty::after {
                content: "Memuat halaman tilawah...";
                font-size: 0.8125rem;
                opacity: 0.6;
            }
        </style>
    </head>
    <body class="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary">
        <x-inertia::app />
    </body>
</html>