<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetAppLocale
{
    /**
     * Supported locales in Anisul Qur'an.
     *
     * @var array<int, string>
     */
    protected array $supportedLocales = ['id', 'en'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('lang');

        if (! $locale || ! in_array($locale, $this->supportedLocales, true)) {
            $locale = $request->cookie('anisul_locale');
        }

        if (! $locale || ! in_array($locale, $this->supportedLocales, true)) {
            $locale = 'id';
        }

        app()->setLocale($locale);

        $response = $next($request);

        // If explicitly set via query param, sync the cookie
        if ($request->query('lang') && in_array($request->query('lang'), $this->supportedLocales, true)) {
            $response->headers->setCookie(cookie('anisul_locale', $locale, 525600, null, null, false, false, false, 'lax'));
        }

        return $response;
    }
}
