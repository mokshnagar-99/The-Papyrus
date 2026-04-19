/**
 * Page Transition Script — The Papyrus
 * Fades in on page load, fades out before navigating to a new page
 */
(function () {
    // Fade IN when page loads
    document.addEventListener('DOMContentLoaded', function () {
        requestAnimationFrame(function () {
            document.body.classList.add('page-loaded');
        });
    });

    // Intercept all internal link clicks for fade-out before navigate
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;

        // Skip: external links, hash-only anchors, javascript:, mailto:, target=_blank
        const isExternal = anchor.hostname && anchor.hostname !== window.location.hostname;
        const isHashOnly = href.startsWith('#');
        const isSpecial = href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:');
        const isNewTab = anchor.target === '_blank';

        if (isExternal || isHashOnly || isSpecial || isNewTab) return;

        e.preventDefault();
        document.body.classList.remove('page-loaded');
        document.body.classList.add('page-leaving');

        setTimeout(function () {
            window.location.href = href;
        }, 320); // slightly less than transition duration
    });
})();
