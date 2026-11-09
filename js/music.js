/* =========================================
   AMBIENTDESK — LOCAL MUSIC PLAYER
   File: js/music.js

   Music files remain on the user's device.
   They are NOT uploaded to a server.
========================================= */

export function initMusic() {
    const $ = id => document.getElementById(id);

    const audio = $("audio-player");

    if (!audio) {
        console.warn("Audio player element not found.");
        return {};
    }

    const elements = {
        title: $("track-name"),
        artist: $("track-artist"),
        art: $("album-art"),
        play: $("music-play"),
        previous: $("music-previous"),
        next: $("music-next"),
        volume: $("music-volume"),
        progress: $("music-progress"),
        current: $("music-current"),
        duration: $("music-duration"),
        status: $("music-status"),
        fileInput: $("music-file-input"),
        addButton: $("music-add"),
        playlist: $("music-playlist"),
        shuffle: $("music-shuffle"),
        repeat: $("music-repeat"),
        clear: $("music-clear")
    };

    let playlist = [];
    let currentIndex = -1;
    let shuffleEnabled = false;
    let repeatMode = "off";
    let objectUrls = new Set();

    audio.preload = "metadata";
    audio.volume = Number(elements.volume?.value ?? 60) / 100;

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const remaining = Math.floor(seconds % 60);

        return `${minutes}:${String(remaining).padStart(2, "0")}`;
    }

    function setStatus(message) {
        if (elements.status) {
            elements.status.textContent = message;
        }
    }

    function updatePlayButton() {
        if (!elements.play) return;

        const playing = !audio.paused;

        elements.play.innerHTML = playing
            ? '<i data-lucide="pause"></i>'
            : '<i data-lucide="play"></i>';

        elements.play.setAttribute(
            "aria-label",
            playing ? "Pause music" : "Play music"
        );

        window.lucide?.createIcons();
    }

    function updateTrackInformation() {
        const track = playlist[currentIndex];

        if (!track) {
            if (elements.title) elements.title.textContent = "No music selected";
            if (elements.artist) elements.artist.textContent = "Add songs from your device";
            if (elements.current) elements.current.textContent = "0:00";
            if (elements.duration) elements.duration.textContent = "0:00";
            if (elements.progress) elements.progress.value = 0;
            return;
        }

        if (elements.title) elements.title.textContent = track.name;
        if (elements.artist) elements.artist.textContent = "Your local music";

        if (elements.progress) elements.progress.value = 0;
        if (elements.current) elements.current.textContent = "0:00";
        if (elements.duration) elements.duration.textContent = "0:00";

        if (elements.art) {
            elements.art.style.backgroundImage = "";
        }

        renderPlaylist();
    }

    function renderPlaylist() {
        if (!elements.playlist) return;

        elements.playlist.replaceChildren();

        if (playlist.length === 0) {
            const empty = document.createElement("p");
            empty.className = "playlist-empty";
            empty.textContent = "Your playlist is empty. Add music to get started.";
            elements.playlist.appendChild(empty);
            return;
        }

        playlist.forEach((track, index) => {
            const row = document.createElement("div");
            row.className = "playlist-track";

            if (index === currentIndex) {
                row.classList.add("active");
            }

            const playButton = document.createElement("button");
            playButton.type = "button";
            playButton.className = "playlist-track-select";
            playButton.textContent = `${index + 1}. ${track.name}`;
            playButton.title = `Play ${track.name}`;

            playButton.addEventListener("click", () => {
                loadTrack(index, true);
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "playlist-track-remove";
            removeButton.textContent = "×";
            removeButton.title = "Remove track";
            removeButton.setAttribute("aria-label", `Remove ${track.name}`);

            removeButton.addEventListener("click", () => {
                removeTrack(index);
            });

            row.append(playButton, removeButton);
            elements.playlist.appendChild(row);
        });
    }

    function loadTrack(index, autoplay = false) {
        if (playlist.length === 0) {
            currentIndex = -1;
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            updateTrackInformation();
            updatePlayButton();
            return;
        }

        if (index < 0 || index >= playlist.length) return;

        currentIndex = index;

        const track = playlist[currentIndex];

        audio.src = track.url;
        audio.load();

        updateTrackInformation();
        renderPlaylist();

        if (autoplay) {
            play();
        } else {
            updatePlayButton();
            setStatus("Track ready");
        }
    }

    async function play() {
        if (playlist.length === 0) {
            setStatus("Add music from your device first.");
            elements.fileInput?.click();
            return;
        }

        if (currentIndex === -1) {
            loadTrack(0, false);
        }

        try {
            await audio.play();
            setStatus("Now playing");
        } catch (error) {
            console.warn("Playback could not start:", error);
            setStatus("Unable to play this audio file.");
        }

        updatePlayButton();
    }

    function pause() {
        audio.pause();
        updatePlayButton();
        setStatus("Paused");
    }

    function togglePlayback() {
        if (audio.paused) {
            play();
        } else {
            pause();
        }
    }

    function getNextIndex() {
        if (playlist.length <= 1) return currentIndex;

        if (shuffleEnabled) {
            let next = currentIndex;

            while (next === currentIndex) {
                next = Math.floor(Math.random() * playlist.length);
            }

            return next;
        }

        return (currentIndex + 1) % playlist.length;
    }

    function nextTrack() {
        if (playlist.length === 0) return;

        if (repeatMode === "one") {
            audio.currentTime = 0;
            play();
            return;
        }

        if (!shuffleEnabled && currentIndex === playlist.length - 1 && repeatMode === "off") {
            audio.pause();
            audio.currentTime = 0;
            updatePlayButton();
            setStatus("Playlist finished");
            return;
        }

        loadTrack(getNextIndex(), true);
    }

    function previousTrack() {
        if (playlist.length === 0) return;

        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const previousIndex = currentIndex <= 0
            ? playlist.length - 1
            : currentIndex - 1;

        loadTrack(previousIndex, true);
    }

    function updateProgress() {
        if (!Number.isFinite(audio.duration)) return;

        const percentage = audio.duration > 0
            ? (audio.currentTime / audio.duration) * 100
            : 0;

        if (elements.progress) {
            elements.progress.value = percentage;
        }

        if (elements.current) {
            elements.current.textContent = formatTime(audio.currentTime);
        }

        if (elements.duration) {
            elements.duration.textContent = formatTime(audio.duration);
        }
    }

    function seek() {
        if (!Number.isFinite(audio.duration)) return;

        const percentage = Number(elements.progress?.value ?? 0) / 100;
        audio.currentTime = percentage * audio.duration;
    }

    function setVolume(value) {
        audio.volume = Math.min(1, Math.max(0, Number(value) / 100));
    }

    function addFiles(files) {
        const audioFiles = Array.from(files).filter(file => {
            return file.type.startsWith("audio/") ||
                /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba)$/i.test(file.name);
        });

        if (audioFiles.length === 0) {
            setStatus("No supported audio files were selected.");
            return;
        }

        const newTracks = audioFiles.map(file => {
            const url = URL.createObjectURL(file);
            objectUrls.add(url);

            return {
                name: file.name.replace(/\.[^/.]+$/, ""),
                file,
                url
            };
        });

        const wasEmpty = playlist.length === 0;

        playlist.push(...newTracks);

        renderPlaylist();

        if (wasEmpty) {
            loadTrack(0, false);
        }

        setStatus(`${newTracks.length} track${newTracks.length === 1 ? "" : "s"} added`);
    }

    function removeTrack(index) {
        if (index < 0 || index >= playlist.length) return;

        const removed = playlist[index];

        if (removed.url) {
            URL.revokeObjectURL(removed.url);
            objectUrls.delete(removed.url);
        }

        const wasCurrent = index === currentIndex;

        playlist.splice(index, 1);

        if (playlist.length === 0) {
            currentIndex = -1;
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            updateTrackInformation();
            updatePlayButton();
            renderPlaylist();
            setStatus("Playlist cleared");
            return;
        }

        if (index < currentIndex) {
            currentIndex--;
        } else if (wasCurrent) {
            currentIndex = Math.min(index, playlist.length - 1);
            loadTrack(currentIndex, false);
        }

        renderPlaylist();
        setStatus("Track removed");
    }

    function clearPlaylist() {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();

        for (const url of objectUrls) {
            URL.revokeObjectURL(url);
        }

        objectUrls.clear();
        playlist = [];
        currentIndex = -1;

        updateTrackInformation();
        renderPlaylist();
        updatePlayButton();

        setStatus("Playlist cleared");
    }

    function toggleShuffle() {
        shuffleEnabled = !shuffleEnabled;

        elements.shuffle?.classList.toggle("active", shuffleEnabled);
        elements.shuffle?.setAttribute("aria-pressed", String(shuffleEnabled));

        setStatus(shuffleEnabled ? "Shuffle enabled" : "Shuffle disabled");
    }

    function toggleRepeat() {
        const modes = ["off", "all", "one"];
        const next = (modes.indexOf(repeatMode) + 1) % modes.length;

        repeatMode = modes[next];

        if (elements.repeat) {
            elements.repeat.dataset.mode = repeatMode;
            elements.repeat.classList.toggle("active", repeatMode !== "off");

            const labels = {
                off: "Repeat off",
                all: "Repeat playlist",
                one: "Repeat one track"
            };

            elements.repeat.title = labels[repeatMode];
            elements.repeat.setAttribute("aria-label", labels[repeatMode]);
        }

        setStatus(`Repeat: ${repeatMode}`);
    }

    elements.addButton?.addEventListener("click", () => {
        elements.fileInput?.click();
    });

    elements.fileInput?.addEventListener("change", event => {
        addFiles(event.target.files);
        event.target.value = "";
    });

    elements.play?.addEventListener("click", togglePlayback);
    elements.next?.addEventListener("click", nextTrack);
    elements.previous?.addEventListener("click", previousTrack);
    elements.progress?.addEventListener("input", seek);

    elements.volume?.addEventListener("input", event => {
        setVolume(event.target.value);
    });

    elements.shuffle?.addEventListener("click", toggleShuffle);
    elements.repeat?.addEventListener("click", toggleRepeat);
    elements.clear?.addEventListener("click", clearPlaylist);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    audio.addEventListener("play", () => {
        updatePlayButton();
        setStatus("Now playing");
    });

    audio.addEventListener("pause", updatePlayButton);

    audio.addEventListener("ended", () => {
        if (repeatMode === "one") {
            audio.currentTime = 0;
            play();
        } else if (repeatMode === "all" || currentIndex < playlist.length - 1 || shuffleEnabled) {
            nextTrack();
        } else {
            updatePlayButton();
            setStatus("Playlist finished");
        }
    });

    audio.addEventListener("error", () => {
        updatePlayButton();
        setStatus("This audio file could not be played.");
    });

    renderPlaylist();
    updateTrackInformation();
    updatePlayButton();
    setStatus("Add music from your device to begin");

    return {
        play,
        pause,
        nextTrack,
        previousTrack,
        addFiles,
        clearPlaylist,

        getPlaylist() {
            return playlist.map(track => track.name);
        },

        destroy() {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();

            for (const url of objectUrls) {
                URL.revokeObjectURL(url);
            }

            objectUrls.clear();
        }
    };
}
