// ============================================
// AmbientDesk — Theme Sharing
// ============================================

export function initSharing(app) {
    const backdrop = document.getElementById("share-backdrop");

    const themeName = document.getElementById("share-theme-name");
    const shareUrl = document.getElementById("share-url");

    const copyButton = document.getElementById("copy-share-url");
    const feedback = document.getElementById("share-feedback");
    const qrContainer = document.getElementById("share-qr");

    const shareButton = document.getElementById("share-button");
    const closeButton = document.getElementById("close-share");

    const themeNames = {
        cyberpunk: "Cyberpunk",
        cozy: "Cozy",
        matrix: "Matrix",
        minimal: "Minimal"
    };

    function createShareURL() {
        const url = new URL(window.location.href);

        url.searchParams.set(
            "theme",
            document.body.dataset.theme || "cyberpunk"
        );

        return url.toString();
    }

    function openShare() {
        if (!backdrop) return;

        const theme = document.body.dataset.theme || "cyberpunk";

        if (themeName) {
            themeName.textContent = themeNames[theme] || theme;
        }

        if (shareUrl) {
            shareUrl.value = createShareURL();
        }

        if (feedback) {
            feedback.textContent = "";
        }

        if (qrContainer) {
            qrContainer.replaceChildren();

            const note = document.createElement("p");
            note.textContent = "Share the URL to open this theme on another device.";
            qrContainer.appendChild(note);
        }

        backdrop.classList.add("active");
        backdrop.setAttribute("aria-hidden", "false");
    }

    function closeShare() {
        backdrop?.classList.remove("active");
        backdrop?.setAttribute("aria-hidden", "true");
    }

    async function copyURL() {
        const value = shareUrl?.value;

        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);

            if (feedback) {
                feedback.textContent = "Link copied!";
            }
        } catch {
            shareUrl.select();

            if (feedback) {
                feedback.textContent = "Select and copy the link.";
            }
        }
    }

    shareButton?.addEventListener("click", openShare);
    closeButton?.addEventListener("click", closeShare);
    copyButton?.addEventListener("click", copyURL);

    backdrop?.addEventListener("click", (event) => {
        if (event.target === backdrop) {
            closeShare();
        }
    });

    // Apply a theme received through a shared URL.
    const requestedTheme = new URLSearchParams(window.location.search).get("theme");

    if (requestedTheme && themeNames[requestedTheme]) {
        app.setTheme(requestedTheme);
    }

    return {
        open: openShare,
        close: closeShare,

        destroy() {
            shareButton?.removeEventListener("click", openShare);
            closeButton?.removeEventListener("click", closeShare);
            copyButton?.removeEventListener("click", copyURL);
        }
    };
}
