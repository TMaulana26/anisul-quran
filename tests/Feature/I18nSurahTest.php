<?php

test('index page serves Indonesian by default', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Index')
        ->has('chapters')
        ->where('locale', 'id')
    );
});

test('index page respects English lang query parameter and cookie', function () {
    $response = $this->get('/?lang=en');

    $response->assertStatus(200);
    $response->assertPlainCookie('anisul_locale', 'en');
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Index')
        ->has('chapters')
        ->where('locale', 'en')
    );
});

test('surah show page loads English translations (Saheeh International) when requested', function () {
    $response = $this->withUnencryptedCookie('anisul_locale', 'en')->get('/surah/1');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Show')
        ->where('locale', 'en')
        ->where('translationInfo.resourceId', 20)
        ->where('translationInfo.sourceName', 'Saheeh International')
        ->has('verses')
    );
});

test('surah show page loads Indonesian translations (Kemenag RI) by default', function () {
    $response = $this->get('/surah/1');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Surah/Show')
        ->where('locale', 'id')
        ->where('translationInfo.resourceId', 33)
        ->where('translationInfo.sourceName', 'Kemenag RI')
        ->has('verses')
    );
});
