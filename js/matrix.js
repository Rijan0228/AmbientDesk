// ============================================
// AmbientDesk — Matrix Background
// File: js/matrix.js
// ============================================

export function initMatrix() {
    const canvas = document.getElementById("matrix-canvas");

    if (!canvas) {
        console.warn("Matrix canvas not found.");
        return {
            setEnabled: () => {},
            destroy: () => {}
        };
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        console.warn("Matrix canvas context unavailable.");
        return {
            setEnabled: () => {},
            destroy: () => {}
        };
    }

    // ----------------------------------------
    // Configuration
    // ----------------------------------------

    const characters =
        "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const fontSize = 15;
    const columnWidth = fontSize;

    let columns = [];
    let animationId = null;
    let enabled = false;
    let lastFrame = 0;

    const frameInterval = 45;

    // ----------------------------------------
    // Theme colors
    // ----------------------------------------

    function getMatrixColor() {
        const theme = document.body.dataset.theme;

        switch (theme) {
            case "cozy":
                return {
                    main: "rgba(180, 220, 170, 0.75)",
                    glow: "rgba(120, 190, 130, 0.35)"
                };

            case "minimal":
                return {
                    main: "rgba(130, 150, 170, 0.55)",
                    glow: "rgba(130, 150, 170, 0.2)"
                };

            case "matrix":
                return {
                    main: "rgba(100, 255, 130, 0.9)",
                    glow: "rgba(0, 255, 80, 0.45)"
                };

            case "cyberpunk":
            default:
                return {
                    main: "rgba(0, 255, 220, 0.8)",
                    glow: "rgba(0, 255, 220, 0.35)"
                };
        }
    }

    // ----------------------------------------
    // Canvas sizing
    // ----------------------------------------

    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        const totalColumns = Math.ceil(width / columnWidth);

        columns = Array.from(
            { length: totalColumns },
            () => Math.random() * (height / fontSize)
        );

        ctx.clearRect(0, 0, width, height);
    }

    // ----------------------------------------
    // Draw one animation frame
    // ----------------------------------------

    function draw(timestamp) {
        if (!enabled) return;

        if (timestamp - lastFrame < frameInterval) {
            animationId = requestAnimationFrame(draw);
            return;
        }

        lastFrame = timestamp;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Create the fading trail effect.
        ctx.fillStyle = "rgba(0, 0, 0, 0.055)";
        ctx.fillRect(0, 0, width, height);

        const colors = getMatrixColor();

        ctx.font = `${fontSize}px monospace`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = colors.glow;
        ctx.fillStyle = colors.main;

        for (let i = 0; i < columns.length; i++) {
            const character = characters[
                Math.floor(Math.random() * characters.length)
            ];

            const x = i * columnWidth;
            const y = columns[i] * fontSize;

            ctx.fillText(character, x, y);

            // Occasionally restart a column.
            if (
                y > height &&
                Math.random() > 0.975
            ) {
                columns[i] = 0;
            } else {
                columns[i] += 0.55 + Math.random() * 0.45;
            }
        }

        ctx.shadowBlur = 0;

        animationId = requestAnimationFrame(draw);
    }

    // ----------------------------------------
    // Enable / disable
    // ----------------------------------------

    function setEnabled(state) {
        enabled = Boolean(state);

        if (enabled) {
            resizeCanvas();

            canvas.style.opacity = "1";

            if (animationId !== null) {
                cancelAnimationFrame(animationId);
            }

            lastFrame = 0;
            animationId = requestAnimationFrame(draw);
        } else {
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            ctx.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
            );

            canvas.style.opacity = "0";
        }
    }

    // ----------------------------------------
    // Event listeners
    // ----------------------------------------

    function handleResize() {
        if (enabled) {
            resizeCanvas();
        }
    }

    window.addEventListener("resize", handleResize);

    // Update colors when the theme changes.
    const themeObserver = new MutationObserver(() => {
        if (enabled) {
            // The next animation frame picks up the new theme.
        }
    });

    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });

    // ----------------------------------------
    // Cleanup
    // ----------------------------------------

    function destroy() {
        setEnabled(false);

        window.removeEventListener("resize", handleResize);

        themeObserver.disconnect();
    }

    // Start disabled; the app's settings control it.
    setEnabled(false);

    return {
        setEnabled,
        destroy
    };
}
