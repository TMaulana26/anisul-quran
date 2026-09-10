<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            $status = $response->getStatusCode();

            // Render custom Inertia Error page for 404s and production errors
            if (in_array($status, [404, 403, 500, 503]) && ! $request->is('api/*') && ! $request->expectsJson()) {
                if ($status === 404 || ! app()->environment(['local', 'testing'])) {
                    return Inertia::render('Error', [
                        'status' => $status,
                    ])
                        ->toResponse($request)
                        ->setStatusCode($status);
                }
            }

            return $response;
        });
    })->create();
