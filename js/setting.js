/* =========================================
   AMBIENTDESK — SETTINGS
   File: js/setting.js
========================================= */

export function initSettings(app) {
    const $ = id => document.getElementById(id);

    const backdrop = $("settings-backdrop");
    const openButton = $("settings-btn");
    const closeButton = $("close-settings");
    const resetButton = $("reset-settings");

    const controls = {
        use24Hour: $("24-hour-toggle"),
        showSeconds: $("seconds-toggle"),
        showWeather: $("show-weather"),
        showCalendar: $("show-calendar"),
        showMusic: $("show-music"),
        screenDimming: $("screen-dimming"),
        brightness: $("brightness-control")
    };

    function open() {
        backdrop?.classList.add("active");
        backdrop?.setAttribute("aria-hidden", "false");
    }

    function close() {
        backdrop?.classList.remove("active");
        backdrop?.setAttribute("aria-hidden", "true");
    }

    function load() {
        const settings = app.getSettings();

        if (controls.use24Hour) {
            controls.use24Hour.checked = Boolean(settings.use24Hour);
        }

        if (controls.showSeconds) {
            controls.showSeconds.checked = settings.showSeconds !== false;
        }

        if (controls.showWeather) {
            controls.showWeather.checked = settings.showWeather !== false;
        }

        if (controls.showCalendar) {
            controls.showCalendar.checked = settings.showCalendar !== false;
        }

        if (controls.showMusic) {
            controls.showMusic.checked = settings.showMusic !== false;
        }

        if (controls.screenDimming) {
            controls.screenDimming.checked = Boolean(settings.screenDimming);
        }

        if (controls.brightness) {
            controls.brightness.value = settings.brightness ?? 100;
        }
    }

    function updateSetting(key, value) {
        const settings = app.getSettings();
        settings[key] = value;

        app.updateSettings(settings);

        if (key === "use24Hour") {
            app.modules.clock?.set24Hour?.(value);
        }

        if (key === "showSeconds") {
            app.modules.clock?.setShowSeconds?.(value);
        }

        if (key === "screenDimming") {
            app.setScreenDimming(value);
        }

        if (key === "brightness") {
            app.setBrightness(value);
        }
    }

    openButton?.addEventListener("click", open);
    closeButton?.addEventListener("click", close);

    backdrop?.addEventListener("click", event => {
        if (event.target === backdrop) close();
    });

    controls.use24Hour?.addEventListener("change", event => {
        updateSetting("use24Hour", event.target.checked);
    });

    controls.showSeconds?.addEventListener("change", event => {
        updateSetting("showSeconds", event.target.checked);
    });

    controls.showWeather?.addEventListener("change", event => {
        updateSetting("showWeather", event.target.checked);
    });

    controls.showCalendar?.addEventListener("change", event => {
        updateSetting("showCalendar", event.target.checked);
    });

    controls.showMusic?.addEventListener("change", event => {
        updateSetting("showMusic", event.target.checked);
    });

    controls.screenDimming?.addEventListener("change", event => {
        updateSetting("screenDimming", event.target.checked);
    });

    controls.brightness?.addEventListener("input", event => {
        updateSetting("brightness", Number(event.target.value));
    });

    resetButton?.addEventListener("click", () => {
        app.resetSettings();
        load();
        close();
    });

    load();

    return {
        open,
        close,
        load,

        destroy() {
            openButton?.removeEventListener("click", open);
            closeButton?.removeEventListener("click", close);
        }
    };
}
