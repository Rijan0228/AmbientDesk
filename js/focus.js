// ============================================
// AmbientDesk — Focus Timer
// ============================================

export function initFocus() {
    const timerDisplay = document.getElementById("focus-timer");
    const modeDisplay = document.getElementById("focus-mode");

    const startButton = document.getElementById("focus-start");
    const resetButton = document.getElementById("focus-reset");
    const modeButton = document.getElementById("focus-mode-btn");

    if (!timerDisplay) {
        return {
            destroy: () => {}
        };
    }

    const MODES = {
        focus: {
            name: "Focus Session",
            duration: 25 * 60
        },
        short: {
            name: "Short Break",
            duration: 5 * 60
        },
        long: {
            name: "Long Break",
            duration: 15 * 60
        }
    };

    let currentMode = "focus";
    let remainingSeconds = MODES.focus.duration;
    let interval = null;
    let running = false;
    let endTime = null;

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    function updateDisplay() {
        timerDisplay.textContent = formatTime(remainingSeconds);

        if (modeDisplay) {
            modeDisplay.textContent = MODES[currentMode].name;
        }

        if (startButton) {
            const icon = startButton.querySelector("i");

            startButton.setAttribute(
                "aria-label",
                running ? "Pause timer" : "Start timer"
            );

            if (icon) {
                icon.setAttribute(
                    "data-lucide",
                    running ? "pause" : "play"
                );
            }

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        document.title = `${formatTime(remainingSeconds)} | AmbientDesk`;
    }

    function stopInterval() {
        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }
    }

    function pause() {
        if (!running) return;

        running = false;
        stopInterval();
        endTime = null;
        updateDisplay();
    }

    function finishSession() {
        pause();
        remainingSeconds = 0;
        updateDisplay();

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("AmbientDesk", {
                body: `${MODES[currentMode].name} completed.`
            });
        }

        if (currentMode === "focus") {
            currentMode = "short";
            remainingSeconds = MODES.short.duration;
        } else {
            currentMode = "focus";
            remainingSeconds = MODES.focus.duration;
        }

        updateDisplay();
    }

    function tick() {
        if (!running || !endTime) return;

        remainingSeconds = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
        );

        updateDisplay();

        if (remainingSeconds <= 0) {
            finishSession();
        }
    }

    function start() {
        if (running) {
            pause();
            return;
        }

        if (remainingSeconds <= 0) {
            remainingSeconds = MODES[currentMode].duration;
        }

        running = true;
        endTime = Date.now() + remainingSeconds * 1000;

        if (
            "Notification" in window &&
            Notification.permission === "default"
        ) {
            Notification.requestPermission().catch(() => {});
        }

        stopInterval();
        interval = setInterval(tick, 250);

        updateDisplay();
    }

    function reset() {
        pause();
        remainingSeconds = MODES[currentMode].duration;
        updateDisplay();
    }

    function changeMode(mode) {
        if (!MODES[mode]) return;

        pause();

        currentMode = mode;
        remainingSeconds = MODES[mode].duration;

        updateDisplay();
    }

    startButton?.addEventListener("click", start);
    resetButton?.addEventListener("click", reset);

    modeButton?.addEventListener("click", () => {
        const nextMode = currentMode === "focus"
            ? "short"
            : currentMode === "short"
                ? "long"
                : "focus";

        changeMode(nextMode);
    });

    updateDisplay();

    return {
        start,
        pause,
        reset,
        changeMode,
        destroy() {
            pause();

            startButton?.removeEventListener("click", start);
            resetButton?.removeEventListener("click", reset);
        }
    };
}
