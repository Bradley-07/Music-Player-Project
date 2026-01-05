const songList = document.getElementById("songList");
const playlistList = document.getElementById("playlistList");
const playlistNameInput = document.getElementById("playlistName");
const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const playlistSelect = document.getElementById("playlistSelect");
const audioPlayer = document.getElementById("audioPlayer");
const nowPlaying = document.getElementById("nowPlaying");
const playPauseBtn = document.getElementById("playPauseBtn");
const playPauseIcon = document.getElementById("playPauseIcon");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const chooseFolderBtn = document.getElementById("chooseFolderBtn");
const folderPicker = document.getElementById("folderPicker");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");

let currentIndex = -1;
let activePlaylist = "All Songs";
let targetPlaylist = "";
let songButtons = [];
let allSongs = [];
let shuffleEnabled = false;
let shuffleHistory = [];
const playlists = {
  "All Songs": [],
};

function buildSongList(songs, showAdd, showRemove) {
  songList.innerHTML = "";
  currentIndex = -1;

  if (songs.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty";
    emptyItem.textContent = "No songs loaded yet.";
    songList.appendChild(emptyItem);
    songButtons = [];
    return;
  }

  songs.forEach((song) => {
    const li = document.createElement("li");
    const row = document.createElement("div");
    row.className = "song-row";

    const songBtn = document.createElement("button");
    songBtn.className = "song-item";
    songBtn.dataset.file = song.name;
    songBtn.dataset.url = song.url;
    songBtn.textContent = song.name;
    row.appendChild(songBtn);

    if (showAdd) {
      const addBtn = document.createElement("button");
      addBtn.className = "add-btn";
      addBtn.type = "button";
      addBtn.textContent = "Add";
      addBtn.disabled = !targetPlaylist || targetPlaylist === "All Songs";
      addBtn.addEventListener("click", () => {
        addToPlaylist(song);
      });
      row.appendChild(addBtn);
    }

    if (showRemove) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        removeFromPlaylist(song);
      });
      row.appendChild(removeBtn);
    }

    li.appendChild(row);
    songList.appendChild(li);
  });

  songButtons = Array.from(document.querySelectorAll(".song-item"));
  wireSongButtons();
}

function wireSongButtons() {
  songButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = songButtons.indexOf(button);
      playAtIndex(index);
    });
  });
}

function playAtIndex(index) {
  if (index < 0 || index >= songButtons.length) {
    return;
  }
  currentIndex = index;
  shuffleHistory.push(index);
  songButtons.forEach((item) => item.classList.remove("active"));
  const button = songButtons[index];
  button.classList.add("active");

  const file = button.dataset.file;
  nowPlaying.textContent = file;
  audioPlayer.src = button.dataset.url;
  audioPlayer.play();
  playPauseIcon.src = "/static/pause.png";
  playPauseIcon.alt = "Pause";
}

function togglePlayPause() {
  if (!audioPlayer.src) {
    if (songButtons.length > 0) {
      playAtIndex(0);
    }
    return;
  }
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseIcon.src = "/static/pause.png";
    playPauseIcon.alt = "Pause";
  } else {
    audioPlayer.pause();
    playPauseIcon.src = "/static/play.png";
    playPauseIcon.alt = "Play";
  }
}

function addToPlaylist(song) {
  if (!targetPlaylist || targetPlaylist === "All Songs") {
    return;
  }
  const list = playlists[targetPlaylist];
  const exists = list.some((item) => item.name === song.name);
  if (!exists) {
    list.push(song);
  }
  if (activePlaylist !== "All Songs") {
    renderActivePlaylist();
  }
}

function removeFromPlaylist(song) {
  if (activePlaylist === "All Songs") {
    return;
  }
  playlists[activePlaylist] = playlists[activePlaylist].filter(
    (item) => item.name !== song.name,
  );
  renderActivePlaylist();
}

function setActivePlaylist(name) {
  activePlaylist = name;
  const items = playlistList.querySelectorAll(".playlist-item");
  items.forEach((item) => {
    item.classList.toggle("active", item.dataset.playlist === name);
  });
  renderActivePlaylist();
}

function renderActivePlaylist() {
  if (activePlaylist === "All Songs") {
    buildSongList(allSongs, true, false);
    return;
  }
  const list = playlists[activePlaylist] || [];
  buildSongList(list, false, true);
}

function resetPlaylists() {
  playlistList.innerHTML = "";
  const allItem = document.createElement("li");
  allItem.className = "playlist-item active";
  allItem.dataset.playlist = "All Songs";
  allItem.textContent = "All Songs";
  allItem.addEventListener("click", () => setActivePlaylist("All Songs"));
  playlistList.appendChild(allItem);
  playlists["All Songs"] = [];
  activePlaylist = "All Songs";
  targetPlaylist = "";
  updatePlaylistSelect();
}

