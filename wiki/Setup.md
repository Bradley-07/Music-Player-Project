# Setup

## Prerequisites
- Python 3.10+ installed and on PATH.
- pip available.
- For the desktop app, an audio output device that pygame can use.

## Install dependencies
Run this once in the project folder:

```bash
pip install flask pygame
```

## Run the apps

Web app (Flask):

```bash
python app.py
```

Desktop app (Tkinter):

```bash
python main.py
```

## Music files
The apps load local audio files from a folder on your machine. Supported formats:
- Web app: .mp3, .wav, .ogg
- Desktop app: .mp3
