<?php

use App\Http\Controllers\ListenTogetherController;
use App\Http\Controllers\SurahController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SurahController::class, 'index'])->name('home');
Route::get('/surah', [SurahController::class, 'index'])->name('surah.index');
Route::get('/surah/{id}', [SurahController::class, 'show'])->whereNumber('id')->name('surah.show');

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/api/surah/{id}/recitation', [SurahController::class, 'recitation'])->whereNumber('id')->name('surah.recitation');
    Route::get('/api/recitation/{id}', [SurahController::class, 'recitation'])->whereNumber('id')->name('api.recitation');
    Route::get('/api/footnote/{id}', [SurahController::class, 'footnote'])->whereNumber('id')->name('surah.footnote');

    // Listen Together Room Endpoints
    Route::post('/api/rooms', [ListenTogetherController::class, 'store'])->name('api.rooms.store');
    Route::get('/api/rooms/{code}', [ListenTogetherController::class, 'show'])->whereAlphaNumeric('code')->name('api.rooms.show');
    Route::post('/api/rooms/{code}/sync', [ListenTogetherController::class, 'sync'])->whereAlphaNumeric('code')->name('api.rooms.sync');
    Route::post('/api/rooms/{code}/heartbeat', [ListenTogetherController::class, 'heartbeat'])->whereAlphaNumeric('code')->name('api.rooms.heartbeat');
    Route::delete('/api/rooms/{code}', [ListenTogetherController::class, 'destroy'])->whereAlphaNumeric('code')->name('api.rooms.destroy');
});

// Join Room Page (Listener / Follower View)
Route::get('/listen/{code}', [ListenTogetherController::class, 'join'])
    ->whereAlphaNumeric('code')
    ->middleware('throttle:30,1')
    ->name('rooms.join');
