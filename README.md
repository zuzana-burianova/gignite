# Setlist Manager

Concert playlist manager — shows current and next song, advances via Bluetooth foot pedal.

## Setup

### 1. Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create an app (name/description can be anything)
3. In app settings, add these **Redirect URIs**:
   - `http://localhost:5173/callback` (development)
   - `https://your-deployed-url.com/callback` (production, when you deploy)
4. Copy your **Client ID**

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Client ID:

```
VITE_SPOTIFY_CLIENT_ID=abc123...
VITE_REDIRECT_URI=http://localhost:5173/callback
```

### 3. Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` on your phone (or computer to test).

## Usage

1. **Login** — tap "Connect Spotify" and authorize
2. **Setup** — pick a playlist from your Spotify library; configure the foot pedal key if needed
3. **Stage** — large display shows current song + next song

### Foot pedal

The app defaults to `Space` as the advance key. Most BT pedals can be configured to send different keys. To change:
- Go to Setup → tap "Change" next to Foot Pedal Key
- Press the pedal once to capture its key

Tap anywhere on the stage screen also advances, as a fallback.

### Offline

Once a setlist is loaded, it's cached. If you lose internet during the show, the stage view keeps working.

## Deploying

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages). Update the redirect URI in your Spotify app settings to match your deployment URL.

> Wake Lock (screen stays on) requires HTTPS — it won't work over plain HTTP except on localhost.
