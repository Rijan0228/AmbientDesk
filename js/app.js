/* =========================================
   AMBIENTDESK — MAIN APPLICATION
   File: js/app.js
========================================= */

import { initClock } from "./clock.js";
import { initWeather } from "./weather.js";
import { initMusic } from "./music.js";
import { initVisualizer } from "./visualizer.js";
import { initMatrix } from "./matrix.js";
import { initFocus } from "./focus.js";
import { initCalendar } from "./calendar.js";
import { initSettings } from "./setting.js";
import { initSharing } from "./sharing.js";

const DEFAULT_SETTINGS = {
    theme: "cyberpunk",
    displayMode: false,
    matrixEnabled: false,
    visualizerEnabled: true,
    glowEnabled: true,
    use24Hour: false,
    showSeconds: true,
    showWeather: true,
    showCalendar: true,
    showMusic: true,
    screenDimming: false,
    brightness: 100
};

const AmbientDesk = {
    version: "1.1.0",
    initialized: false,
    settings: { ...DEFAULT_SETTINGS },
    modules: {},
    toastTimeout: null,

    init() {
        if (this.initialized) return;

        this.loadSavedPreferences();
        this.applySettings();

        this.initializeModules();
        this.initializeGlobalControls();
        this.initializeKeyboardShortcuts();

        this.initialized = true;

        this.showToast("AmbientDesk is ready!");

        console.log("AmbientDesk initialized.");
    },

    loadSavedPreferences() {
        try {
            const saved = localStorage.getItem("ambientdesk-settings");

            if (saved) {
                this.settings = {
                    ...DEFAULT_SETTINGS,
                    ...JSON.parse(saved)
                };
            }
        } catch (error) {
            console.warn("Could not load preferences:", error);
            this.settings = { ...DEFAULT_SETTINGS };
        }

        const params = new URLSearchParams(location.search);
        const sharedTheme = params.get("theme");

        if (["cyberpunk", "cozy", "matrix", "minimal"].includes(sharedTheme)) {
            this.settings.theme = sharedTheme;
        }
    },

    savePreferences() {
        try {
            localStorage.setItem(
                "ambientdesk-settings",
                JSON.stringify(this.settings)
            );
        } catch (error) {
            console.warn("Could not save preferences:", error);
        }
    },

    applySettings() {
        document.body.dataset.theme = this.settings.theme;

        document.body.classList.toggle(
            "glow-disabled",
            !this.settings.glowEnabled
        );

        this.setBrightness(this.settings.brightness);
        this.setScreenDimming(this.settings.screenDimming);

        this.setWidgetVisibility("weather", this.settings.showWeather);
        this.setWidgetVisibility("calendar", this.settings.showCalendar);
        this.setWidgetVisibility("music", this.settings.showMusic);

        document.body.classList.toggle(
            "display-mode",
            this.settings.displayMode
        );

        const matrixToggle = document.getElementById("matrix-toggle");
        const visualizerToggle = document.getElementById("visualizer-toggle");
        const glowToggle = document.getElementById("glow-toggle");

        if (matrixToggle) matrixToggle.checked = this.settings.matrixEnabled;
        if (visualizerToggle) visualizerToggle.checked = this.settings.visualizerEnabled;
        if (glowToggle) glowToggle.checked = this.settings.glowEnabled;

        document.querySelectorAll("[data-theme-choice]").forEach(button => {
            const active = button.dataset.themeChoice === this.settings.theme;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    },

    initializeModules() {
        const initializers = [
            ["clock", () => initClock()],
            ["weather", () => initWeather()],
            ["music", () => initMusic()],
            ["visualizer", () => initVisualizer()],
            ["matrix", () => initMatrix()],
            ["focus", () => initFocus()],
            ["calendar", () => initCalendar()],
            ["settings", () => initSettings(this)],
            ["sharing", () => initSharing(this)]
        ];

        for (const [name, initialize] of initializers) {
            try {
                this.modules[name] = initialize();
            } catch (error) {
                console.error(`Could not initialize ${name}:`, error);
            }
        }

        this.modules.clock?.set24Hour?.(this.settings.use24Hour);
        this.modules.clock?.setShowSeconds?.(this.settings.showSeconds);
        this.modules.matrix?.setEnabled?.(this.settings.matrixEnabled);
        this.modules.visualizer?.setEnabled?.(this.settings.visualizerEnabled);
    },

    initializeGlobalControls() {
        document.querySelectorAll("[data-theme-choice]").forEach(button => {
            button.addEventListener("click", () => {
                this.setTheme(button.dataset.themeChoice);
            });
        });

        document.getElementById("display-mode-btn")?.addEventListener("click", () => {
            this.toggleDisplayMode();
        });

        document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
            this.toggleFullscreen();
        });

        document.getElementById("matrix-toggle")?.addEventListener("change", event => {
            this.settings.matrixEnabled = event.target.checked;
            this.modules.matrix?.setEnabled?.(event.target.checked);
            this.savePreferences();
        });

        document.getElementById("visualizer-toggle")?.addEventListener("change", event => {
            this.settings.visualizerEnabled = event.target.checked;
            this.modules.visualizer?.setEnabled?.(event.target.checked);
            this.savePreferences();
        });

        document.getElementById("glow-toggle")?.addEventListener("change", event => {
            this.settings.glowEnabled = event.target.checked;
            document.body.classList.toggle("glow-disabled", !event.target.checked);
            this.savePreferences();
        });

        document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
            backdrop.addEventListener("click", event => {
                if (event.target === backdrop) {
                    backdrop.classList.remove("active");
                    backdrop.setAttribute("aria-hidden", "true");
                }
            });
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                document.querySelectorAll(".modal-backdrop.active").forEach(modal => {
                    modal.classList.remove("active");
                    modal.setAttribute("aria-hidden", "true");
                });
            }
        });
    },

    initializeKeyboardShortcuts() {
        document.addEventListener("keydown", event => {
            const target = event.target;

            if (
                target instanceof HTMLElement &&
                target.matches("input, textarea, select, button")
            ) return;

            if (event.ctrlKey || event.metaKey || event.altKey) return;

            if (event.key.toLowerCase() === "f") {
                this.toggleFullscreen();
            }

            if (event.key.toLowerCase() === "d") {
                this.toggleDisplayMode();
            }
        });
    },

    setTheme(theme) {
        const themes = ["cyberpunk", "cozy", "matrix", "minimal"];

        if (!themes.includes(theme)) return;

        this.settings.theme = theme;
        document.body.dataset.theme = theme;

        document.querySelectorAll("[data-theme-choice]").forEach(button => {
            const active = button.dataset.themeChoice === theme;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        this.savePreferences();
        this.showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme activated`);
    },

    getSettings() {
        return { ...this.settings };
    },

    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };

        this.applySettings();
        this.savePreferences();
    },

    setWidgetVisibility(name, visible) {
        const ids = {
            weather: "weather-widget",
            calendar: "calendar-widget",
            music: "music-widget"
        };

        const element = document.getElementById(ids[name]);

        if (element) {
            element.classList.toggle("widget-hidden", !visible);
        }
    },

    setBrightness(value) {
        const brightness = Math.min(100, Math.max(50, Number(value) || 100));
        document.documentElement.style.setProperty(
            "--screen-brightness",
            `${brightness}%`
        );

        document.body.style.filter = `brightness(${brightness}%)`;
    },

    setScreenDimming(enabled) {
        document.body.classList.toggle("screen-dimming", Boolean(enabled));
    },

    resetSettings() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.applySettings();
        this.savePreferences();

        this.modules.clock?.set24Hour?.(false);
        this.modules.clock?.setShowSeconds?.(true);
        this.modules.matrix?.setEnabled?.(false);
        this.modules.visualizer?.setEnabled?.(true);

        const controls = {
            "24-hour-toggle": false,
            "seconds-toggle": true,
            "show-weather": true,
            "show-calendar": true,
            "show-music": true,
            "screen-dimming": false,
            "brightness-control": 100
        };

        for (const [id, value] of Object.entries(controls)) {
            const element = document.getElementById(id);
            if (!element) continue;

            if (element.type === "checkbox") {
                element.checked = value;
            } else {
                element.value = value;
            }
        }

        this.showToast("Settings restored to default.");
    },

    toggleDisplayMode() {
        this.settings.displayMode = !this.settings.displayMode;

        document.body.classList.toggle(
            "display-mode",
            this.settings.displayMode
        );

        this.savePreferences();
    },

    async toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.warn("Fullscreen unavailable:", error);
            this.showToast("Fullscreen is unavailable.");
        }
    },

    showToast(message, duration = 2600) {
        const toast = document.getElementById("toast");
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(this.toastTimeout);

        this.toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, duration);
    },

    destroy() {
        Object.values(this.modules).forEach(module => {
            module?.destroy?.();
        });
    }
};

window.AmbientDesk = AmbientDesk;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AmbientDesk.init());
} else {
    AmbientDesk.init();
}
