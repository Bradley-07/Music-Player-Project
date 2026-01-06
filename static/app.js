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
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const muteBtn = document.getElementById("muteBtn");
const themeButtons = document.querySelectorAll(".theme-btn");
const bgSwatches = document.querySelectorAll(".bg-swatch");
const bgColorPicker = document.getElementById("bgColorPicker");
const audioBgPicker = document.getElementById("audioBgPicker");
const repeatBtn = document.getElementById("repeatBtn");
const playlistToast = document.getElementById("playlistToast");
const queueList = document.getElementById("queueList");
const clearQueueBtn = document.getElementById("clearQueueBtn");

let currentIndex = -1;
let activePlaylist = "All Songs";
let targetPlaylist = "";
let songButtons = [];
let allSongs = [];
let shuffleEnabled = false;
let shuffleHistory = [];
let repeatEnabled = false;
let isSeeking = false;
let previousVolume = 1;
let toastTimer = null;
const durationCache = {};
let queue = [];
const playlists = {
  "All Songs": [],
};

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
  localStorage.setItem("theme", theme);
}

function hexToRgb(value) {
  if (!value) {
    return null;
  }
  let hex = value.replace("#", "").trim();
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length !== 6) {
    return null;
  }
  const number = Number.parseInt(hex, 16);
  if (Number.isNaN(number)) {
    return null;
  }
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

function applyBackground(color) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return;
  }
  const glow1 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.36)`;
  const glow2 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
  document.body.style.setProperty("--bg-glow-1", glow1);
  document.body.style.setProperty("--bg-glow-2", glow2);
  localStorage.setItem("bgColor", color);
  if (bgColorPicker) {
    bgColorPicker.value = color;
  }
  bgSwatches.forEach((swatch) => {
    swatch.classList.toggle(
      "active",
      swatch.dataset.color?.toLowerCase() === color.toLowerCase(),
    );
  });
}

function applyAudioBackground(color) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return;
  }
  const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.65)`;
  const border = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
  document.body.style.setProperty("--audio-bg", bg);
  document.body.style.setProperty("--audio-border", border);
  localStorage.setItem("audioBg", color);
  if (audioBgPicker) {
    audioBgPicker.value = color;
  }
}

function updateMuteButton() {
  if (!muteBtn) {
    return;
  }
  muteBtn.classList.toggle("muted", audioPlayer.muted);
}

function updateRangeBackground(range, percent) {
  if (!range) {
    return;
  }
  const clamped = Math.min(100, Math.max(0, percent));
  range.style.background = `linear-gradient(90deg, var(--accent) ${clamped}%, rgba(255, 255, 255, 0.16) ${clamped}%)`;
}

function showToast(message) {
  if (!playlistToast) {
    return;
  }
  playlistToast.textContent = message;
  playlistToast.classList.add("show");
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    playlistToast.classList.remove("show");
  }, 5000);
}

const storedTheme = localStorage.getItem("theme");
const prefersLight =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: light)").matches;
const initialTheme = storedTheme || (prefersLight ? "light" : "dark");
applyTheme(initialTheme);

const storedBgColor = localStorage.getItem("bgColor") || "#3d8bfd";
applyBackground(storedBgColor);

const storedAudioBg = localStorage.getItem("audioBg") || "#14141a";
applyAudioBackground(storedAudioBg);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.theme);
  });
});

bgSwatches.forEach((swatch) => {
  if (swatch.dataset.color) {
    swatch.style.setProperty("--swatch-color", swatch.dataset.color);
  }
  swatch.addEventListener("click", () => {
    const color = swatch.dataset.color;
    if (color) {
      applyBackground(color);
    }
  });
});

if (bgColorPicker) {
  bgColorPicker.addEventListener("input", () => {
    applyBackground(bgColorPicker.value);
  });
}

if (audioBgPicker) {
  audioBgPicker.addEventListener("input", () => {
    applyAudioBackground(audioBgPicker.value);
  });
}

if (seekBar) {
  seekBar.addEventListener("input", () => {
    isSeeking = true;
    if (Number.isFinite(audioPlayer.duration)) {
      const previewTime = (Number(seekBar.value) / 100) * audioPlayer.duration;
      currentTimeDisplay.textContent = formatTime(previewTime);
    }
    updateRangeBackground(seekBar, Number(seekBar.value));
  });

  seekBar.addEventListener("change", () => {
    if (Number.isFinite(audioPlayer.duration)) {
      audioPlayer.currentTime =
        (Number(seekBar.value) / 100) * audioPlayer.duration;
    }
    isSeeking = false;
    updateRangeBackground(seekBar, Number(seekBar.value));
  });
}

