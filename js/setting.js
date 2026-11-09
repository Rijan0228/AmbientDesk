// ============================================
// AmbientDesk — Settings
// ============================================

export function initSettings(app) {
    const settingsButton = document.getElementById("settings-button");
    const settingsModal = document.getElementById("settings-modal");
    const closeButton = document.getElementById("close-settings");

    const hourToggle = document.getElementById("24-hour-toggle");
    const secondsToggle = document.getElementById("seconds-toggle");

    const weatherToggle = document.getElementById("show-weather");
    const calendarToggle = document.getElementById("show-calendar");
    const musicToggle = document.getElementById("show-music");

    const dimmingToggle = document.getElementById("screen-dimming");
    const brightnessControl = document.getElementById("brightness-control");

    const resetButton = document.getElementById("reset-settings");

    function getSettings() {
        return app.getSettings();
    }

    function saveSetting(key, value) {
        const settings = getSettings();

        settings[key] = value;

        app.updateSettings(settings);
    }

    function openSettings() {
        if (!settingsModal) return;

        settingsModal.classList.add("active");
        settingsModal.setAttribute("aria-hidden", "false");
    }

    function closeSettings() {
        if (!settingsModal) return;

        settingsModal.classList.remove("active");
        settingsModal.setAttribute("aria-hidden", "true");
    }

    function loadSettings() {
        const settings = getSettings();

        if (hourToggle) hourToggle.checked = Boolean(settings.use24Hour);
        if (secondsToggle) secondsToggle.checked = settings.showSeconds !== false;

        if (weatherToggle) weatherToggle.checked = settings.showWeather !== false;
        if (calendarToggle) calendarToggle.checked = settings.showCalendar !== false;
        if (musicToggle) musicToggle.checked = settings.showMusic !== false;

        if (dimmingToggle) dimmingToggle.checked = Boolean(settings.screenDimming);

        if (brightnessControl) {
            brightnessControl.value = settings.brightness ?? 100;
        }
    }

    settingsButton?.addEventListener("click", openSettings);
    closeButton?.addEventListener("click", closeSettings);

    settingsModal?.addEventListener("click", (event) => {
        if (event.target === settingsModal) {
            closeSettings();
        }
    });

    hourToggle?.addEventListener("change", () => {
        saveSetting("use24Hour", hourToggle.checked);
        app.modules.clock?.set24Hour(hourToggle.checked);
    });

    secondsToggle?.addEventListener("change", () => {
        saveSetting("showSeconds", secondsToggle.checked);
        app.modules.clock?.setShowSeconds(secondsToggle.checked);
    });

    weatherToggle?.addEventListener("change", () => {
        saveSetting("showWeather", weatherToggle.checked);
        app.setWidgetVisibility("weather", weatherToggle.checked);
    });

    calendarToggle?.addEventListener("change", () => {
        saveSetting("showCalendar", calendarToggle.checked);
        app.setWidgetVisibility("calendar", calendarToggle.checked);
    });

    musicToggle?.addEventListener("change", () => {
        saveSetting("showMusic", musicToggle.checked);
        app.setWidgetVisibility("music", musicToggle.checked);
    });

    dimmingToggle?.addEventListener("change", () => {
        saveSetting("screenDimming", dimmingToggle.checked);
        app.setScreenDimming(dimmingToggle.checked);
    });

    brightnessControl?.addEventListener("input", () => {
        const value = Number(brightnessControl.value);

        saveSetting("brightness", value);
        app.setBrightness(value);
    });

    resetButton?.addEventListener("click", () => {
        app.resetSettings();
        loadSettings();

        app.showToast("Settings restored to default.");
    });

    loadSettings();

    return {
        open: openSettings,
        close: closeSettings,

        destroy() {
            settingsButton?.removeEventListener("click", openSettings);
            closeButton?.removeEventListener("click", closeSettings);
        }
    };
}
