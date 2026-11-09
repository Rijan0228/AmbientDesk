/* =========================================
   AMBIENTDESK
   Main Application Controller
   File: js/app.js
========================================= */

import { initClock } from "./clock.js";
import { initWeather } from "./weather.js";
import { initMusic } from "./music.js";
import { initVisualizer } from "./visualizer.js";
import { initMatrix } from "./matrix.js";
import { initFocus } from "./focus.js";
import { initCalendar } from "./calendar.js";
import { initSettings } from "./settings.js";
import { initSharing } from "./sharing.js";


/* =========================================
   APPLICATION STATE
========================================= */

const AmbientDesk = {

    version: "1.0.0",

    initialized: false,

    settings: {
        theme: "cyberpunk",
        displayMode: false,
        matrixEnabled: false,
        visualizerEnabled: true,
        glowEnabled: true
    },

    modules: {},

    init() {

        if (this.initialized) return;

        console.log(
            "%c AmbientDesk ",
            "background:#a855f7;color:white;font-size:18px;font-weight:bold;padding:8px;"
        );

        console.log("Starting AmbientDesk...");

        this.loadSavedPreferences();

        this.initializeModules();

        this.initializeGlobalControls();

        this.initializeKeyboardShortcuts();

        this.initializeDisplayMode();

        this.initializeTooltips();

        this.initialized = true;

        console.log("AmbientDesk initialized successfully.");

        this.showToast("AmbientDesk is ready!");

    },


    /* =====================================
       LOAD SAVED PREFERENCES
    ===================================== */

    loadSavedPreferences() {

        try {

            const saved = localStorage.getItem(
                "ambientdesk-settings"
            );

            if (!saved) return;

            const preferences = JSON.parse(saved);

            this.settings = {
                ...this.settings,
                ...preferences
            };

            if (this.settings.theme) {

                document.body.dataset.theme =
                    this.settings.theme;

            }

        } catch (error) {

            console.warn(
                "Could not load saved preferences:",
                error
            );

        }

    },


    /* =====================================
       SAVE PREFERENCES
    ===================================== */

    savePreferences() {

        try {

            localStorage.setItem(
                "ambientdesk-settings",
                JSON.stringify(this.settings)
            );

        } catch (error) {

            console.warn(
                "Could not save preferences:",
                error
            );

        }

    },


    /* =====================================
       INITIALIZE MODULES
    ===================================== */

    initializeModules() {

        const modules = [

            ["clock", initClock],

            ["weather", initWeather],

            ["music", initMusic],

            ["visualizer", initVisualizer],

            ["matrix", initMatrix],

            ["focus", initFocus],

            ["calendar", initCalendar],

            ["settings", initSettings],

            ["sharing", initSharing]

        ];


        modules.forEach(([name, initialize]) => {

            try {

                this.modules[name] = initialize();

                console.log(
                    `${name} module initialized.`
                );

            } catch (error) {

                console.error(
                    `Failed to initialize ${name}:`,
                    error
                );

            }

        });

    },


    /* =====================================
       GLOBAL CONTROLS
    ===================================== */

    initializeGlobalControls() {

        /* Theme buttons */

        document.querySelectorAll(
            "[data-theme-choice]"
        ).forEach(button => {

            button.addEventListener("click", () => {

                const theme =
                    button.dataset.themeChoice;

                this.setTheme(theme);

            });

        });


        /* Display mode */

        const displayButton =
            document.getElementById("display-mode-btn");

        if (displayButton) {

            displayButton.addEventListener(
                "click",
                () => this.toggleDisplayMode()
            );

        }


        /* Fullscreen */

        const fullscreenButton =
            document.getElementById("fullscreen-btn");

        if (fullscreenButton) {

            fullscreenButton.addEventListener(
                "click",
                () => this.toggleFullscreen()
            );

        }


        /* Matrix toggle */

        const matrixToggle =
            document.getElementById("matrix-toggle");

        if (matrixToggle) {

            matrixToggle.addEventListener(
                "change",
                event => {

                    this.settings.matrixEnabled =
                        event.target.checked;

                    this.modules.matrix?.setEnabled?.(
                        event.target.checked
                    );

                    this.savePreferences();

                }
            );

        }


        /* Visualizer toggle */

        const visualizerToggle =
            document.getElementById("visualizer-toggle");

        if (visualizerToggle) {

            visualizerToggle.addEventListener(
                "change",
                event => {

                    this.settings.visualizerEnabled =
                        event.target.checked;

                    this.modules.visualizer?.setEnabled?.(
                        event.target.checked
                    );

                    this.savePreferences();

                }
            );

        }


        /* Glow toggle */

        const glowToggle =
            document.getElementById("glow-toggle");

        if (glowToggle) {

            glowToggle.addEventListener(
                "change",
                event => {

                    this.settings.glowEnabled =
                        event.target.checked;

                    document.body.classList.toggle(
                        "glow-disabled",
                        !event.target.checked
                    );

                    this.savePreferences();

                }
            );

        }


        /* Close modals by clicking backdrop */

        document.querySelectorAll(
            ".modal-backdrop"
        ).forEach(backdrop => {

            backdrop.addEventListener(
                "click",
                event => {

                    if (event.target === backdrop) {

                        backdrop.classList.remove("active");

                    }

                }
            );

        });


        /* Close buttons */

        document.querySelectorAll(
            "[data-close-modal]"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const modal =
                        button.closest(".modal-backdrop");

                    modal?.classList.remove("active");

                }
            );

        });

    },


    /* =====================================
       THEME MANAGEMENT
    ===================================== */

    setTheme(theme) {

        const availableThemes = [
            "cyberpunk",
            "cozy",
            "matrix",
            "minimal"
        ];

        if (!availableThemes.includes(theme)) {

            console.warn("Unknown theme:", theme);

            return;

        }

        document.body.dataset.theme = theme;

        this.settings.theme = theme;

        document.querySelectorAll(
            "[data-theme-choice]"
        ).forEach(button => {

            const selected =
                button.dataset.themeChoice === theme;

            button.classList.toggle(
                "active",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                String(selected)
            );

        });

        this.savePreferences();

        this.showToast(
            `${this.capitalize(theme)} theme activated`
        );

    },


    /* =====================================
       DISPLAY MODE
    ===================================== */

    initializeDisplayMode() {

        document.body.classList.toggle(
            "display-mode",
            this.settings.displayMode
        );

    },


    toggleDisplayMode() {

        this.settings.displayMode =
            !this.settings.displayMode;

        document.body.classList.toggle(
            "display-mode",
            this.settings.displayMode
        );

        this.savePreferences();

        this.showToast(
            this.settings.displayMode
                ? "Display mode enabled"
                : "Display mode disabled"
        );

    },


    /* =====================================
       FULLSCREEN
    ===================================== */

    async toggleFullscreen() {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

                this.showToast("Fullscreen enabled");

            } else {

                await document.exitFullscreen();

                this.showToast("Fullscreen disabled");

            }

        } catch (error) {

            console.warn(
                "Fullscreen unavailable:",
                error
            );

            this.showToast(
                "Fullscreen is not available"
            );

        }

    },


    /* =====================================
       KEYBOARD SHORTCUTS
    ===================================== */

    initializeKeyboardShortcuts() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.target.matches(
                        "input, textarea, select"
                    )
                ) return;


                /* F = Fullscreen */

                if (
                    event.key.toLowerCase() === "f" &&
                    !event.ctrlKey &&
                    !event.metaKey
                ) {

                    this.toggleFullscreen();

                }


                /* Escape = Exit display mode */

                if (event.key === "Escape") {

                    if (this.settings.displayMode) {

                        this.settings.displayMode = false;

                        document.body.classList.remove(
                            "display-mode"
                        );

                        this.savePreferences();

                    }

                }


                /* D = Display mode */

                if (
                    event.key.toLowerCase() === "d" &&
                    !event.ctrlKey &&
                    !event.metaKey
                ) {

                    this.toggleDisplayMode();

                }

            }

        );

    },


    /* =====================================
       TOAST NOTIFICATIONS
    ===================================== */

    showToast(message, duration = 2500) {

        const toast =
            document.getElementById("toast");

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(this.toastTimeout);

        this.toastTimeout = setTimeout(() => {

            toast.classList.remove("show");

        }, duration);

    },


    /* =====================================
       TOOLTIPS
    ===================================== */

    initializeTooltips() {

        document.querySelectorAll(
            "[data-tooltip]"
        ).forEach(element => {

            element.setAttribute(
                "title",
                element.dataset.tooltip
            );

        });

    },


    /* =====================================
       UTILITY
    ===================================== */

    capitalize(value) {

        return value.charAt(0).toUpperCase() +
            value.slice(1);

    }

};


/* =========================================
   START APPLICATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AmbientDesk.init();

    }
);


/* =========================================
   GLOBAL ACCESS
========================================= */

window.AmbientDesk = AmbientDesk;
