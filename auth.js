const AUTH_CONFIG = {
    clientId: '343966893252-k56dvhocr95vq0r7n0a6q3o1d4i5e0t0.apps.googleusercontent.com',
    autoSelect: false,
    cancelOnTapOutside: false
};

let authStateCallback = null;

function initGoogleAuth(callback) {
    authStateCallback = callback;
    
    google.accounts.id.initialize({
        client_id: AUTH_CONFIG.clientId,
        callback: handleCredentialResponse,
        auto_select: AUTH_CONFIG.autoSelect,
        cancel_on_tap_outside: AUTH_CONFIG.cancelOnTapOutside
    });
    
    checkExistingSession();
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
    google.accounts.id.disableAutoSelect();
    if (authStateCallback) {
        authStateCallback(null);
    }
}

function renderGoogleButton(buttonId) {
    google.accounts.id.renderButton(
        document.getElementById(buttonId),
        { theme: 'outline', size: 'large', width: '100%' }
    );
}

window.initGoogleAuth = initGoogleAuth;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.signOut = signOut;
window.renderGoogleButton = renderGoogleButton;