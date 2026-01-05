# FAQ

## Does the web app upload my music?
No. The app only reads local files. The Choose Folder path uses browser object URLs, and the path input serves files from your local machine only.

## Why are playlists gone after refresh?
Playlists are stored in memory in `static/app.js` and are not persisted.

## Can I use .flac files?
Not with the current code. Only .mp3, .wav, .ogg are included in the web app, and only .mp3 in the desktop app.

## Can I run both apps?
Yes. The Flask web app and Tkinter desktop app are independent.
