/* =========================================
   AMBIENTDESK — AUDIO VISUALIZER
   File: js/visualizer.js
========================================= */

export function initVisualizer() {

    const canvas = document.getElementById("visualizer");

    const audio = document.getElementById("audio-player");

    if (!canvas || !audio) {

        console.warn("Visualizer elements not found.");

        return {};

    }

    const ctx = canvas.getContext("2d");

    let audioContext = null;

    let analyser = null;

    let source = null;

    let frequencyData = null;

    let animationFrame = null;

    let enabled = true;

    let initialized = false;


    /* =====================================
       CANVAS SIZE
    ===================================== */

    function resizeCanvas() {

        const rect = canvas.getBoundingClientRect();

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = Math.max(
            1,
            Math.floor(rect.width * pixelRatio)
        );

        canvas.height = Math.max(
            1,
            Math.floor(rect.height * pixelRatio)
        );

        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

    }


    /* =====================================
       INITIALIZE AUDIO ANALYSER
    ===================================== */

    function setupAudioAnalyser() {

        if (initialized) return;

        try {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {

                throw new Error(
                    "Web Audio API is not supported."
                );

            }

            audioContext = new AudioContextClass();

            analyser = audioContext.createAnalyser();

            analyser.fftSize = 256;

            analyser.smoothingTimeConstant = 0.82;

            source =
                audioContext.createMediaElementSource(audio);

            source.connect(analyser);

            analyser.connect(audioContext.destination);

            frequencyData = new Uint8Array(
                analyser.frequencyBinCount
            );

            initialized = true;

        } catch (error) {

            console.error(
                "Visualizer initialization failed:",
                error
            );

            updateStatus("Visualizer unavailable");

        }

    }


    /* =====================================
       COLOR SELECTION
    ===================================== */

    function getBarColor(index, total, intensity) {

        const theme =
            document.body.dataset.theme || "cyberpunk";

        const hue = {

            cyberpunk: 285,

            cozy: 340,

            matrix: 120,

            minimal: 210

        }[theme] || 285;

        const gradientPosition = index / total;

        const saturation =
            theme === "minimal" ? 35 : 85;

        const lightness =
            45 + intensity * 25;

        return `hsl(${hue + gradientPosition * 45}, ${saturation}%, ${lightness}%)`;

    }


    /* =====================================
       DRAW BACKGROUND
    ===================================== */

    function drawBackground(width, height) {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

    }


    /* =====================================
       DRAW VISUALIZER
    ===================================== */

    function draw() {

        if (!enabled) {

            animationFrame = null;

            return;

        }

        animationFrame =
            requestAnimationFrame(draw);

        const rect = canvas.getBoundingClientRect();

        const width = rect.width;

        const height = rect.height;

        if (!width || !height) return;

        drawBackground(width, height);

        if (!analyser || !frequencyData) {

            drawIdleBars(width, height);

            return;

        }

        analyser.getByteFrequencyData(frequencyData);

        const barCount = 48;

        const gap = 3;

        const barWidth =
            Math.max(1, (width - gap * barCount) / barCount);

        const step =
            Math.max(
                1,
                Math.floor(frequencyData.length / barCount)
            );

        for (let i = 0; i < barCount; i++) {

            const value =
                frequencyData[i * step] / 255;

            const barHeight =
                Math.max(3, value * height * 0.9);

            const x = i * (barWidth + gap);

            const y = height - barHeight;

            const radius = Math.min(
                barWidth / 2,
                5
            );

            ctx.fillStyle = getBarColor(
                i,
                barCount,
                value
            );

            ctx.beginPath();

            ctx.roundRect(
                x,
                y,
                barWidth,
                barHeight,
                radius
            );

            ctx.fill();

        }

    }


    /* =====================================
       IDLE ANIMATION
    ===================================== */

    function drawIdleBars(width, height) {

        const barCount = 32;

        const gap = 4;

        const barWidth =
            (width - gap * (barCount - 1)) / barCount;

        const time = performance.now() / 700;

        for (let i = 0; i < barCount; i++) {

            const wave =
                Math.sin(time + i * 0.35) * 0.5 + 0.5;

            const barHeight =
                5 + wave * height * 0.3;

            const x = i * (barWidth + gap);

            const y = height - barHeight;

            ctx.fillStyle = getBarColor(
                i,
                barCount,
                wave
            );

            ctx.beginPath();

            ctx.roundRect(
                x,
                y,
                barWidth,
                barHeight,
                4
            );

            ctx.fill();

        }

    }


    /* =====================================
       STATUS
    ===================================== */

    function updateStatus(message) {

        const status =
            document.getElementById("visualizer-status");

        if (status) {

            status.textContent = message;

        }

    }


    /* =====================================
       START
    ===================================== */

    function start() {

        if (!enabled || animationFrame !== null) return;

        animationFrame =
            requestAnimationFrame(draw);

    }


    /* =====================================
       STOP
    ===================================== */

    function stop() {

        if (animationFrame !== null) {

            cancelAnimationFrame(animationFrame);

            animationFrame = null;

        }

        const rect = canvas.getBoundingClientRect();

        ctx.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );

    }


    /* =====================================
       ENABLE / DISABLE
    ===================================== */

    function setEnabled(value) {

        enabled = Boolean(value);

        if (enabled) {

            start();

            updateStatus("Visualizer enabled");

        } else {

            stop();

            updateStatus("Visualizer disabled");

        }

    }


    /* =====================================
       AUDIO EVENTS
    ===================================== */

    audio.addEventListener(
        "play",
        async () => {

            setupAudioAnalyser();

            if (audioContext?.state === "suspended") {

                try {

                    await audioContext.resume();

                } catch (error) {

                    console.warn(
                        "Could not resume audio context:",
                        error
                    );

                }

            }

            updateStatus("Audio visualizer active");

            start();

        }
    );

    audio.addEventListener(
        "pause",
        () => {

            updateStatus("Music paused");

        }
    );


    /* =====================================
       WINDOW EVENTS
    ===================================== */

    const resizeObserver = new ResizeObserver(
        resizeCanvas
    );

    resizeObserver.observe(canvas);

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* =====================================
       INITIALIZE
    ===================================== */

    resizeCanvas();

    start();

    updateStatus("Waiting for music");


    /* =====================================
       PUBLIC API
    ===================================== */

    return {

        start,

        stop,

        setEnabled,

        destroy() {

            stop();

            resizeObserver.disconnect();

            window.removeEventListener(
                "resize",
                resizeCanvas
            );

            if (audioContext) {

                audioContext.close();

            }

        }

    };

}
