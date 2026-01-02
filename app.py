from flask import Flask, abort, render_template, request, send_from_directory
import os

app = Flask(__name__)

music_directory = ""
songs_cache = []


def scan_songs(path):
    songs = []
    for name in sorted(os.listdir(path)):
        full_path = os.path.join(path, name)
        if not os.path.isfile(full_path):
            continue
        _, ext = os.path.splitext(name)
        if ext.lower() in (".mp3", ".wav", ".ogg"):
            songs.append(name)
    return songs


@app.route("/", methods=["GET", "POST"])
def index():
    global music_directory, songs_cache

    error = ""
    if request.method == "POST":
        path = request.form.get("music_directory", "").strip()
        if path and os.path.isdir(path):
            music_directory = path
            songs_cache = scan_songs(path)
        else:
            music_directory = path
            songs_cache = []
            error = "Folder not found. Enter a valid path."

    return render_template(
        "index.html",
        music_directory=music_directory,
        songs=songs_cache,
        error=error,
    )


@app.route("/play/<path:filename>")
def play(filename):
    if not music_directory or filename not in songs_cache:
        abort(404)
    return send_from_directory(music_directory, filename)


if __name__ == "__main__":
    app.run(debug=True)