if (volumeBar) {
  const storedVolume = localStorage.getItem("volume");
  if (storedVolume !== null) {
    const parsedVolume = Number.parseFloat(storedVolume);
    if (Number.isFinite(parsedVolume)) {
      audioPlayer.volume = Math.min(1, Math.max(0, parsedVolume));
      volumeBar.value = String(audioPlayer.volume);
      previousVolume = audioPlayer.volume;
    }
  }
  updateRangeBackground(volumeBar, audioPlayer.volume * 100);

  volumeBar.addEventListener("input", () => {
    const newVolume = Number.parseFloat(volumeBar.value);
    if (Number.isFinite(newVolume)) {
      audioPlayer.volume = Math.min(1, Math.max(0, newVolume));
      localStorage.setItem("volume", String(audioPlayer.volume));
      if (audioPlayer.volume > 0) {
        previousVolume = audioPlayer.volume;
      }
      if (audioPlayer.muted && audioPlayer.volume > 0) {
        audioPlayer.muted = false;
      }
      updateMuteButton();
      updateRangeBackground(volumeBar, audioPlayer.volume * 100);
    }
  });
}

if (muteBtn) {
  const storedMuted = localStorage.getItem("muted") === "true";
  audioPlayer.muted = storedMuted;
  updateMuteButton();

  muteBtn.addEventListener("click", () => {
    audioPlayer.muted = !audioPlayer.muted;
    if (!audioPlayer.muted && audioPlayer.volume === 0) {
      audioPlayer.volume = previousVolume || 1;
      if (volumeBar) {
        volumeBar.value = String(audioPlayer.volume);
      }
    }
    localStorage.setItem("muted", audioPlayer.muted ? "true" : "false");
    updateMuteButton();
  });
}


if (repeatBtn) {
  const storedRepeat = localStorage.getItem("repeat") === "true";
  repeatEnabled = storedRepeat;
  repeatBtn.classList.toggle("active", repeatEnabled);
  repeatBtn.setAttribute("aria-pressed", repeatEnabled ? "true" : "false");
  audioPlayer.loop = repeatEnabled;
}

function syncRepeatSetting(enabled) {
  fetch("/repeat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enabled }),
  }).catch(() => {});
}

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
    const info = parseSongInfo(song.name);
    songBtn.textContent = info.title;
    row.appendChild(songBtn);

    const artist = document.createElement("span");
    artist.className = "song-artist";
    artist.textContent = info.artist || "Unknown";
    row.appendChild(artist);

    const duration = document.createElement("span");
    duration.className = "song-duration";
    duration.dataset.file = song.name;
    duration.textContent = durationCache[song.name]
      ? formatTime(durationCache[song.name])
      : "--:--";
    row.appendChild(duration);

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

    const queueBtn = document.createElement("button");
    queueBtn.className = "queue-btn";
    queueBtn.type = "button";
    queueBtn.textContent = "Queue";
    queueBtn.addEventListener("click", () => {
      addToQueue(song);
    });
    row.appendChild(queueBtn);

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
  preloadDurations(songs);
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
  nowPlaying.textContent = formatSongTitle(file);
  audioPlayer.src = button.dataset.url;
  audioPlayer.play();
  playPauseIcon.src = "/static/pause.png";
  playPauseIcon.alt = "Pause";
}

