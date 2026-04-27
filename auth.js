const AUTH_CONFIG = {
    clientId: '343966893252-k56dvhocr95vq0r7n0a6q3o1d4i5e0t0.apps.googleusercontent.com',
    autoSelect: false,
    cancelOnTapOutside: false
};

let authStateCallback = null;
let googleLoaded = false;

function initGoogleAuth(callback) {
    authStateCallback = callback;

    function waitForGoogle() {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            googleLoaded = true;
            google.accounts.id.initialize({
                client_id: AUTH_CONFIG.clientId,
                callback: handleCredentialResponse,
                auto_select: AUTH_CONFIG.autoSelect,
                cancel_on_tap_outside: AUTH_CONFIG.cancelOnTapOutside
            });
            checkExistingSession();
        } else {
            setTimeout(waitForGoogle, 100);
        }
    }
    waitForGoogle();
}

function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        givenName: payload.given_name,
        familyName: payload.family_name
    };
    
    sessionStorage.setItem('googleUser', JSON.stringify(user));
    sessionStorage.setItem('googleToken', response.credential);
    
    if (authStateCallback) {
        authStateCallback(user);
    }
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
}

function checkExistingSession() {
    const storedUser = sessionStorage.getItem('googleUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (authStateCallback) {
            authStateCallback(user);
        }
        return true;
    }
    return false;
}

function getCurrentUser() {
    const stored = sessionStorage.getItem('googleUser');
    return stored ? JSON.parse(stored) : null;
}

function isAuthenticated() {
    return !!sessionStorage.getItem('googleUser');
}

function signOut() {
    sessionStorage.removeItem('googleUser');
    sessionStorage.removeItem('googleToken');
    if (googleLoaded) {
        google.accounts.id.disableAutoSelect();
    }
    if (authStateCallback) {
        authStateCallback(null);
    }
}

function renderGoogleButton(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.innerHTML = `
        <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continue with Google</span>
    `;

    btn.onclick = function() {
        if (googleLoaded) {
            google.accounts.id.prompt();
        }
    };
}

window.initGoogleAuth = initGoogleAuth;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.signOut = signOut;
window.renderGoogleButton = renderGoogleButton;