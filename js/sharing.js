/* =========================================
   AMBIENTDESK — THEME SHARING
   File: js/sharing.js
========================================= */

export function initSharing(app) {
    const $ = id => document.getElementById(id);

    const backdrop = $("share-backdrop");
    const shareButton = $("share-btn");
    const closeButton = $("close-share");
    const copyButton = $("copy-share-url");

    const themeName = $("share-theme-name");
    const shareUrl = $("share-url");
    const feedback = $("share-feedback");
    const qrContainer = $("share-qr");

    const themeNames = {
        cyberpunk: "Cyberpunk Atmosphere",
        cozy: "Cozy Atmosphere",
        matrix: "Matrix Atmosphere",
        minimal: "Minimal Atmosphere"
    };

    function createURL() {
        const url = new URL(window.location.href);

        url.searchParams.set(
            "theme",
            document.body.dataset.theme || "cyberpunk"
        );

        return url.toString();
    }

    function open() {
        const theme = document.body.dataset.theme || "cyberpunk";

        if (themeName) {
            themeName.textContent = themeNames[theme] || theme;
        }

        if (shareUrl) {
            shareUrl.value = createURL();
        }

        if (feedback) {
            feedback.textContent = "";
        }

        if (qrContainer) {
            qrContainer.textContent =
                "Copy the link and send it to someone to share this theme.";
        }

        backdrop?.classList.add("active");
        backdrop?.setAttribute("aria-hidden", "false");
    }

    function close() {
        backdrop?.classList.remove("active");
        backdrop?.setAttribute("aria-hidden", "true");
    }

    async function copy() {
        if (!shareUrl?.value) return;

        try {
            await navigator.clipboard.writeText(shareUrl.value);

            if (feedback) {
                feedback.textContent = "Link copied successfully!";
            }
        } catch (error) {
            shareUrl.focus();
            shareUrl.select();

            if (feedback) {
                feedback.textContent = "Press Ctrl+C to copy the selected link.";
            }
        }
    }

    shareButton?.addEventListener("click", open);
    closeButton?.addEventListener("click", close);
    copyButton?.addEventListener("click", copy);

    backdrop?.addEventListener("click", event => {
        if (event.target === backdrop) close();
    });

    return {
        open,
        close,

        destroy() {
            shareButton?.removeEventListener("click", open);
            closeButton?.removeEventListener("click", close);
            copyButton?.removeEventListener("click", copy);
        }
    };
}
