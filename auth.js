/**
 * auth.js — The Papyrus
 * Centralized Firebase auth that runs on every page.
 *
 * What it does:
 *  1. Initialises Firebase (single shared instance via getApp guard)
 *  2. Listens for auth state and updates:
 *      - Topbar: replaces "Sign In" button with user pill when logged in
 *      - Sidebar: updates the sidebar-sign-in-btn to show name / link to dashboard
 *      - Exposes window._auth and window._papyrusUser for other scripts
 *  3. Does NOT redirect — protected pages (dashboard, account) handle
 *     their own redirect guard separately.
 *
 * Usage: <script src="auth.js" type="module"></script>
 * Load AFTER shared-layout.css so styles are available.
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// ─── File:// Protocol Guard ────────────────────────────────────────────────────
// Firebase & auth redirects will NOT work when opening files directly in a browser.
// Always serve via: npm run dev  →  http://localhost:3000
if (window.location.protocol === 'file:') {
    console.warn(
        '%c⚠️  The Papyrus: auth.js loaded via file:// protocol!\n' +
        'Firebase auth and page redirects will not work.\n' +
        'Run: npm run dev  →  then open http://localhost:3000',
        'color:#fca5a5;font-size:12px;'
    );
}

const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyAB4hMxvMaBUgSfg_YADTr6ZCNwic2ctQk",
    authDomain:        "ai-studio-applet-webapp-ed2b6.firebaseapp.com",
    projectId:         "ai-studio-applet-webapp-ed2b6",
    storageBucket:     "ai-studio-applet-webapp-ed2b6.firebasestorage.app",
    messagingSenderId: "343966893252",
    appId:             "1:343966893252:web:1d15560bc9e2834d987591"
};

// Avoid double-initialisation if another module script already ran
const app  = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

// Expose globally for non-module scripts (script.js, etc.)
window._auth         = auth;
window._firebaseApp  = app;

window.handleSignOut = async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch(e) {
        console.error('Sign-out error:', e);
    }
};

// ─── Auth State Observer ─────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    window._papyrusUser = user || null;

    // ── Topbar Sign-In button ──────────────────────────────────────────────
    const signinEl = document.querySelector('.topbar-signin');
    if (signinEl) {
        if (user) {
            // Replace with user pill
            const displayName = user.displayName || user.email.split('@')[0] || 'User';
            const pill = document.createElement('a');
            pill.href = 'dashboard.html';
            pill.className = 'topbar-user-pill';
            pill.title = `Signed in as ${user.email}`;

            const avatar = document.createElement('div');
            avatar.className = 'topbar-user-avatar';
            if (user.photoURL) {
                const img = document.createElement('img');
                img.src = user.photoURL;
                img.alt = displayName;
                avatar.appendChild(img);
            } else {
                avatar.textContent = displayName.charAt(0).toUpperCase();
            }

            const nameEl = document.createElement('span');
            nameEl.className = 'topbar-user-name';
            nameEl.textContent = displayName.split(' ')[0]; // First name only

            pill.appendChild(avatar);
            pill.appendChild(nameEl);
            signinEl.replaceWith(pill);
        } else {
            // Ensure it looks like a proper button (may have been changed)
            signinEl.textContent = '🔑 Sign In';
            signinEl.href = 'login.html';
        }
    }

    // ── Sidebar bottom button ──────────────────────────────────────────────
    const sidebarBtn = document.querySelector('.sidebar-sign-in-btn');
    if (sidebarBtn) {
        if (user) {
            const displayName = user.displayName || user.email.split('@')[0] || 'User';
            sidebarBtn.innerHTML = `<span style="font-size:1rem;">👤</span> ${displayName}`;
            sidebarBtn.href = 'dashboard.html';
            sidebarBtn.style.background = 'rgba(99,102,241,0.12)';
            sidebarBtn.style.border = '1px solid rgba(99,102,241,0.3)';
        } else {
            sidebarBtn.innerHTML = '🔑 Sign In / Sign Up';
            sidebarBtn.href = 'login.html';
        }
    }

    // ── User pill in sidebar (dashboard page specific) ─────────────────────
    const sidebarEmail = document.getElementById('sidebar-user-email');
    const sidebarName  = document.getElementById('sidebar-user-name');
    const sidebarAvatar = document.getElementById('user-avatar-sidebar');
    if (sidebarEmail && user) {
        sidebarEmail.textContent = user.email;
        const name = user.displayName || user.email.split('@')[0];
        if (sidebarName) sidebarName.textContent = name;
        if (sidebarAvatar) {
            if (user.photoURL) {
                sidebarAvatar.innerHTML = `<img src="${user.photoURL}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            } else {
                sidebarAvatar.textContent = name.charAt(0).toUpperCase();
            }
        }
    }

    // ── Banner name on dashboard ────────────────────────────────────────────
    const bannerName = document.getElementById('banner-name');
    if (bannerName && user) {
        const name = user.displayName || user.email.split('@')[0] || 'User';
        bannerName.textContent = `Hello, ${name}! 👋`;
    }

    // ── Topbar greeting on dashboard ────────────────────────────────────────
    const topbarGreeting = document.getElementById('topbar-greeting');
    if (topbarGreeting && user && topbarGreeting.textContent === 'Dashboard') {
        const name = user.displayName || user.email.split('@')[0] || 'User';
        topbarGreeting.textContent = `Welcome, ${name.split(' ')[0]}`;
    }

    // ── Auth-guard for protected pages (dashboard + account) ───────────────
    // Only redirect on http/https — file:// redirects are blocked by browsers
    // and cause "Unsafe attempt to load URL" errors.
    if (window.location.protocol !== 'file:') {
        const protectedPages = ['dashboard.html', 'account.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (protectedPages.includes(currentPage) && !user) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Hide auth-loading screen on dashboard
    const loader = document.getElementById('auth-loading');
    if (loader) loader.style.display = 'none';

    // Account page population
    _populateAccountPage(user);
});

// ─── Account Page Population ─────────────────────────────────────────────────
function _populateAccountPage(user) {
    const profileName  = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    const inputName    = document.getElementById('input-name');
    const inputEmail   = document.getElementById('input-email');
    const inputUsername = document.getElementById('input-username');

    if (!profileName || !user) return; // not on account page

    const name = user.displayName || 'Security User';
    profileName.textContent  = name;
    profileEmail.textContent = user.email;
    if (inputName)     inputName.value    = name;
    if (inputEmail)    inputEmail.value   = user.email;
    if (inputUsername) inputUsername.value = user.email.split('@')[0];

    if (profileAvatar) {
        if (user.photoURL) {
            profileAvatar.innerHTML = `<img src="${user.photoURL}" alt="${name}">`;
        } else {
            profileAvatar.textContent = name.charAt(0).toUpperCase();
        }
    }
}