function playSongFromQueue(item) {
  if (!item) {
    return;
  }
  const index = songButtons.findIndex(
    (button) => button.dataset.file === item.name,
  );
  if (index >= 0) {
    playAtIndex(index);
    return;
  }
  songButtons.forEach((button) => button.classList.remove("active"));
  currentIndex = -1;
  nowPlaying.textContent = formatSongTitle(item.name);
  audioPlayer.src = item.url;
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
    showToast(`Added "${song.name}" to ${targetPlaylist}.`);
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

function deletePlaylist(name) {
  if (name === "All Songs") {
    return;
  }
  delete playlists[name];
  const item = playlistList.querySelector(
    `.playlist-item[data-playlist="${CSS.escape(name)}"]`,
  );
  if (item) {
    item.remove();
  }
  if (activePlaylist === name) {
    setActivePlaylist("All Songs");
  } else {
    renderActivePlaylist();
  }
  updatePlaylistSelect();
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
  if (repeatEnabled) {
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    playAtIndex(safeIndex);
    return;
  }
  if (queue.length > 0) {
    const nextItem = queue.shift();
    renderQueue();
    playSongFromQueue(nextItem);
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
  if (queue.length > 0) {
    const nextItem = queue.shift();
    renderQueue();
    playSongFromQueue(nextItem);
    return;
  }
  let nextIndex = (currentIndex + 1) % songButtons.length;
  if (shuffleEnabled && songButtons.length > 1) {
    nextIndex = getRandomIndex(currentIndex);
  }
  playAtIndex(nextIndex);
});

audioPlayer.addEventListener("timeupdate", () => {
  if (!isSeeking) {
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  }
  durationDisplay.textContent = formatTime(audioPlayer.duration);
  if (seekBar && Number.isFinite(audioPlayer.duration) && audioPlayer.duration) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    if (!isSeeking) {
      seekBar.value = String(progress);
    }
    updateRangeBackground(seekBar, progress);
  }
  audioPlayer.title = `${currentTimeDisplay.textContent} / ${durationDisplay.textContent}`;
});

audioPlayer.addEventListener("loadedmetadata", () => {
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  durationDisplay.textContent = formatTime(audioPlayer.duration);
  if (seekBar) {
    seekBar.value = "0";
    updateRangeBackground(seekBar, 0);
  }
  if (Number.isFinite(audioPlayer.duration) && songButtons[currentIndex]) {
    const file = songButtons[currentIndex].dataset.file;
    durationCache[file] = audioPlayer.duration;
    updateDurationDisplays(file, audioPlayer.duration);
  }
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
  const label = document.createElement("span");
  label.className = "playlist-label";
  label.textContent = name;
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "playlist-delete";
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    deletePlaylist(name);
  });
  li.appendChild(label);
  li.appendChild(deleteBtn);
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

if (clearQueueBtn) {
  clearQueueBtn.addEventListener("click", clearQueue);
}

if (repeatBtn) {
  repeatBtn.addEventListener("click", () => {
    repeatEnabled = !repeatEnabled;
    audioPlayer.loop = repeatEnabled;
    repeatBtn.classList.toggle("active", repeatEnabled);
    repeatBtn.setAttribute("aria-pressed", repeatEnabled ? "true" : "false");
    localStorage.setItem("repeat", repeatEnabled ? "true" : "false");
    syncRepeatSetting(repeatEnabled);
  });
}

initAllSongsFromDom();
renderQueue();

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatSongTitle(filename) {
  if (!filename) {
    return "Unknown";
  }
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const title = withoutExt.split(" - ")[0];
  return title.trim() || withoutExt.trim();
}

function parseSongInfo(filename) {
  const title = formatSongTitle(filename);
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const parts = withoutExt.split(" - ");
  let artist = parts.length > 1 ? parts.slice(1).join(" - ") : "";
  artist = artist.replace(/\s*[\[(].*?[\])]\s*$/g, "").trim();
  return {
    title,
    artist,
  };
}

function updateDurationDisplays(file, duration) {
  const display = formatTime(duration);
  document.querySelectorAll(`.song-duration[data-file="${CSS.escape(file)}"]`)
    .forEach((element) => {
      element.textContent = display;
    });
}

function addToQueue(song) {
  queue.push(song);
  renderQueue();
  showToast(`Queued "${formatSongTitle(song.name)}".`);
}

function removeFromQueue(index) {
  queue.splice(index, 1);
  renderQueue();
}

function clearQueue() {
  queue = [];
  renderQueue();
}

function renderQueue() {
  if (!queueList) {
    return;
  }
  queueList.innerHTML = "";
  if (queue.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Queue is empty.";
    queueList.appendChild(empty);
    return;
  }
  queue.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "queue-item";
    const title = document.createElement("span");
    title.className = "queue-title";
    title.textContent = formatSongTitle(item.name);
    const removeBtn = document.createElement("button");
    removeBtn.className = "queue-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromQueue(index));
    li.appendChild(title);
    li.appendChild(removeBtn);
    queueList.appendChild(li);
  });
}

function preloadDurations(songs) {
  songs.forEach((song) => {
    if (durationCache[song.name]) {
      return;
    }
    const probe = new Audio();
    probe.preload = "metadata";
    probe.src = song.url;
    probe.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(probe.duration)) {
        durationCache[song.name] = probe.duration;
        updateDurationDisplays(song.name, probe.duration);
      }
      probe.src = "";
    });
  });
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
