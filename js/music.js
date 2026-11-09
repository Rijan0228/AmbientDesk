/* =========================================
   AMBIENTDESK — MUSIC PLAYER
   File: js/music.js
========================================= */

export function initMusic() {

    const elements = {

        audio: document.getElementById("audio-player"),

        title: document.getElementById("track-name"),

        artist: document.getElementById("track-artist"),

        art: document.getElementById("album-art"),

        play: document.getElementById("music-play"),

        previous: document.getElementById("music-previous"),

        next: document.getElementById("music-next"),

        volume: document.getElementById("music-volume"),

        progress: document.getElementById("music-progress"),

        current: document.getElementById("music-current"),

        duration: document.getElementById("music-duration")

    };


    const audio = elements.audio;

    if (!audio) {

        console.warn("Music player audio element not found.");

        return {};

    }


    /* =====================================
       PLAYLIST
    ===================================== */

    const playlist = [

        {
            title: "Ambient Track 01",
            artist: "Your music collection",
            src: "assets/sounds/ambient-01.mp3",
            cover: ""
        },

        {
            title: "Ambient Track 02",
            artist: "Your music collection",
            src: "assets/sounds/ambient-02.mp3",
            cover: ""
        },

        {
            title: "Ambient Track 03",
            artist: "Your music collection",
            src: "assets/sounds/ambient-03.mp3",
            cover: ""
        }

    ];


    let currentTrack = 0;

    let isPlaying = false;


    /* =====================================
       FORMAT TIME
    ===================================== */

    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {

            return "0:00";

        }

        const minutes = Math.floor(seconds / 60);

        const remaining = Math.floor(seconds % 60);

        return `${minutes}:${String(remaining).padStart(2, "0")}`;

    }


    /* =====================================
       UPDATE PLAY BUTTON
    ===================================== */

    function updatePlayButton() {

        if (!elements.play) return;

        elements.play.innerHTML = isPlaying
            ? '<i data-lucide="pause"></i>'
            : '<i data-lucide="play"></i>';

        elements.play.setAttribute(
            "aria-label",
            isPlaying ? "Pause music" : "Play music"
        );

        if (window.lucide) {

            window.lucide.createIcons();

        }

    }


    /* =====================================
       LOAD TRACK
    ===================================== */

    function loadTrack(index, autoplay = false) {

        if (!playlist.length) return;

        currentTrack =
            (index + playlist.length) % playlist.length;

        const track = playlist[currentTrack];

        audio.src = track.src;

        audio.load();

        if (elements.title) {

            elements.title.textContent = track.title;

        }

        if (elements.artist) {

            elements.artist.textContent = track.artist;

        }

        if (elements.art) {

            if (track.cover) {

                elements.art.style.backgroundImage =
                    `url("${track.cover}")`;

            } else {

                elements.art.style.backgroundImage = "";

            }

        }

        if (elements.progress) {

            elements.progress.value = 0;

        }

        if (elements.current) {

            elements.current.textContent = "0:00";

        }

        if (elements.duration) {

            elements.duration.textContent = "0:00";

        }

        if (autoplay) {

            play();

        } else {

            isPlaying = false;

            updatePlayButton();

        }

    }


    /* =====================================
       PLAY
    ===================================== */

    async function play() {

        if (!audio.src) {

            loadTrack(currentTrack);

        }

        try {

            await audio.play();

            isPlaying = true;

            updatePlayButton();

            setStatus("Now playing");

        } catch (error) {

            isPlaying = false;

            updatePlayButton();

            console.warn(
                "Audio playback failed:",
                error
            );

            setStatus(
                "Add audio files to start listening"
            );

        }

    }


    /* =====================================
       PAUSE
    ===================================== */

    function pause() {

        audio.pause();

        isPlaying = false;

        updatePlayButton();

        setStatus("Paused");

    }


    /* =====================================
       TOGGLE PLAYBACK
    ===================================== */

    function togglePlayback() {

        if (audio.paused) {

            play();

        } else {

            pause();

        }

    }


    /* =====================================
       NEXT TRACK
    ===================================== */

    function nextTrack() {

        loadTrack(currentTrack + 1, true);

    }


    /* =====================================
       PREVIOUS TRACK
    ===================================== */

    function previousTrack() {

        if (audio.currentTime > 3) {

            audio.currentTime = 0;

            return;

        }

        loadTrack(currentTrack - 1, true);

    }


    /* =====================================
       UPDATE PROGRESS
    ===================================== */

    function updateProgress() {

        const duration = audio.duration;

        const current = audio.currentTime;

        if (!Number.isFinite(duration)) return;

        const percentage =
            duration > 0
                ? (current / duration) * 100
                : 0;

        if (elements.progress) {

            elements.progress.value = percentage;

        }

        if (elements.current) {

            elements.current.textContent =
                formatTime(current);

        }

        if (elements.duration) {

            elements.duration.textContent =
                formatTime(duration);

        }

    }


    /* =====================================
       SEEK
    ===================================== */

    function seek() {

        if (!Number.isFinite(audio.duration)) return;

        if (!elements.progress) return;

        const percentage =
            Number(elements.progress.value) / 100;

        audio.currentTime =
            percentage * audio.duration;

    }


    /* =====================================
       VOLUME
    ===================================== */

    function setVolume(value) {

        const volume = Math.min(
            1,
            Math.max(0, Number(value))
        );

        audio.volume = volume;

    }


    /* =====================================
       STATUS
    ===================================== */

    function setStatus(message) {

        const status =
            document.getElementById("music-status");

        if (status) {

            status.textContent = message;

        }

    }


    /* =====================================
       AUDIO EVENTS
    ===================================== */

    audio.addEventListener(
        "timeupdate",
        updateProgress
    );

    audio.addEventListener(
        "loadedmetadata",
        updateProgress
    );

    audio.addEventListener(
        "ended",
        nextTrack
    );

    audio.addEventListener(
        "play",
        () => {

            isPlaying = true;

            updatePlayButton();

        }
    );

    audio.addEventListener(
        "pause",
        () => {

            isPlaying = false;

            updatePlayButton();

        }
    );

    audio.addEventListener(
        "error",
        () => {

            isPlaying = false;

            updatePlayButton();

            setStatus("Track unavailable");

        }
    );


    /* =====================================
       BUTTON EVENTS
    ===================================== */

    elements.play?.addEventListener(
        "click",
        togglePlayback
    );

    elements.next?.addEventListener(
        "click",
        nextTrack
    );

    elements.previous?.addEventListener(
        "click",
        previousTrack
    );

    elements.progress?.addEventListener(
        "input",
        seek
    );

    elements.volume?.addEventListener(
        "input",
        event => {

            setVolume(event.target.value);

        }
    );


    /* =====================================
       INITIAL SETTINGS
    ===================================== */

    audio.volume = elements.volume
        ? Number(elements.volume.value)
        : 0.7;

    loadTrack(0);

    setStatus("Ready to play");


    /* =====================================
       PUBLIC API
    ===================================== */

    return {

        play,

        pause,

        togglePlayback,

        nextTrack,

        previousTrack,

        setVolume,

        loadTrack,

        getPlaylist() {

            return playlist;

        },

        destroy() {

            pause();

            audio.removeAttribute("src");

            audio.load();

        }

    };

}