function initAllSongsFromDom() {
  const initialButtons = Array.from(document.querySelectorAll(".song-item"));
  allSongs = initialButtons.map((button) => ({
    name: button.dataset.file,
    url: `/play/${encodeURIComponent(button.dataset.file)}`,
  }));
  playlists["All Songs"] = allSongs;
  buildSongList(allSongs, true, false);
  updatePlaylistSelect();
}

playPauseBtn.addEventListener("click", togglePlayPause);

nextBtn.addEventListener("click", () => {
  if (songButtons.length === 0) {
    return;
  }
  let nextIndex = (currentIndex + 1) % songButtons.length;
  if (shuffleEnabled && songButtons.length > 1) {
    nextIndex = getRandomIndex(currentIndex);
  }
  playAtIndex(nextIndex);
});

prevBtn.addEventListener("click", () => {
  if (songButtons.length === 0) {
    return;
  }
  if (shuffleEnabled && shuffleHistory.length > 1) {
    shuffleHistory.pop();
    const prevIndex = shuffleHistory.pop();
    if (typeof prevIndex === "number") {
      playAtIndex(prevIndex);
      return;
    }
  }
  const prevIndex =
    currentIndex <= 0 ? songButtons.length - 1 : currentIndex - 1;
  playAtIndex(prevIndex);
});

audioPlayer.addEventListener("ended", () => {
  if (songButtons.length === 0) {
    return;
  }
  let nextIndex = (currentIndex + 1) % songButtons.length;
  if (shuffleEnabled && songButtons.length > 1) {
    nextIndex = getRandomIndex(currentIndex);
  }
  playAtIndex(nextIndex);
});

audioPlayer.addEventListener("timeupdate", () => {
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  durationDisplay.textContent = formatTime(audioPlayer.duration);
  audioPlayer.title = `${currentTimeDisplay.textContent} / ${durationDisplay.textContent}`;
});

audioPlayer.addEventListener("loadedmetadata", () => {
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  durationDisplay.textContent = formatTime(audioPlayer.duration);
  audioPlayer.title = `${currentTimeDisplay.textContent} / ${durationDisplay.textContent}`;
});

chooseFolderBtn.addEventListener("click", () => {
  folderPicker.click();
});

folderPicker.addEventListener("change", () => {
  const files = Array.from(folderPicker.files || []);
  const audioFiles = files.filter((file) =>
    /\.(mp3|wav|ogg)$/i.test(file.name),
  );

  resetPlaylists();
  if (audioFiles.length === 0) {
    allSongs = [];
    buildSongList([], true, false);
    return;
  }

  allSongs = audioFiles.map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file),
  }));
  playlists["All Songs"] = allSongs;
  buildSongList(allSongs, true, false);
});

createPlaylistBtn.addEventListener("click", () => {
  const name = playlistNameInput.value.trim();
  if (!name || playlists[name]) {
    return;
  }
  playlists[name] = [];
  const li = document.createElement("li");
  li.className = "playlist-item";
  li.dataset.playlist = name;
  li.textContent = name;
  li.addEventListener("click", () => setActivePlaylist(name));
  playlistList.appendChild(li);
  playlistNameInput.value = "";
  setActivePlaylist(name);
  updatePlaylistSelect(name);
});

playlistList.querySelectorAll(".playlist-item").forEach((item) => {
  item.addEventListener("click", () => setActivePlaylist(item.dataset.playlist));
});

playlistSelect.addEventListener("change", () => {
  targetPlaylist = playlistSelect.value;
  renderActivePlaylist();
});

shuffleBtn.addEventListener("click", () => {
  shuffleEnabled = !shuffleEnabled;
  shuffleBtn.classList.toggle("active", shuffleEnabled);
});

initAllSongsFromDom();

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updatePlaylistSelect(selected) {
  const names = Object.keys(playlists).filter((name) => name !== "All Songs");
  playlistSelect.innerHTML = "";

  if (names.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Create a playlist first";
    playlistSelect.appendChild(option);
    playlistSelect.disabled = true;
    targetPlaylist = "";
    return;
  }

  playlistSelect.disabled = false;
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    playlistSelect.appendChild(option);
  });

  if (selected && names.includes(selected)) {
    playlistSelect.value = selected;
  }
  targetPlaylist = playlistSelect.value;
}

function getRandomIndex(current) {
  let index = current;
  while (index === current) {
    index = Math.floor(Math.random() * songButtons.length);
  }
  return index;
}
