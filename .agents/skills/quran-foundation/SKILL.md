---
name: quran-foundation
description: "Guidelines, API reference, SDK boundaries, OAuth2/OIDC flows, and font rendering rules for integrating Quran Foundation APIs (Content, Search, Audio, Tafsir, User APIs, Mushaf font rendering) with Laravel and Vue 3 / Inertia."
license: MIT
metadata:
  author: quran-foundation
---

# Quran Foundation API Integration Guidelines

This skill provides complete guidelines, API references, security boundaries, and architectural patterns for integrating official Quran Foundation APIs, SDKs, and Mushaf rendering within this application.

## Core Rules & Security Boundary

1. **Safe SDK & Runtime Boundary**:
   - **Frontend / Client (Vue 3 / Inertia)**: Use `@quranjs/api/public` only for browser-safe operations (e.g. initiating OAuth PKCE code flow). Never perform confidential operations in client-side code.
   - **Backend / Server (Laravel / Node)**: Perform token exchange, token refresh, Content API queries, Search API queries, audio stream resolving, and signed-in User API calls on the backend.
2. **Secrets Protection**:
   - Never expose `CLIENT_SECRET`, `SESSION_SECRET`, user access tokens, or refresh tokens to browser client bundles, HTML templates, or public logs.
   - Store API credentials in `.env` and configure via `config/services.php`.
3. **Token Separation**:
   - App-level Content/Search credentials must remain separate from individual signed-in user session tokens.
   - Do not call signed-in User APIs (bookmarks, reading history, notes) without a valid user session.
4. **OIDC Logout**:
   - Always preserve standard OpenID Connect end-session logout flow when logging users out.
5. **Mushaf & Font Rendering**:
   - Follow Quran Foundation font rendering standards (King Fahd Complex QCF v1/v2, Uthmani Hafs, IndoPak, Tajweed glyphs) and page layout dimensions.

## Rule Index

| Concern | Read |
| --- | --- |
| Endpoints, Query Parameters, Response Structures | [`rules/api-reference.md`](rules/api-reference.md) |
| OAuth2 / OIDC, PKCE, Sessions, User APIs | [`rules/auth-oauth2.md`](rules/auth-oauth2.md) |
| Fonts, Glyph Rendering, Page Layouts, Tajweed | [`rules/font-mushaf-rendering.md`](rules/font-mushaf-rendering.md) |
| Laravel Service Client, Caching, Inertia Props | [`rules/laravel-integration.md`](rules/laravel-integration.md) |

## Verification Command

Run the official audit doctor whenever checking integration compliance:

```bash
npx @quranjs/create-app@latest doctor
```
