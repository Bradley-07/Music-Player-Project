# Architecture

## Components
- `app.py`: Flask server that renders the web UI and serves audio files from a selected directory.
- `templates/index.html`: Web UI layout and controls.
- `static/app.js`: Client-side logic for song lists, playlists, and audio playback.
- `static/style.css`: Web UI styling.
- `main.py`: Tkinter desktop UI for local playback.
- `player.py`: Thin pygame wrapper used by the desktop app.

## Web app flow
1) User enters a folder path and submits the form.
2) Flask scans the directory and returns a list of songs.
3) The UI renders song buttons; clicking a song sets the `<audio>` source to `/play/<filename>`.
4) The server serves the audio file from the selected folder.

## Browser folder flow
1) User clicks Choose Folder and selects a directory.
2) `app.js` filters local files and creates object URLs.
3) Playback happens fully in the browser (no server access needed).

## Playlists
Playlists live in memory in `static/app.js` only. They are not saved to disk.
