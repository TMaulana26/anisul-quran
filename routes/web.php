<?php

use App\Http\Controllers\SurahController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SurahController::class, 'index'])->name('home');
Route::get('/surah', [SurahController::class, 'index'])->name('surah.index');
Route::get('/surah/{id}', [SurahController::class, 'show'])->name('surah.show');
Route::get('/api/surah/{id}/recitation', [SurahController::class, 'recitation'])->name('surah.recitation');
