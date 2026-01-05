# Troubleshooting

## Folder not found (web app)
- Check the path exists on the machine running Flask.
- Use a full path such as `C:\Users\<you>\Music`.

## Songs do not appear
- Web app: only .mp3, .wav, .ogg are listed.
- Desktop app: only .mp3 are listed.

## No audio playback
- Confirm the file is not corrupted.
- Web app: try a different browser.
- Desktop app: ensure `pygame` is installed and your audio device is working.

## Choose Folder does not work
- The folder picker requires Chromium-based browsers for `webkitdirectory`.
- Use the path input instead as a fallback.

## Playlist add button disabled
- Select a target playlist in the dropdown first.
