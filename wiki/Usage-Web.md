# Web App Usage (Flask)

## Start the server
```bash
python app.py
```
Open the local URL shown in the terminal (usually http://127.0.0.1:5000).

## Load music
There are two ways to load songs:
1) Type a folder path and click Load. The server scans the folder and serves audio via `/play/<filename>`.
2) Click Choose Folder to pick a directory in the browser. This loads files directly in the browser using the File API (no server scan).

### Notes
- The path-based Load requires the folder to exist on the machine running Flask.
- The folder picker uses `webkitdirectory` and works best in Chrome or Edge.
- Songs shown in the list are local only; nothing is uploaded.

## Play controls
- Click a song to play it.
- Play/Pause, Next, Previous control the HTML5 audio element.
- Shuffle toggles random next selection.

## Playlist basics
- Create a playlist in the left panel.
- Select a target playlist, then click Add next to a song.
- In a playlist view, use Remove to remove a song from that playlist.
