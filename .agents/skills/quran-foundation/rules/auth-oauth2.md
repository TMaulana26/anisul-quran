# Quran Foundation OAuth2 & User APIs

Quran Foundation supports OpenID Connect (OIDC) / OAuth2 for user authentication and synchronizing user data (reading history, bookmarks, notes, collections).

## OAuth2 & OIDC Authentication Flow

### 1. Initiation (PKCE Flow)
- Generate a cryptographically secure `code_verifier` and its `code_challenge` (S256).
- Redirect user to the authorization endpoint:
  ```text
  GET https://auth.quran.foundation/oauth2/auth
    ?client_id={CLIENT_ID}
    &response_type=code
    &redirect_uri={REDIRECT_URI}
    &scope=openid profile email offline_access user.read user.write
    &code_challenge={CODE_CHALLENGE}
    &code_challenge_method=S256
    &state={SECURE_RANDOM_STATE}
  ```

### 2. Token Exchange (Confidential Server-side)
- Handle the callback route on Laravel backend (`/auth/quran/callback`).
- Exchange the authorization code for tokens via backend HTTP client:
  ```text
  POST https://auth.quran.foundation/oauth2/token
    grant_type=authorization_code
    code={AUTH_CODE}
    redirect_uri={REDIRECT_URI}
    client_id={CLIENT_ID}
    client_secret={CLIENT_SECRET}
    code_verifier={CODE_VERIFIER}
  ```
- Store the returned `access_token` and `refresh_token` in encrypted server-side session or database.

### 3. Signed-in User APIs
- `GET /user/profile` — Fetch user profile.
- `GET /user/bookmarks` — List bookmarks.
- `POST /user/bookmarks` — Save a bookmark.
- `DELETE /user/bookmarks/{id}` — Remove a bookmark.
- `GET /user/notes` — Read user notes per ayah.
- `POST /user/notes` — Create/update a note.
- `GET /user/reading_sessions` — Sync reading streaks and history.

### 4. OIDC Logout
- When logging out, redirect to the OIDC end-session endpoint to terminate SSO session:
  ```text
  GET https://auth.quran.foundation/oauth2/logout
    ?id_token_hint={ID_TOKEN}
    &post_logout_redirect_uri={LOGOUT_REDIRECT_URI}
  ```
