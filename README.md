# Music Player Project Wiki

This repo includes two ways to play local music:
- A Flask web player with playlists, shuffle, and an in-browser audio UI.
- A Tkinter desktop player powered by pygame.

## Setup

### Prerequisites
- Python 3.10+ installed and on PATH
- pip available
- For the desktop app, an audio output device that pygame can use

### Install dependencies

```bash
pip install flask pygame
```

### Run the apps

Web app (Flask):

```bash
python app.py
```

Desktop app (Tkinter):

```bash
python main.py
```

### Music files
Supported formats:
- Web app: .mp3, .wav, .ogg
- Desktop app: .mp3

## Web App Usage (Flask)

### Start the server
```bash
python app.py
```
Open the local URL shown in the terminal (usually http://127.0.0.1:5000).

### Load music
Two ways to load songs:
1) Type a folder path and click Load. The server scans the folder and serves audio via `/play/<filename>`.
2) Click Choose Folder to pick a directory in the browser. This loads files directly in the browser using the File API (no server scan).

Notes:
- On startup, the web app will auto-load the `songs` folder in the project root if it exists.
- You can override the auto-load folder with `MUSIC_DIR` (for example: `set MUSIC_DIR=C:\Music` on Windows).
- The path-based Load requires the folder to exist on the machine running Flask.
- The folder picker uses `webkitdirectory` and works best in Chrome or Edge.
- Songs shown in the list are local only; nothing is uploaded.

### Play controls
- Click a song to play it
- Play/Pause, Next, Previous control the HTML5 audio element
- Shuffle toggles random next selection

### Playlists (web)
- Create a playlist in the left panel
- Select a target playlist, then click Add next to a song
- In a playlist view, use Remove to remove a song from that playlist

Behavior details:
- All Songs always shows every loaded song
- Playlists are saved per browser using localStorage when songs are loaded from the server path
- Shuffle keeps a history for Previous

## Desktop App Usage (Tkinter)

### Start the app
```bash
python main.py
```

### Load music
- Use Menu -> Select Folder to pick a directory
- The app scans for `.mp3` files and populates the list

### Play controls
- Click Play to start the selected song
- Click Pause to pause and Play again to resume
- Next and Previous cycle through the list

Notes:
- The desktop app only loads `.mp3` files
- If nothing plays, verify the file format and that pygame is installed

## Architecture

### Components
- `app.py`: Flask server that renders the web UI and serves audio files from a selected directory
- `templates/index.html`: Web UI layout and controls
- `static/app.js`: Client-side logic for song lists, playlists, and audio playback
- `static/style.css`: Web UI styling
- `main.py`: Tkinter desktop UI for local playback
- `player.py`: Thin pygame wrapper used by the desktop app

### Web app flow
1) User enters a folder path and submits the form
2) Flask scans the directory and returns a list of songs
3) The UI renders song buttons; clicking a song sets the `<audio>` source to `/play/<filename>`
4) The server serves the audio file from the selected folder

### Browser folder flow
1) User clicks Choose Folder and selects a directory
2) `static/app.js` filters local files and creates object URLs
3) Playback happens fully in the browser (no server access needed)

### Playlists
Playlists live in memory in `static/app.js` only. They are not saved to disk.

## Project Structure

```
.
|-- app.py
|-- main.py
|-- player.py
|-- templates/
|   |-- index.html
|-- static/
|   |-- app.js
|   |-- style.css
|   |-- play.png
|   |-- pause.png
|   |-- next.png
|   |-- previous.png
|-- Songs (Jazz)/
|-- wiki/
```

Notes:
- `Songs (Jazz)` is a local sample folder (not required for the app to run)
- Web assets live in `static/` and are referenced by `templates/index.html`

## Troubleshooting

### Folder not found (web app)
- Check the path exists on the machine running Flask
- Use a full path such as `C:\Users\<you>\Music`

### Songs do not appear
- Web app: only .mp3, .wav, .ogg are listed
- Desktop app: only .mp3 are listed

### No audio playback
- Confirm the file is not corrupted
- Web app: try a different browser
- Desktop app: ensure `pygame` is installed and your audio device is working

### Choose Folder does not work
- The folder picker requires Chromium-based browsers for `webkitdirectory`
- Use the path input instead as a fallback

### Playlist add button disabled
- Select a target playlist in the dropdown first

## FAQ

### Does the web app upload my music?
No. The app only reads local files. The Choose Folder path uses browser object URLs, and the path input serves files from your local machine only.

### Why are playlists gone after refresh?
Playlists are stored in memory in `static/app.js` and are not persisted.

### Can I use .flac files?
Not with the current code. Only .mp3, .wav, .ogg are included in the web app, and only .mp3 in the desktop app.

### Can I run both apps?
Yes. The Flask web app and Tkinter desktop app are independent.
