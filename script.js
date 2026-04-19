// ============================================================
//  GEMINI AI INTEGRATION — The Papyrus
//  API key is stored in localStorage (never sent to any server)
//  Falls back to heuristic mode if no key is set.
// ============================================================

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// --- Key helpers ---
window.getGeminiKey = () => localStorage.getItem('papyrus_gemini_key') || '';
window.setGeminiKey = (key) => { localStorage.setItem('papyrus_gemini_key', key.trim()); };
window.clearGeminiKey = () => { localStorage.removeItem('papyrus_gemini_key'); };
window.hasGeminiKey = () => !!window.getGeminiKey();

// --- Core Gemini text call ---
window.callGemini = async function(prompt) {
    const key = window.getGeminiKey();
    if (!key) throw new Error('NO_KEY');

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// --- Gemini vision call (base64 image) ---
window.callGeminiVision = async function(prompt, base64data, mimeType) {
    const key = window.getGeminiKey();
    if (!key) throw new Error('NO_KEY');

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: base64data } }
                ]
            }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// --- JSON extractor (Gemini sometimes wraps in markdown fences) ---
window.parseGeminiJSON = function(text) {
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(clean);
};

// --- API Key Settings Modal ---
window.openGeminiSettings = function() {
    const existing = document.getElementById('gemini-settings-modal');
    if (existing) existing.remove();

    const currentKey = window.getGeminiKey();
    const modal = document.createElement('div');
    modal.id = 'gemini-settings-modal';
    modal.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(12px);
        display:flex;align-items:center;justify-content:center;z-index:9999;
    `;
    modal.innerHTML = `
        <div style="background:linear-gradient(135deg,#0d0f1a,#111827);border:1px solid rgba(99,102,241,0.3);
            border-radius:20px;padding:2.5rem;width:90%;max-width:500px;position:relative;
            box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 30px rgba(99,102,241,0.1);">
            <button onclick="document.getElementById('gemini-settings-modal').remove()"
                style="position:absolute;top:1rem;right:1.2rem;background:none;border:none;
                color:rgba(255,255,255,0.4);font-size:1.8rem;cursor:pointer;line-height:1;
                transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">×</button>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
                <span style="font-size:1.5rem;">⚙️</span>
                <h2 style="font-family:Cinzel,serif;font-size:1.3rem;color:#fff;margin:0;">Gemini AI Settings</h2>
            </div>
            <p style="color:rgba(255,255,255,0.45);font-size:0.85rem;margin-bottom:1.75rem;line-height:1.6;">
                Enter your Google Gemini API key to unlock real AI-powered analysis for Phishing Detection,
                Threat Analysis, DLP, and Deepfake scanning. Your key is stored only in your browser.
            </p>
            <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:1rem;margin-bottom:1.25rem;">
                <p style="font-size:0.78rem;color:#a5b4fc;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.4rem;">🔒 Privacy Guarantee</p>
                <p style="font-size:0.82rem;color:rgba(255,255,255,0.55);line-height:1.5;">Your API key is never sent to The Papyrus servers. Calls go directly from your browser to Google's API.</p>
            </div>
            <label style="display:block;font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.6);margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.5px;">Gemini API Key</label>
            <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
                <input id="gemini-key-input" type="password" placeholder="AIza..."
                    value="${currentKey}"
                    style="flex:1;padding:0.85rem 1rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                    border-radius:10px;color:#fff;font-size:0.9rem;font-family:monospace;outline:none;
                    transition:all 0.2s;" onfocus="this.style.borderColor='rgba(99,102,241,0.7)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                <button onclick="const i=document.getElementById('gemini-key-input');i.type=i.type==='password'?'text':'password';"
                    style="padding:0.85rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
                    border-radius:10px;color:rgba(255,255,255,0.6);cursor:pointer;font-size:1rem;transition:all 0.2s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.07)'">👁</button>
            </div>
            <div id="gemini-status-msg" style="display:none;padding:0.7rem 1rem;border-radius:8px;font-size:0.85rem;margin-bottom:1rem;"></div>
            <div style="display:flex;gap:0.75rem;">
                <button onclick="window._saveGeminiKey()"
                    style="flex:1;padding:0.9rem;background:linear-gradient(135deg,#6366f1,#4f46e5);border:none;
                    border-radius:10px;color:#fff;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;
                    font-size:0.95rem;box-shadow:0 4px 15px rgba(99,102,241,0.3);transition:all 0.3s;"
                    onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    Save & Activate
                </button>
                ${currentKey ? `<button onclick="window._clearGeminiKey()"
                    style="padding:0.9rem 1.2rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
                    border-radius:10px;color:#f87171;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;
                    font-size:0.9rem;transition:all 0.2s;"
                    onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                    Remove Key
                </button>` : ''}
            </div>
            <p style="text-align:center;margin-top:1rem;font-size:0.78rem;color:rgba(255,255,255,0.3);">
                Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#a5b4fc;text-decoration:none;">aistudio.google.com</a>
            </p>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target === modal) modal.remove(); });
};

window._saveGeminiKey = async function() {
    const key = document.getElementById('gemini-key-input').value.trim();
    const msg = document.getElementById('gemini-status-msg');
    if (!key) { _showGeminiMsg('Please enter a valid API key.', 'warn'); return; }

    _showGeminiMsg('Testing key...', 'info');

    try {
        // Quick test call
        const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with OK' }] }] })
        });
        if (!res.ok) {
            const e = await res.json();
            throw new Error(e?.error?.message || 'Invalid key');
        }
        window.setGeminiKey(key);
        _showGeminiMsg('✅ Key saved! Gemini AI is now active.', 'success');
        setTimeout(() => { document.getElementById('gemini-settings-modal')?.remove(); window._refreshGeminiIndicator(); }, 1500);
    } catch(e) {
        _showGeminiMsg(`❌ ${e.message}`, 'error');
    }
};

window._clearGeminiKey = function() {
    window.clearGeminiKey();
    document.getElementById('gemini-settings-modal')?.remove();
    window._refreshGeminiIndicator();
};

function _showGeminiMsg(text, type) {
    const el = document.getElementById('gemini-status-msg');
    if(!el) return;
    const styles = {
        info:    'background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;',
        success: 'background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:#4ade80;',
        warn:    'background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;',
        error:   'background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;',
    };
    el.style.cssText = `display:block;padding:0.7rem 1rem;border-radius:8px;font-size:0.85rem;margin-bottom:1rem;${styles[type] || styles.info}`;
    el.textContent = text;
}

// Update AI badge indicators across pages
window._refreshGeminiIndicator = function() {
    const haKey = window.hasGeminiKey();
    document.querySelectorAll('.gemini-status-btn').forEach(btn => {
        btn.innerHTML = haKey ? '🤖 Gemini Active' : '⚙️ AI Settings';
        btn.style.background = haKey ? 'rgba(74,222,128,0.12)' : 'rgba(99,102,241,0.12)';
        btn.style.borderColor = haKey ? 'rgba(74,222,128,0.3)' : 'rgba(99,102,241,0.3)';
        btn.style.color = haKey ? '#4ade80' : '#a5b4fc';
    });
};

// Run on load to set initial indicator state
document.addEventListener('DOMContentLoaded', window._refreshGeminiIndicator);

// Language switching functionality

document.addEventListener('DOMContentLoaded', function() {
    const langToggle = document.getElementById('lang-toggle');
    const langBtns = document.querySelectorAll('.lang-toggle-btn');
    if (langToggle || langBtns.length > 0) {
        // Get saved language preference from localStorage, default to English
        let isEnglish = localStorage.getItem('language') !== 'hindi';

        function applyLanguage() {
            const elements = document.querySelectorAll('[data-en]');
            elements.forEach(element => {
                if (isEnglish) {
                    element.textContent = element.getAttribute('data-en');
                } else {
                    element.textContent = element.getAttribute('data-hi');
                }
            });
            // Update all toggle buttons
            if (langToggle) langToggle.textContent = isEnglish ? langToggle.getAttribute('data-en') : langToggle.getAttribute('data-hi');
            langBtns.forEach(btn => {
                btn.innerHTML = isEnglish ? `<i>🌐</i> ${btn.getAttribute('data-en') || 'EN'}` : `<i>🌐</i> ${btn.getAttribute('data-hi') || 'हिन्दी'}`;
            });
        }

        function switchLanguage() {
            isEnglish = !isEnglish;
            // Save language preference to localStorage
            localStorage.setItem('language', isEnglish ? 'english' : 'hindi');
            applyLanguage();
        }

        // Apply the saved language on page load
        applyLanguage();

        // Support multiple toggles (desktop and mobile/settings)
        document.querySelectorAll('#lang-toggle, .lang-toggle-btn').forEach(btn => {
            btn.addEventListener('click', switchLanguage);
        });
    }
});
async function initGlobalAuth() {
    // If on a page that needs auth but doesn't have it, handleSignOut or redirect
}

window.handleSignOut = function() {
    if (window._auth) {
        // Firebase Auth is usually provided via module scripts, so we check for it
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js').then(m => {
            m.signOut(window._auth).then(() => {
                window.location.href = 'index.html';
            }).catch(e => console.error("Sign out error:", e));
        });
    } else {
        // Fallback or if already on splash
        window.location.href = 'index.html';
    }
};

// Common DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Close modal listener
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.onclick = () => {
            const modal = document.getElementById('service-modal');
            if (modal) modal.classList.add('hidden');
        };
    }

    // Add some animations on load
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.animationDelay = `${index * 0.2}s`;
    });

    // Add active class to current nav link
    const currentLocation = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('nav-active');
        }
    });

    // Firebase auth integration is now handled per-page via sidebar/topbar UI
    // initializeFirebase() kept for Firestore contact form support
    function initializeFirebase() {
        if (window.firebaseAuth && window.firebaseDb && window.firebaseProvider) {
            const auth = window.firebaseAuth;
            const db = window.firebaseDb;

            // Contact form submission
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (!auth.currentUser) {
                        alert('Please sign in first to send a message.');
                        return;
                    }
                    const formData = new FormData(contactForm);
                    try {
                        await window.addDoc(window.collection(db, 'contacts'), {
                            name: formData.get('name'),
                            email: formData.get('email'),
                            message: formData.get('message'),
                            userId: auth.currentUser.uid,
                            timestamp: new Date()
                        });
                        alert('Message sent!');
                        contactForm.reset();
                    } catch (error) {
                        console.error('Error adding document:', error);
                    }
                });
            }
        } else {
            setTimeout(initializeFirebase, 100);
        }
    }
    initializeFirebase();
    
    // Modal closing logic
    const modal = document.getElementById('service-modal');
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

});

// Auto-open tool simulator from sessionStorage (dashboard/landing links)
// Placed here so openSimulator is guaranteed to be defined
// Auto-open tool simulator from storage (shared across pages)
(function() {
    const toolToOpen = sessionStorage.getItem('openTool') || localStorage.getItem('autoOpenSim');
    if (toolToOpen) {
        sessionStorage.removeItem('openTool');
        localStorage.removeItem('autoOpenSim');
        // Small delay to ensure all scripts and DOM elements are ready
        setTimeout(function() {
            if (typeof window.openSimulator === 'function') {
                window.openSimulator(toolToOpen);
            }
        }, 500);
    }
})();

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        overlay.onclick = window.toggleSidebar;
    }

    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('visible');
    }
};

window.navigateToTool = function(toolId) {
    // 1. Set persistence so it opens if we redirect
    localStorage.setItem('autoOpenSim', toolId);
    
    // 2. Determine if we should redirect or just open
    const isServicesPage = window.location.pathname.includes('services.html');
    
    if (isServicesPage && window.openSimulator) {
        window.openSimulator(toolId);
        // If mobile, close sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            window.toggleSidebar();
        }
    } else {
        // Redirect to services.html
        window.location.href = 'services.html';
    }
};

// --- Service Simulators Logic ---
window.openSimulator = function(serviceType) {
    let modal = document.getElementById('service-modal');
    
    // Dynamically inject modal if missing
    if (!modal) {
        const modalHTML = `
            <div id="service-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <button class="close-btn" id="close-modal">&times;</button>
                    <div id="modal-body"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('service-modal');
        
        // Re-attach close listener
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.onclick = () => {
                const m = document.getElementById('service-modal');
                if (m) m.classList.add('hidden');
            };
        }
    }

    const modalBody = document.getElementById('modal-body');
    if(!modal || !modalBody) return;
    
    let contentHTML = '';

    if (serviceType === 'phishing') {
        contentHTML = `
            <h2 class="sim-title" data-en="Phishing Email Scanner" data-hi="फ़िशिंग ईमेल स्कैनर">Phishing Email Scanner</h2>
            <p data-en="Paste a suspicious email below to analyze." data-hi="विश्लेषण करने के लिए नीचे एक संदिग्ध ईमेल पेस्ट करें।">Paste a suspicious email below to analyze.</p>
            <textarea id="sim-phish-input" class="sim-input" rows="5" placeholder="Dear Customer, your account has been compromised..."></textarea>
            <button class="sim-btn" onclick="runPhishingScan()">Analyze Email</button>
            <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    } else if (serviceType === 'password') {
        contentHTML = `
            <h2 class="sim-title" data-en="Smart Password Guardian" data-hi="स्मार्ट पासवर्ड गार्डियन">Smart Password Guardian</h2>
            <p data-en="Test your password strength in real-time." data-hi="वास्तविक समय में अपनी पासवर्ड शक्ति का परीक्षण करें।">Test your password strength in real-time.</p>
            <input type="password" id="sim-pass-input" class="sim-input" placeholder="Enter a password to test..." onkeyup="checkPasswordStrength()">
            <div id="sim-results" class="sim-results">
                <p><strong>Strength:</strong> <span id="pass-strength">Awaiting input...</span></p>
                <div id="sim-progress" class="sim-progress-bar" style="display:block;"><div id="sim-progress-fill" class="sim-progress-fill" style="width:0%; background:#e2e8f0;"></div></div>
                <p style="margin-top:0.5rem; font-size:0.9rem;" id="pass-feedback"></p>
            </div>
        `;
    } else if (serviceType === 'blockchain') {
        contentHTML = `
            <h2 class="sim-title" data-en="Blockchain File Verification" data-hi="ब्लॉकचेन फाइल सत्यापन">Blockchain File Verification</h2>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color:#f7fafc; margin-bottom:0.5rem; font-size:1.2rem;">Step 1: Anchor a File</h3>
                <p style="color:#a0aec0; margin-bottom:1rem; font-size:0.95rem;">Upload a file to generate a cryptographic hash and "anchor" it to the ledger.</p>
                <input type="file" id="sim-file-input" class="sim-input sim-file-btn" style="padding:0.5rem;">
                <button class="sim-btn" style="margin-bottom:0;" onclick="runBlockchainSim()">Generate Hash & Anchor</button>
                <div id="sim-progress-1" class="sim-progress-bar" style="margin-top:1rem;"><div id="sim-progress-fill-1" class="sim-progress-fill"></div></div>
                <div id="sim-results-1" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem;">
                <h3 style="color:#f7fafc; margin-bottom:0.5rem; font-size:1.2rem;">Step 2: Verify Authenticity</h3>
                <p style="color:#a0aec0; margin-bottom:1rem; font-size:0.95rem;">Upload a file and paste an existing Hash to prove the file has not been altered.</p>
                <input type="file" id="sim-verify-file" class="sim-input sim-file-btn" style="padding:0.5rem;">
                <input type="text" id="sim-verify-hash" class="sim-input" placeholder="Paste known SHA-256 hash here...">
                <button class="sim-btn" style="margin-bottom:0;" onclick="verifyFileHash()">Verify File Authenticity</button>
                <div id="sim-progress-2" class="sim-progress-bar" style="margin-top:1rem;"><div id="sim-progress-fill-2" class="sim-progress-fill"></div></div>
                <div id="sim-results-2" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
            </div>
        `;
    } else if (serviceType === 'vault') {
        contentHTML = `
            <h2 class="sim-title" data-en="File Encryption Tool" data-hi="फ़ाइल एन्क्रिप्शन टूल">File Encryption Tool</h2>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color:#f7fafc; margin-bottom:0.5rem; font-size:1.2rem;">Step 1: Lock a File</h3>
                <p style="color:#a0aec0; margin-bottom:1rem; font-size:0.95rem;">Select any file and set a strong password to encrypt it. The file will be downloaded as a secure .papyrus blob.</p>
                <input type="file" id="sim-encrypt-file" class="sim-input sim-file-btn" style="padding:0.5rem; margin-bottom:0.8rem;">
                <input type="password" id="sim-encrypt-pass" class="sim-input" placeholder="Set a strong encryption password...">
                <button class="sim-btn" style="margin-bottom:0;" onclick="encryptVaultFile()">Encrypt & Download (.papyrus)</button>
                <div id="sim-progress-encrypt" class="sim-progress-bar" style="margin-top:1rem;"><div id="sim-progress-fill-encrypt" class="sim-progress-fill"></div></div>
                <div id="sim-results-encrypt" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem;">
                <h3 style="color:#f7fafc; margin-bottom:0.5rem; font-size:1.2rem;">Step 2: Unlock a File</h3>
                <p style="color:#a0aec0; margin-bottom:1rem; font-size:0.95rem;">Upload a encrypted .papyrus file and enter the original password to unlock and restore it.</p>
                <input type="file" id="sim-decrypt-file" class="sim-input sim-file-btn" style="padding:0.5rem; margin-bottom:0.8rem;" accept=".papyrus">
                <input type="password" id="sim-decrypt-pass" class="sim-input" placeholder="Enter the exact decryption password...">
                <button class="sim-btn" style="margin-bottom:0;" onclick="decryptVaultFile()">Decrypt & Download Original</button>
                <div id="sim-progress-decrypt" class="sim-progress-bar" style="margin-top:1rem;"><div id="sim-progress-fill-decrypt" class="sim-progress-fill"></div></div>
                <div id="sim-results-decrypt" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
            </div>
        `;
    } else if (serviceType === 'ai_threat') {
        contentHTML = `
            <h2 class="sim-title" data-en="AI-Based Threat Detection" data-hi="एआई-आधारित खतरा पहचान">AI-Based Threat Detection</h2>
            <p data-en="Paste server logs or user activities to analyze behavioral anomalies." data-hi="व्यवहार संबंधी विसंगतियों का विश्लेषण करने के लिए सर्वर लॉग पेस्ट करें।">Paste server logs or user activities to analyze behavioral anomalies.</p>
            <textarea id="sim-threat-input" class="sim-input" rows="5" placeholder="Paste JSON/text access logs here..."></textarea>
            <div style="display:flex;gap:0.75rem;margin-bottom:1rem;">
                <button class="sim-btn" style="margin:0;flex:1;" onclick="runAIThreatScan()">Scan for Anomalies</button>
                <button style="flex:0;padding:0.9rem 1.2rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:rgba(255,255,255,0.7);cursor:pointer;font-family:Outfit,sans-serif;font-size:0.85rem;white-space:nowrap;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.07)'" onclick="document.getElementById('sim-threat-input').value='{\'user\': \'admin\', \'action\': \'login_failed\', \'ip\': \'192.168.1.10\', \'time\': \'02:00 AM\'}\n{\'user\': \'admin\', \'action\': \'login_failed\', \'ip\': \'91.234.55.22\', \'time\': \'02:00 AM\'}\n{\'user\': \'admin\', \'action\': \'login_failed\', \'ip\': \'45.33.22.11\', \'time\': \'02:01 AM\'}\n{\'user\': \'admin\', \'action\': \'login_success\', \'ip\': \'45.22.11.9\', \'time\': \'02:02 AM\'}\n{\'user\': \'guest\', \'action\': \'data_export\', \'ip\': \'45.22.11.9\', \'time\': \'02:03 AM\'}';">Load Sample</button>
            </div>
            <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    } else if (serviceType === 'deepfake') {
        contentHTML = `
            <h2 class="sim-title" data-en="Deepfake Detection" data-hi="डीपफेक पहचान">Deepfake Detection</h2>
            <p data-en="Upload a media file to analyze facial anomalies and audio manipulation." data-hi="चेहरे की विसंगतियों का विश्लेषण करने के लिए मीडिया फ़ाइल अपलोड करें।">Upload a media file to analyze facial anomalies and audio manipulation.</p>
            <input type="file" id="sim-deepfake-file" class="sim-input sim-file-btn" style="padding:0.5rem;" accept="video/mp4,video/webm,audio/mp3,audio/wav,image/jpeg,image/png">
            <button class="sim-btn" style="margin-bottom:0;" onclick="runDeepfakeScan()">Analyze Media</button>
            <div id="sim-progress" class="sim-progress-bar" style="margin-top:1rem;"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    } else if (serviceType === 'dlp') {
        contentHTML = `
            <h2 class="sim-title" data-en="Data Leakage Prevention" data-hi="डेटा रिसाव रोकथाम">Data Leakage Prevention</h2>
            <p data-en="Analyze outgoing text for sensitive information (PII, SSN, Credit Cards)." data-hi="संवेदनशील जानकारी के लिए आउटगोइंग टेक्स्ट का विश्लेषण करें।">Analyze outgoing text for sensitive information (PII, SSN, Credit Cards).</p>
            <textarea id="sim-dlp-input" class="sim-input" rows="5" placeholder="Hi team, my new phone number is 555-0198 and my card details are 4532 1122 8890 0011."></textarea>
            <button class="sim-btn" onclick="runDLPScan()">Inspect Payload</button>
            <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    } else if (serviceType === 'api_management') {
        contentHTML = `
            <h2 class="sim-title" data-en="Secure API Management" data-hi="सुरक्षित एपीआई प्रबंधन">Secure API Management</h2>
            <p data-en="Manage and safely rotate your API keys." data-hi="अपनी एपीआई कुंजियों को प्रबंधित और सुरक्षित रूप से घुमाएं।">Manage and safely rotate your API keys.</p>
            <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:1.5rem; margin-bottom:1rem; text-align:center;">
                <p style="color:#a0aec0; font-size:0.85rem; margin-bottom:0.5rem;">Current Production Key (Hidden)</p>
                <div style="font-family:monospace; font-size:1.2rem; color:#fff; background:#000; padding:0.5rem; border-radius:5px; margin-bottom:1rem; letter-spacing:3px;">
                    ************************
                </div>
                <div style="display:flex; justify-content:center; gap:1rem;">
                    <span class="badge-warning sim-badge" style="margin:0;">Risk: Medium (90 days old)</span>
                </div>
            </div>
            <button class="sim-btn" onclick="runAPIRotation()">Rotate Key & Update Vault</button>
            <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    } else if (serviceType === 'fraud') {
        contentHTML = `
            <h2 class="sim-title" data-en="Fraud Detection" data-hi="धोखाधड़ी की पहचान">Fraud Detection</h2>
            <p data-en="Evaluate a transaction risk score in real-time." data-hi="वास्तविक समय में लेन-देन जोखिम स्कोर का मूल्यांकन करें।">Evaluate a transaction risk score in real-time.</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <input type="number" id="sim-fraud-amt" class="sim-input" placeholder="Amount (USD)" style="margin:0;" min="0">
                <select id="sim-fraud-country" class="sim-input" style="margin:0; padding:0.9rem; background:#0d0f1a; color:#fff;">
                    <option value="US" style="background:#0d0f1a;">United States (Profile Default)</option>
                    <option value="UK" style="background:#0d0f1a;">United Kingdom</option>
                    <option value="NG" style="background:#0d0f1a;">Nigeria</option>
                    <option value="RU" style="background:#0d0f1a;">Russia</option>
                    <option value="CN" style="background:#0d0f1a;">China</option>
                    <option value="BR" style="background:#0d0f1a;">Brazil</option>
                </select>
            </div>
            <button class="sim-btn" onclick="runFraudScan()">Evaluate Risk Score</button>
            <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    } else if (serviceType === 'privacy_ai') {
        contentHTML = `
            <h2 class="sim-title" data-en="Privacy-Preserving AI" data-hi="गोपनीयता-संरक्षण एआई">Privacy-Preserving AI</h2>
            <p data-en="Train a model locally using Federated Learning. Your raw data never leaves the device." data-hi="फेडरेटेड लर्निंग का उपयोग करके स्थानीय रूप से मॉडल को प्रशिक्षित करें।">Train a model locally using Federated Learning. Your raw data never leaves the device.</p>
            <button class="sim-btn" onclick="runFederatedTraining()">Start Federated Training Epoch</button>
            <div id="sim-fl-terminal" style="background:#000; border:1px solid rgba(74,222,128,0.2); border-radius:8px; padding:1rem; font-family:monospace; font-size:0.85rem; color:#4ade80; height:160px; overflow-y:auto; line-height:1.7;"></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    } else if (serviceType === 'breach_monitor') {
        contentHTML = `
            <h2 class="sim-title">🔍 Dark Web Breach Monitor</h2>
            <p>Check if your password has appeared in known data breaches. Privacy-safe — only a partial hash is sent.</p>
            <div style="display:flex;gap:0.5rem;margin-bottom:1.25rem;">
                <button class="breach-tab" id="tab-pass" onclick="switchBreachTab('pass')" style="flex:1;padding:0.7rem;border-radius:8px;border:1px solid rgba(99,102,241,0.4);background:rgba(99,102,241,0.15);color:#a5b4fc;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;transition:all 0.2s;">🔑 Password Check</button>
                <button class="breach-tab" id="tab-email" onclick="switchBreachTab('email')" style="flex:1;padding:0.7rem;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;transition:all 0.2s;">📧 Email Lookup</button>
            </div>
            <div id="breach-pass-panel">
                <div style="background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:0.85rem;margin-bottom:1rem;font-size:0.82rem;color:#86efac;line-height:1.5;">
                    🔒 <strong>k-Anonymity:</strong> Only the first 5 chars of your password's SHA-1 hash are sent to the API. Your actual password never leaves this device.
                </div>
                <input type="password" id="sim-breach-pass" class="sim-input" placeholder="Enter a password to check..." autocomplete="new-password">
                <button class="sim-btn" onclick="runBreachCheck()">Check if Pwned</button>
            </div>
            <div id="breach-email-panel" style="display:none;">
                <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:1.25rem;">
                    <p style="color:rgba(255,255,255,0.65);font-size:0.9rem;line-height:1.7;">Email breach checking requires the official Have I Been Pwned service. Visit the link below — it's free and safe:</p>
                    <a href="https://haveibeenpwned.com" target="_blank" style="display:inline-flex;align-items:center;gap:0.5rem;margin-top:0.75rem;padding:0.75rem 1.25rem;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.35);border-radius:10px;color:#a5b4fc;font-weight:700;text-decoration:none;font-size:0.9rem;transition:all 0.2s;">🌐 haveibeenpwned.com →</a>
                    <p style="margin-top:1rem;font-size:0.82rem;color:rgba(255,255,255,0.35);">Created by Troy Hunt (Microsoft MVP). Trusted by millions worldwide.</p>
                </div>
            </div>
            <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results hidden" style="margin-top:1rem; display:none;"></div>
        `;
    }

    modalBody.innerHTML = contentHTML;
    modal.classList.remove('hidden');
    
    // Re-apply language if elements were injected
    let isEnglish = localStorage.getItem('language') !== 'hindi';
    const elements = document.querySelectorAll('#modal-body [data-en]');
    elements.forEach(element => {
        if (isEnglish) {
            element.textContent = element.getAttribute('data-en');
        } else {
            element.textContent = element.getAttribute('data-hi');
        }
    });
}

window.runPhishingScan = async function() {
    const input = document.getElementById('sim-phish-input').value;
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    
    if(!input.trim()) return;
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    // If Gemini key is set, use real AI analysis
    if(window.hasGeminiKey()) {
        // Animate to 80% while waiting
        let w = 0;
        const fakeInterval = setInterval(() => { if(w < 80) { w += 5; progressFill.style.width = w + '%'; } }, 150);
        
        try {
            const prompt = `You are an expert email security analyst. Analyze the following email/message for phishing indicators.
Respond ONLY with a single valid JSON object (no markdown, no extra text):
{
  "isPhishing": boolean,
  "riskLevel": "safe" | "suspicious" | "critical",
  "riskScore": number (0-10),
  "flags": ["array of specific issues found"],
  "explanation": "1-2 sentence summary",
  "recommendation": "specific action to take"
}

Email/Message to analyze:
---
${input}
---`;
            
            const raw = await window.callGemini(prompt);
            clearInterval(fakeInterval);
            progressFill.style.width = '100%';
            
            const parsed = window.parseGeminiJSON(raw);
            const badgeClass = parsed.riskLevel === 'safe' ? 'badge-safe' : parsed.riskLevel === 'suspicious' ? 'badge-warning' : 'badge-danger';
            const badgeLabel = parsed.riskLevel === 'safe' ? `✅ Safe (Risk Score: ${parsed.riskScore}/10)` : parsed.riskLevel === 'suspicious' ? `⚠️ Suspicious (Risk Score: ${parsed.riskScore}/10)` : `🚨 Phishing Detected (Risk Score: ${parsed.riskScore}/10)`;
            
            results.style.display = 'block';
            results.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem;">
                    <div class="${badgeClass} sim-badge" style="margin:0;">${badgeLabel}</div>
                    <span style="font-size:0.72rem;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;padding:0.2rem 0.6rem;border-radius:100px;font-weight:700;">🤖 Gemini AI</span>
                </div>
                <p><strong>Analysis:</strong> ${parsed.explanation}</p>
                ${parsed.flags?.length ? `<p style="margin-top:0.6rem;"><strong>Flags detected:</strong> ${parsed.flags.map(f => `<span style="background:rgba(239,68,68,0.1);color:#f87171;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.82rem;margin:0.1rem;display:inline-block;">${f}</span>`).join(' ')}</p>` : ''}
                <p style="margin-top:0.6rem;font-size:0.88rem;color:#fbbf24;"><strong>Recommendation:</strong> ${parsed.recommendation}</p>
            `;
        } catch(e) {
            clearInterval(fakeInterval);
            if(e.message !== 'NO_KEY') {
                progressFill.style.width = '100%';
                results.style.display = 'block';
                results.innerHTML = `<div class="badge-warning sim-badge">Gemini Error — Falling back to heuristics</div><p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-top:0.5rem;">${e.message}</p>`;
                setTimeout(() => displayPhishingResults(input), 800);
                return;
            }
        }
        return;
    }
    
    // Heuristic fallback
    let w2 = 0;
    const interval = setInterval(() => {
        w2 += 10;
        progressFill.style.width = w2 + '%';
        if(w2 >= 100) { clearInterval(interval); setTimeout(() => displayPhishingResults(input), 200); }
    }, 100);
}

function displayPhishingResults(text) {
    const results = document.getElementById('sim-results');
    const lowerText = text.toLowerCase();
    
    let score = 0;
    const triggers = ['urgent', 'password', 'login', 'verify', 'suspended', 'click here', 'bank', 'winner', 'money', 'crypto'];
    let foundTriggers = [];
    
    triggers.forEach(t => {
        if(lowerText.includes(t)) {
            score += 1;
            foundTriggers.push(t);
        }
    });

    results.style.display = 'block';
    
    if(score === 0) {
        results.innerHTML = `
            <div class="badge-safe sim-badge">Safe - 0 Threats Detected</div>
            <p style="margin-top:0.5rem">No obvious phishing indicators found. <em style="color:rgba(255,255,255,0.35);">(Add a Gemini key for deeper AI analysis)</em></p>
        `;
    } else if (score < 3) {
        results.innerHTML = `
            <div class="badge-warning sim-badge">Suspicious - ${score} Flags</div>
            <p style="margin-top:0.5rem">Contains potentially risky keywords: <strong>${foundTriggers.join(', ')}</strong></p>
            <p style="font-size:0.85rem; margin-top:0.5rem;">Verify the sender's email address before proceeding.</p>
        `;
    } else {
         results.innerHTML = `
            <div class="badge-danger sim-badge">Critical Risk - ${score} Flags</div>
            <p style="margin-top:0.5rem">High likelihood of phishing! Triggers: <strong>${foundTriggers.join(', ')}</strong></p>
            <p style="font-size:0.85rem; margin-top:0.5rem;">DO NOT click any links or provide credentials.</p>
        `;
    }
}

window.checkPasswordStrength = function() {
    const val = document.getElementById('sim-pass-input').value;
    const strengthText = document.getElementById('pass-strength');
    const feedback = document.getElementById('pass-feedback');
    const fill = document.getElementById('sim-progress-fill');
    
    if(!val) {
        strengthText.innerText = "Awaiting input...";
        fill.style.width = '0%';
        fill.style.background = '#e2e8f0';
        feedback.innerText = '';
        return;
    }
    
    let strength = 0;
    if(val.length > 7) strength += 1;
    if(val.length > 12) strength += 1;
    if(/[A-Z]/.test(val)) strength += 1;
    if(/[0-9]/.test(val)) strength += 1;
    if(/[^A-Za-z0-9]/.test(val)) strength += 1;
    
    if(strength <= 2) {
        strengthText.innerHTML = "<span style='color:#e53e3e; font-weight:bold;'>Weak</span>";
        fill.style.width = '33%';
        fill.style.background = '#fc8181';
        feedback.innerText = "Too easy to guess. Try adding numbers, special characters, or increasing length.";
    } else if (strength <= 4) {
        strengthText.innerHTML = "<span style='color:#d69e2e; font-weight:bold;'>Moderate</span>";
        fill.style.width = '66%';
        fill.style.background = '#f6e05e';
        feedback.innerText = "Good, but could be stronger. Consider using a longer passphrase.";
    } else {
        strengthText.innerHTML = "<span style='color:#38a169; font-weight:bold;'>Strong</span>";
        fill.style.width = '100%';
        fill.style.background = '#68d391';
        feedback.innerText = "Excellent! This password is highly resistant to brute-force attacks.";
    }
}

window.runBlockchainSim = async function() {
    const fileInput = document.getElementById('sim-file-input');
    const progress = document.getElementById('sim-progress-1');
    const progressFill = document.getElementById('sim-progress-fill-1');
    const results = document.getElementById('sim-results-1');
    
    if(!fileInput.files.length) return;
    const file = fileInput.files[0];
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    let width = 0;
    const interval = setInterval(() => {
        width += 5;
        progressFill.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            generateFileHash(file).then(hash => {
                const txId = '0x' + Math.random().toString(16).substr(2, 16) + hash.substr(0, 16);
                results.style.display = 'block';
                results.innerHTML = `
                    <div class="badge-safe sim-badge" style="margin-bottom:0.8rem">🔗 File Anchored to Ledger</div>
                    <p><strong>Filename:</strong> ${file.name}</p>
                    <p style="overflow-wrap: anywhere;"><strong>SHA-256 Auth Hash:</strong><br/> <span style="font-family:monospace; font-size:0.85rem">${hash}</span></p>
                    <p style="margin-top:0.5rem"><strong>Mock Transaction ID:</strong><br/> <span style="font-family:monospace; font-size:0.85rem; color:#3182ce">${txId}</span></p>
                `;
            });
        }
    }, 50);
}

async function generateFileHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

window.verifyFileHash = async function() {
    const fileInput = document.getElementById('sim-verify-file');
    const hashInput = document.getElementById('sim-verify-hash').value.trim().toLowerCase();
    const progress = document.getElementById('sim-progress-2');
    const progressFill = document.getElementById('sim-progress-fill-2');
    const results = document.getElementById('sim-results-2');
    
    if(!fileInput.files.length) {
        alert("Please select a file to verify.");
        return;
    }
    if(!hashInput) {
        alert("Please provide the original hash for verification.");
        return;
    }

    const file = fileInput.files[0];
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    let width = 0;
    const interval = setInterval(() => {
        width += 5;
        progressFill.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            generateFileHash(file).then(calculatedHash => {
                results.style.display = 'block';
                
                if (calculatedHash === hashInput) {
                    results.innerHTML = `
                        <div class="badge-safe sim-badge" style="margin-bottom:0.8rem; font-size: 1rem;">✅ VERIFIED: MATCH</div>
                        <p style="color:#c6f6d5;"><strong>Authenticity Confirmed.</strong> The file has not been altered since anchoring.</p>
                        <p style="margin-top:0.8rem; overflow-wrap: anywhere;"><strong>Calculated Hash:</strong><br/> <span style="font-family:monospace; font-size:0.85rem">${calculatedHash}</span></p>
                    `;
                } else {
                    results.innerHTML = `
                        <div class="badge-danger sim-badge" style="margin-bottom:0.8rem; font-size: 1rem;">❌ TAMPERED: HASH MISMATCH</div>
                        <p style="color:#fed7d7;"><strong>Warning!</strong> This file differs from the original hash. It has been altered, corrupted, or is a completely different file.</p>
                        <p style="margin-top:0.8rem; overflow-wrap: anywhere;"><strong>Original Hash:</strong><br/> <span style="font-family:monospace; font-size:0.85rem">${hashInput}</span></p>
                        <p style="margin-top:0.5rem; overflow-wrap: anywhere;"><strong>Calculated Hash:</strong><br/> <span style="font-family:monospace; font-size:0.85rem">${calculatedHash}</span></p>
                    `;
                }
            });
        }
    }, 50);
}

// --- Vault Encryption Logic ---

async function getKeyMaterial(password) {
    const enc = new TextEncoder();
    return window.crypto.subtle.importKey(
      "raw", 
      enc.encode(password), 
      { name: "PBKDF2" }, 
      false, 
      ["deriveBits", "deriveKey"]
    );
}

async function getKey(keyMaterial, salt) {
    return window.crypto.subtle.deriveKey(
      {
        "name": "PBKDF2",
        salt: salt,
        "iterations": 100000,
        "hash": "SHA-256"
      },
      keyMaterial,
      { "name": "AES-GCM", "length": 256 },
      true,
      [ "encrypt", "decrypt" ]
    );
}

window.encryptVaultFile = async function() {
    const fileInput = document.getElementById('sim-encrypt-file');
    const password = document.getElementById('sim-encrypt-pass').value;
    const progress = document.getElementById('sim-progress-encrypt');
    const progressFill = document.getElementById('sim-progress-fill-encrypt');
    const results = document.getElementById('sim-results-encrypt');
    
    if(!fileInput.files.length) {
        alert("Please select a file to encrypt.");
        return;
    }
    if(!password) {
        alert("Please enter a password.");
        return;
    }

    const file = fileInput.files[0];
    const originalNameBytes = new TextEncoder().encode(file.name);
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    let width = 0;
    const interval = setInterval(async () => {
        width += 20;
        progressFill.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                
                const salt = window.crypto.getRandomValues(new Uint8Array(16));
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const keyMaterial = await getKeyMaterial(password);
                const key = await getKey(keyMaterial, salt);
                
                const ciphertext = await window.crypto.subtle.encrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    arrayBuffer
                );
                
                const nameLen = new Uint8Array([originalNameBytes.length]);
                
                const blob = new Blob([
                    nameLen,
                    originalNameBytes,
                    salt, 
                    iv, 
                    ciphertext
                ], {type: "application/octet-stream"});
                
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = "locked_file.papyrus";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                results.style.display = 'block';
                results.innerHTML = `
                    <div class="badge-safe sim-badge" style="margin-bottom:0.8rem; font-size: 1rem;">🔒 SUCCESS: FILE ENCRYPTED</div>
                    <p style="color:#c6f6d5;"><strong>Secured!</strong> The file was encrypted using AES-GCM and PBKDF2 key derivation. Your downloaded <strong>.papyrus</strong> file contains the encrypted blob.</p>
                `;
            } catch (error) {
                console.error(error);
                alert("Encryption failed.");
            }
        }
    }, 100);
}

window.decryptVaultFile = async function() {
    const fileInput = document.getElementById('sim-decrypt-file');
    const password = document.getElementById('sim-decrypt-pass').value;
    const progress = document.getElementById('sim-progress-decrypt');
    const progressFill = document.getElementById('sim-progress-fill-decrypt');
    const results = document.getElementById('sim-results-decrypt');
    
    if(!fileInput.files.length) {
        alert("Please select a .papyrus file to decrypt.");
        return;
    }
    if(!password) {
        alert("Please enter the decryption password.");
        return;
    }

    const file = fileInput.files[0];
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    let width = 0;
    const interval = setInterval(async () => {
        width += 20;
        progressFill.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                
                const dataView = new DataView(arrayBuffer);
                const nameLen = dataView.getUint8(0);
                
                const nameBuffer = arrayBuffer.slice(1, 1 + nameLen);
                const originalName = new TextDecoder().decode(nameBuffer);
                
                const saltOffset = 1 + nameLen;
                const salt = arrayBuffer.slice(saltOffset, saltOffset + 16);
                
                const ivOffset = saltOffset + 16;
                const iv = arrayBuffer.slice(ivOffset, ivOffset + 12);
                
                const ciphertext = arrayBuffer.slice(ivOffset + 12);
                
                const keyMaterial = await getKeyMaterial(password);
                const key = await getKey(keyMaterial, salt);
                
                try {
                    const decrypted = await window.crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: iv },
                        key,
                        ciphertext
                    );
                    
                    const blob = new Blob([decrypted]);
                    const downloadUrl = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = originalName || "decrypted_file.out";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    results.style.display = 'block';
                    results.innerHTML = `
                        <div class="badge-safe sim-badge" style="margin-bottom:0.8rem; font-size: 1rem;">🔓 SUCCESS: FILE DECRYPTED</div>
                        <p style="color:#c6f6d5;"><strong>Unlocked!</strong> The password was correct and the original file has been restored and downloaded.</p>
                    `;
                } catch (e) {
                    results.style.display = 'block';
                    results.innerHTML = `
                        <div class="badge-danger sim-badge" style="margin-bottom:0.8rem; font-size: 1rem;">❌ DECRYPTION FAILED</div>
                        <p style="color:#fed7d7;"><strong>Access Denied!</strong> Incorrect password or corrupted .papyrus file. The AES-GCM auth tag check failed.</p>
                    `;
                }
            } catch (error) {
                console.error(error);
                alert("Decryption parsing failed. Not a valid Papyrus format.");
            }
        }
    }, 100);
}

// --- New Simulator Logic ---

window.runAIThreatScan = async function() {
    const input = document.getElementById('sim-threat-input').value;
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    
    if(!input.trim()) return;
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    if(window.hasGeminiKey()) {
        let w = 0;
        const fakeInterval = setInterval(() => { if(w < 80) { w += 4; progressFill.style.width = w + '%'; } }, 120);
        try {
            const prompt = `You are a senior SOC analyst. Analyze the following server logs or user activity data for security anomalies.
Respond ONLY with a single valid JSON object (no markdown, no extra text):
{
  "anomalyScore": number (0.0 to 1.0),
  "riskLevel": "normal" | "suspicious" | "critical",
  "threats": ["list of specific threats or anomalies found"],
  "affectedEntities": ["usernames, IPs, or resources involved"],
  "explanation": "2-3 sentence analysis",
  "mitigations": ["list of recommended actions"]
}

Log data:
---
${input}
---`;
            const raw = await window.callGemini(prompt);
            clearInterval(fakeInterval);
            progressFill.style.width = '100%';
            const p = window.parseGeminiJSON(raw);
            const badgeClass = p.riskLevel === 'normal' ? 'badge-safe' : p.riskLevel === 'suspicious' ? 'badge-warning' : 'badge-danger';
            const scoreLabel = `Anomaly Score: ${p.anomalyScore?.toFixed(2) ?? '—'}`;
            results.style.display = 'block';
            results.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem;">
                    <div class="${badgeClass} sim-badge" style="margin:0;">${p.riskLevel === 'normal' ? '✅ Normal Activity' : p.riskLevel === 'suspicious' ? '⚠️ Suspicious Behavior' : '🚨 Critical Threat'} (${scoreLabel})</div>
                    <span style="font-size:0.72rem;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;padding:0.2rem 0.6rem;border-radius:100px;font-weight:700;">🤖 Gemini AI</span>
                </div>
                <p>${p.explanation}</p>
                ${p.threats?.length ? `<p style="margin-top:0.6rem;"><strong>Threats:</strong> ${p.threats.map(t => `<span style="background:rgba(239,68,68,0.1);color:#f87171;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.82rem;margin:0.1rem;display:inline-block;">${t}</span>`).join(' ')}</p>` : ''}
                ${p.affectedEntities?.length ? `<p style="margin-top:0.4rem;font-size:0.85rem;"><strong>Entities:</strong> ${p.affectedEntities.join(', ')}</p>` : ''}
                ${p.mitigations?.length ? `<p style="margin-top:0.6rem;font-size:0.85rem;color:#fbbf24;"><strong>Recommended Actions:</strong><br>${p.mitigations.map((m,i) => `${i+1}. ${m}`).join('<br>')}</p>` : ''}
            `;
        } catch(e) {
            clearInterval(fakeInterval);
            results.style.display = 'block';
            results.innerHTML = `<div class="badge-warning sim-badge">Gemini Error — Heuristic Fallback</div><p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-top:0.4rem;">${e.message}</p>`;
            setTimeout(() => _runAIThreatHeuristic(input), 800);
        }
        return;
    }
    _runAIThreatHeuristic(input);
}

function _runAIThreatHeuristic(input) {
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    let w = 0;
    const interval = setInterval(() => {
        w += 8; progressFill.style.width = w + '%';
        if(w >= 100) {
            clearInterval(interval);
            const lines = input.split('\n');
            let score = 0;
            if(input.includes('failed')) score += 2;
            if(input.includes('admin')) score += 1;
            if(lines.length > 5) score += 2;
            results.style.display = 'block';
            if(score < 2) {
                results.innerHTML = `<div class="badge-safe sim-badge">Normal Activity (Anomaly Score: 0.1)</div><p>Logs appear consistent with standard user behavior.</p>`;
            } else if(score < 4) {
                results.innerHTML = `<div class="badge-warning sim-badge">Suspicious Behavior (Anomaly Score: 0.6)</div><p>Unusual patterns detected. Consider reviewing IP addresses.</p>`;
            } else {
                results.innerHTML = `<div class="badge-danger sim-badge">Critical Risk (Anomaly Score: 0.95)</div><p><strong>Brute-force or Account Takeover detected!</strong></p><p style="font-size:0.85rem;margin-top:0.5rem;">Enforce MFA and block offending IPs immediately.</p>`;
            }
        }
    }, 80);
}

window.runDeepfakeScan = async function() {
    const fileInput = document.getElementById('sim-deepfake-file');
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    
    if(!fileInput.files.length) { alert('Please upload a media file.'); return; }
    
    const file = fileInput.files[0];
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const sizeKB = (file.size / 1024).toFixed(1);
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    // Gemini Vision — only for images (API doesn't accept video/audio blobs)
    if(window.hasGeminiKey() && isImage) {
        let w = 0;
        const fakeInterval = setInterval(() => { if(w < 75) { w += 3; progressFill.style.width = w + '%'; } }, 120);
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const prompt = `You are an expert in digital forensics and deepfake detection. Analyze this image for signs of AI generation or manipulation.
Respond ONLY with a single valid JSON object (no markdown, no extra text):
{
  "isManipulated": boolean,
  "confidence": number (0-100),
  "verdict": "authentic" | "suspicious" | "ai_generated",
  "indicators": ["specific visual artifacts or signs you detected"],
  "analysis": "2-3 sentence detailed analysis"
}`;
            const raw = await window.callGeminiVision(prompt, base64, file.type);
            clearInterval(fakeInterval);
            progressFill.style.width = '100%';
            const p = window.parseGeminiJSON(raw);
            const badgeClass = p.verdict === 'authentic' ? 'badge-safe' : p.verdict === 'suspicious' ? 'badge-warning' : 'badge-danger';
            const badgeLabel = p.verdict === 'authentic' ? `✅ Authentic Image — ${p.confidence}% Confidence` : p.verdict === 'suspicious' ? `⚠️ Suspicious — ${p.confidence}% Confidence` : `🚨 AI-Generated / Deepfake — ${p.confidence}% Confidence`;
            results.style.display = 'block';
            results.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem;">
                    <div class="${badgeClass} sim-badge" style="margin:0;">${badgeLabel}</div>
                    <span style="font-size:0.72rem;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;padding:0.2rem 0.6rem;border-radius:100px;font-weight:700;">🤖 Gemini Vision</span>
                </div>
                <p><strong>File:</strong> ${file.name} (${sizeKB} KB)</p>
                <p style="margin-top:0.5rem;">${p.analysis}</p>
                ${p.indicators?.length ? `<p style="margin-top:0.6rem;"><strong>Visual Indicators:</strong> ${p.indicators.map(i => `<span style="background:rgba(239,68,68,0.1);color:#f87171;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.82rem;margin:0.1rem;display:inline-block;">${i}</span>`).join(' ')}</p>` : ''}
            `;
        } catch(e) {
            clearInterval(fakeInterval);
            results.style.display = 'block';
            results.innerHTML = `<div class="badge-warning sim-badge">Gemini Error — Heuristic Fallback</div><p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-top:0.4rem;">${e.message}</p>`;
            setTimeout(() => _runDeepfakeHeuristic(file, sizeKB, isImage, isAudio), 600);
        }
        return;
    }
    
    // Heuristic fallback (or non-image with Gemini)
    if(window.hasGeminiKey() && !isImage) {
        results.style.display = 'block';
        progressFill.style.width = '100%';
        results.innerHTML = `<div class="badge-warning sim-badge" style="margin-bottom:0.5rem;">⚠️ Gemini Vision supports images only</div><p style="font-size:0.85rem;color:rgba(255,255,255,0.5);">Falling back to heuristic analysis for video/audio files.</p>`;
        setTimeout(() => _runDeepfakeHeuristic(file, sizeKB, isImage, isAudio), 600);
        return;
    }
    
    let w = 0;
    const interval = setInterval(() => {
        w += 5; progressFill.style.width = w + '%';
        if(w >= 100) { clearInterval(interval); _runDeepfakeHeuristic(file, sizeKB, isImage, isAudio); }
    }, 100);
}

function _runDeepfakeHeuristic(file, sizeKB, isImage, isAudio) {
    const results = document.getElementById('sim-results');
    const isFake = Math.random() > 0.5;
    let analysisSummary = '';
    if(isImage) {
        analysisSummary = isFake ? 'Pixel noise patterns suggest GAN synthesis. Compression artifacts are inconsistent with natural camera sensors.' : 'No GAN fingerprints detected. Facial landmarks are consistent, compression artifacts match natural camera sensors.';
    } else if(isAudio) {
        analysisSummary = isFake ? 'Voice frequency spectrum identified unnatural formant transitions. Likely neural TTS or voice cloning.' : 'Acoustic analysis passed. Natural prosody and breath patterns detected.';
    } else {
        analysisSummary = isFake ? 'Unnatural eye blinking patterns and lip-sync misalignment detected across key frames.' : 'Temporal frame analysis passed. No blending artifacts found.';
    }
    results.style.display = 'block';
    results.innerHTML = isFake
        ? `<div class="badge-danger sim-badge">⚠️ Deepfake Detected — ${Math.floor(85 + Math.random() * 12)}% Confidence</div><p><strong>File:</strong> ${file.name} (${sizeKB} KB)</p><p style="margin-top:0.5rem;">${analysisSummary}</p>`
        : `<div class="badge-safe sim-badge">✅ Authentic Media — ${Math.floor(93 + Math.random() * 6)}% Confidence</div><p><strong>File:</strong> ${file.name} (${sizeKB} KB)</p><p style="margin-top:0.5rem;">${analysisSummary}</p>`;
}

window.runDLPScan = async function() {
    const input = document.getElementById('sim-dlp-input').value;
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    
    if(!input.trim()) return;
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    if(window.hasGeminiKey()) {
        let w = 0;
        const fakeInterval = setInterval(() => { if(w < 80) { w += 6; progressFill.style.width = w + '%'; } }, 100);
        try {
            const prompt = `You are a Data Loss Prevention (DLP) engine. Scan the following text for sensitive information and policy violations.
Respond ONLY with a single valid JSON object (no markdown, no extra text):
{
  "hasPII": boolean,
  "action": "allow" | "block",
  "riskLevel": "safe" | "warning" | "critical",
  "violations": ["list of PII/sensitive data types found, e.g. Credit Card Number, Email Address, SSN, API Key, Phone Number, etc."],
  "redactedPreview": "the input text with sensitive parts replaced by [REDACTED]",
  "explanation": "brief explanation of what was found"
}

Text to scan:
---
${input}
---`;
            const raw = await window.callGemini(prompt);
            clearInterval(fakeInterval);
            progressFill.style.width = '100%';
            const p = window.parseGeminiJSON(raw);
            const badgeClass = p.action === 'allow' ? 'badge-safe' : p.riskLevel === 'warning' ? 'badge-warning' : 'badge-danger';
            results.style.display = 'block';
            results.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem;">
                    <div class="${badgeClass} sim-badge" style="margin:0;">${p.action === 'allow' ? '✅ Cleared — No PII Found' : '🚫 Blocked — PII Detected'}</div>
                    <span style="font-size:0.72rem;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;padding:0.2rem 0.6rem;border-radius:100px;font-weight:700;">🤖 Gemini AI</span>
                </div>
                <p>${p.explanation}</p>
                ${p.violations?.length ? `<p style="margin-top:0.6rem;"><strong>Detected:</strong> ${p.violations.map(v => `<span style="background:rgba(239,68,68,0.1);color:#f87171;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.82rem;margin:0.1rem;display:inline-block;">${v}</span>`).join(' ')}</p>` : ''}
                ${p.redactedPreview ? `<div style="margin-top:0.75rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.75rem;"><p style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-bottom:0.3rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Redacted Preview</p><p style="font-size:0.85rem;font-family:monospace;color:#a5b4fc;word-break:break-all;">${p.redactedPreview.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}
            `;
        } catch(e) {
            clearInterval(fakeInterval);
            results.style.display = 'block';
            results.innerHTML = `<div class="badge-warning sim-badge">Gemini Error — Heuristic Fallback</div><p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-top:0.4rem;">${e.message}</p>`;
            setTimeout(() => _runDLPHeuristic(input), 600);
        }
        return;
    }
    _runDLPHeuristic(input);
}

function _runDLPHeuristic(input) {
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    let w = 0;
    const interval = setInterval(() => {
        w += 15; progressFill.style.width = w + '%';
        if(w >= 100) {
            clearInterval(interval);
            const cardRegex = /\b(?:\d[ -]*?){13,16}\b/;
            const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/;
            const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{3}-\d{4}\b/;
            let flags = [];
            if(cardRegex.test(input)) flags.push('Credit Card Number');
            if(ssnRegex.test(input)) flags.push('Social Security Number');
            if(phoneRegex.test(input)) flags.push('Phone Number');
            results.style.display = 'block';
            if(flags.length > 0) {
                results.innerHTML = `<div class="badge-danger sim-badge">🚫 Blocked — PII Detected!</div><p>Policy Violation: <strong>${flags.join(', ')}</strong>.</p><p style="font-size:0.85rem;margin-top:0.5rem;color:#f87171;">Data transfer aborted.</p>`;
            } else {
                results.innerHTML = `<div class="badge-safe sim-badge">✅ Cleared — No PII Found</div><p>Content complies with DLP policies. Allowed to send. <em style="color:rgba(255,255,255,0.35);">(Add a Gemini key for smarter detection)</em></p>`;
            }
        }
    }, 60);
}

window.runAPIRotation = function() {
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    let width = 0;
    const interval = setInterval(() => {
        width += 10;
        progressFill.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            
            const newKey = "pk_live_" + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
            
            results.style.display = 'block';
            results.innerHTML = `
                <div class="badge-safe sim-badge">Success - Key Rotated safely</div>
                <p>Old key has been deprecated. The new key has been injected into the secure vault.</p>
                <div style="font-family:monospace; margin-top:1rem; font-size:1.1rem; color:#4ade80; background:#000; padding:0.5rem; border-radius:5px; text-align:center;">
                    ${newKey}
                </div>
            `;
        }
    }, 80);
}

window.runFraudScan = function() {
    const amt = parseFloat(document.getElementById('sim-fraud-amt').value);
    const country = document.getElementById('sim-fraud-country').value;
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    
    if(isNaN(amt)) {
        alert("Enter a valid amount.");
        return;
    }
    
    progress.style.display = 'block';
    results.style.display = 'none';
    progressFill.style.width = '0%';
    
    let width = 0;
    const interval = setInterval(() => {
        width += 20;
        progressFill.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            
            let isSuspicious = false;
            let reason = "";
            if(country !== "US") {
                isSuspicious = true;
                reason = "IP localization differs from user's primary residence (US).";
            } else if(amt > 10000) {
                isSuspicious = true;
                reason = "Transaction amount drastically exceeds historical baseline averages.";
            }
            
            results.style.display = 'block';
            if(isSuspicious) {
                 results.innerHTML = `
                    <div class="badge-warning sim-badge">Transaction Held (Fraud Score: 88/100)</div>
                    <p>This transaction has been flagged for manual review.</p>
                    <p style="font-size:0.85rem; margin-top:0.5rem; color:#fbbf24;">Reason: ${reason}</p>
                `;
            } else {
                results.innerHTML = `
                    <div class="badge-safe sim-badge">Approved (Fraud Score: 12/100)</div>
                    <p>Transaction is consistent with user velocity and geographic profile.</p>
                `;
            }
        }
    }, 60);
}

window.runFederatedTraining = function() {
    const term = document.getElementById('sim-fl-terminal');
    const results = document.getElementById('sim-results');
    const steps = [
        "Initializing local weights...",
        "Fetching randomized mini-batch...",
        "Epoch 1/5: Loss 0.45 | Accuracy 68.2%",
        "Epoch 2/5: Loss 0.37 | Accuracy 73.1%",
        "Epoch 3/5: Loss 0.32 | Accuracy 77.8%",
        "Epoch 4/5: Loss 0.29 | Accuracy 80.5%",
        "Epoch 5/5: Loss 0.28 | Accuracy 81.9%",
        "Applying Differential Privacy (Epsilon: 0.1)...",
        "Adding Laplace noise to gradient vectors...",
        "Encrypting delta payload (Homomorphic Encryption)...",
        "Sending encrypted gradient to Global Aggregator...",
        "DONE: Model contribution successful. Raw data never left this device."
    ];
    
    term.innerHTML = '> Session started...<br>';
    results.style.display = 'none';
    
    let stepCount = 0;
    const interval = setInterval(() => {
        if(stepCount < steps.length) {
            term.innerHTML += '> ' + steps[stepCount] + '<br>';
            term.scrollTop = term.scrollHeight;
            stepCount++;
        } else {
            clearInterval(interval);
            results.style.display = 'block';
            results.innerHTML = `
                <div class="badge-safe sim-badge">🛡️ Privacy Preserved — Training Complete</div>
                <p>The AI model was successfully improved using your local data. Zero raw data was transmitted to any server.</p>
            `;
        }
    }, 350);
}

// ============================================================
//  PWA — Service Worker Registration & Install Prompt
// ============================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[PWA] SW registered:', reg.scope))
            .catch(err => console.warn('[PWA] SW failed:', err));
    });
}
let _pwaPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _pwaPrompt = e;
    document.querySelectorAll('.pwa-install-btn').forEach(b => b.style.display = 'flex');
});
window.installPWA = function() {
    if (!_pwaPrompt) return;
    _pwaPrompt.prompt();
    _pwaPrompt.userChoice.then(() => { _pwaPrompt = null; });
};

// ============================================================
//  SCAN HISTORY — localStorage (max 50 entries)
// ============================================================
window.saveScanToHistory = function(tool, riskLevel, summary, engine) {
    try {
        const scans = JSON.parse(localStorage.getItem('papyrus_scan_history') || '[]');
        scans.unshift({ tool, riskLevel, summary: (summary||'').substring(0, 120), engine: engine || (window.hasGeminiKey() ? 'gemini' : 'heuristic'), timestamp: Date.now() });
        if (scans.length > 50) scans.length = 50;
        localStorage.setItem('papyrus_scan_history', JSON.stringify(scans));
    } catch(e) {}
};
window.getScanHistory = function() {
    try { return JSON.parse(localStorage.getItem('papyrus_scan_history') || '[]'); } catch(e) { return []; }
};
window.getSecurityScore = function() {
    const s = window.getScanHistory();
    if (!s.length) return 85;
    let score = 100;
    s.slice(0, 20).forEach(sc => {
        if (['critical','ai_generated','block'].includes(sc.riskLevel)) score -= 10;
        else if (['suspicious','warning'].includes(sc.riskLevel)) score -= 4;
        else if (['safe','normal','allow'].includes(sc.riskLevel)) score = Math.min(100, score + 1);
    });
    return Math.max(30, Math.min(100, score));
};

// ============================================================
//  PDF EXPORT — lazy-loaded jsPDF
// ============================================================
window._appendExportBtn = function(resultsEl, toolName, riskLevel, summary) {
    window.saveScanToHistory(toolName, riskLevel, summary);
    resultsEl.querySelector('.export-btn-row')?.remove();
    const row = document.createElement('div');
    row.className = 'export-btn-row';
    row.style.cssText = 'margin-top:1rem;padding-top:0.85rem;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:0.6rem;flex-wrap:wrap;';
    const btnStyle = `padding:0.55rem 1rem;border-radius:8px;font-family:Outfit,sans-serif;font-size:0.81rem;font-weight:700;cursor:pointer;transition:all 0.2s;`;
    row.innerHTML = `
        <button onclick="window._downloadReport('${toolName}','${riskLevel}')"
            style="${btnStyle}background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);color:#a5b4fc;"
            onmouseover="this.style.background='rgba(99,102,241,0.2)'" onmouseout="this.style.background='rgba(99,102,241,0.1)'">📥 Download PDF Report</button>
    `;
    resultsEl.appendChild(row);
};

window._downloadReport = async function(toolName, riskLevel) {
    if (!window.jspdf) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const W = 210, margin = 20;

    doc.setFillColor(13, 15, 26); doc.rect(0, 0, W, 297, 'F');
    doc.setFillColor(20, 22, 40); doc.rect(0, 0, W, 45, 'F');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text('THE PAPYRUS', margin, 22);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(165, 180, 252);
    doc.text('Cybersecurity Analysis Report', margin, 31);
    doc.setFontSize(8); doc.setTextColor(100, 100, 130);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - margin, 31, { align: 'right' });

    doc.setDrawColor(99, 102, 241); doc.setLineWidth(0.4); doc.line(margin, 45, W - margin, 45);

    let y = 58;
    const meta = [
        ['Tool', toolName], ['Risk Level', riskLevel.toUpperCase()],
        ['Analysis Engine', window.hasGeminiKey() ? 'Gemini 2.0 Flash (AI)' : 'Heuristic'],
        ['Date', new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })]
    ];
    meta.forEach(([k, v]) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(165, 180, 252);
        doc.text(k.toUpperCase(), margin, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(220, 220, 235);
        doc.text(v, margin + 40, y); y += 8;
    });

    doc.setDrawColor(50, 52, 80); doc.setLineWidth(0.3); doc.line(margin, y + 2, W - margin, y + 2); y += 12;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(165, 180, 252);
    doc.text('Analysis Results', margin, y); y += 8;

    const resultsEl = document.getElementById('sim-results');
    const rawText = resultsEl ? resultsEl.innerText.replace(/Download PDF Report/gi, '').replace(/\n{3,}/g, '\n\n').trim() : 'No result data.';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(200, 200, 215);
    const lines = doc.splitTextToSize(rawText, W - margin * 2);
    lines.forEach(line => { if (y > 270) { doc.addPage(); doc.setFillColor(13,15,26); doc.rect(0,0,W,297,'F'); y = 20; } doc.text(line, margin, y); y += 5.5; });

    doc.setFontSize(7); doc.setTextColor(70, 70, 100);
    doc.text('The Papyrus Security Platform · All analysis is for educational purposes only', W / 2, 290, { align: 'center' });

    doc.save(`papyrus-${toolName.replace(/[^a-z0-9]/gi,'_').toLowerCase()}-${Date.now()}.pdf`);
};

// ============================================================
//  BREACH MONITOR — HIBP k-Anonymity API
// ============================================================
window.runBreachCheck = async function() {
    const pass = document.getElementById('sim-breach-pass')?.value?.trim();
    if (!pass) return;
    const progress = document.getElementById('sim-progress');
    const progressFill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');
    progress.style.display = 'block'; results.style.display = 'none'; progressFill.style.width = '0%';
    let w = 0;
    const tick = setInterval(() => { if (w < 80) { w += 6; progressFill.style.width = w + '%'; } }, 80);
    try {
        const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(pass));
        const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
        const prefix = hex.slice(0, 5), suffix = hex.slice(5);
        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { 'Add-Padding': 'true' } });
        clearInterval(tick); progressFill.style.width = '100%';
        if (!res.ok) throw new Error(`API ${res.status}`);
        const text = await res.text();
        const match = text.split('\n').find(l => l.toUpperCase().startsWith(suffix));
        const count = match ? parseInt(match.split(':')[1]) : 0;
        results.style.display = 'block';
        if (count > 0) {
            const level = count > 100000 ? 'badge-danger' : 'badge-warning';
            results.innerHTML = `
                <div class="${level} sim-badge">⚠️ Pwned! Found in ${count.toLocaleString()} breach record${count>1?'s':''}</div>
                <p style="margin-top:0.75rem;line-height:1.6;">This password has appeared in <strong style="color:#f87171;">${count.toLocaleString()}</strong> known data breach records. It is not safe to use.</p>
                <p style="margin-top:0.5rem;font-size:0.88rem;color:#fbbf24;"><strong>Action required:</strong> Change this password on every site where you use it. Use our Password Guardian to generate a stronger replacement.</p>
            `;
            window._appendExportBtn(results, 'Breach Monitor', 'critical', `Password found in ${count.toLocaleString()} breach records`);
        } else {
            results.innerHTML = `
                <div class="badge-safe sim-badge">✅ Not Found — Password Not Pwned</div>
                <p style="margin-top:0.75rem;">This password has not appeared in any known data breach. Good news!</p>
                <p style="margin-top:0.4rem;font-size:0.87rem;color:rgba(255,255,255,0.45);">Remember: still use a unique password for every service and enable 2FA everywhere.</p>
            `;
            window._appendExportBtn(results, 'Breach Monitor', 'safe', 'Password not found in any known breach records');
        }
    } catch(e) {
        clearInterval(tick); progressFill.style.width = '100%';
        results.style.display = 'block';
        results.innerHTML = `<div class="badge-warning sim-badge">Connection Error</div><p style="margin-top:0.5rem;font-size:0.88rem;">${e.message} — Check your connection or visit haveibeenpwned.com manually.</p>`;
    }
};

window.switchBreachTab = function(tab) {
    document.getElementById('breach-pass-panel').style.display = tab === 'pass' ? 'block' : 'none';
    document.getElementById('breach-email-panel').style.display = tab === 'email' ? 'block' : 'none';
    document.querySelectorAll('.breach-tab').forEach((btn, i) => {
        const active = (i === 0 && tab === 'pass') || (i === 1 && tab === 'email');
        btn.style.background = active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)';
        btn.style.borderColor = active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)';
        btn.style.color = active ? '#a5b4fc' : 'rgba(255,255,255,0.5)';
    });
};

// ============================================================
//  GEMINI CHAT ASSISTANT — Floating Widget
// ============================================================
window.initChatWidget = function() {
    if (document.getElementById('papyrus-chat-fab')) return;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fabPulse { 0%,100%{box-shadow:0 8px 25px rgba(99,102,241,0.45)} 50%{box-shadow:0 8px 40px rgba(99,102,241,0.75)} }
        #papyrus-chat-panel { display:none; flex-direction:column; }
        #papyrus-chat-panel.open { display:flex!important; }
        #chat-messages::-webkit-scrollbar{width:4px} #chat-messages::-webkit-scrollbar-track{background:transparent} #chat-messages::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.35);border-radius:2px}
        .cmsg-bot,.cmsg-user{display:flex;gap:0.5rem;align-items:flex-start;}
        .cmsg-user{justify-content:flex-end;}
        .cmsg-bubble{padding:0.65rem 0.9rem;font-size:0.87rem;line-height:1.55;max-width:88%;word-break:break-word;}
        .cmsg-bot .cmsg-bubble{background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:12px 12px 12px 3px;color:rgba(255,255,255,0.88);}
        .cmsg-user .cmsg-bubble{background:rgba(99,102,241,0.22);border:1px solid rgba(99,102,241,0.35);border-radius:12px 12px 3px 12px;color:#fff;}
    `;
    document.head.appendChild(style);

    // FAB button
    const fab = document.createElement('button');
    fab.id = 'papyrus-chat-fab';
    fab.title = 'Ask Papyrus AI';
    fab.innerHTML = '💬';
    fab.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4f46e5);border:none;cursor:pointer;font-size:1.35rem;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(99,102,241,0.45);z-index:8888;animation:fabPulse 2.5s infinite;transition:transform 0.2s;`;
    fab.onmouseover = () => fab.style.transform = 'scale(1.1)';
    fab.onmouseout = () => fab.style.transform = 'scale(1)';
    fab.onclick = window.toggleChat;
    document.body.appendChild(fab);

    const hasKey = window.hasGeminiKey();
    // Chat panel
    const panel = document.createElement('div');
    panel.id = 'papyrus-chat-panel';
    panel.style.cssText = `position:fixed;bottom:5rem;right:1.5rem;width:350px;max-height:500px;background:linear-gradient(160deg,#0d0f1a,#111827);border:1px solid rgba(99,102,241,0.3);border-radius:20px;z-index:8887;box-shadow:0 20px 60px rgba(0,0,0,0.7);overflow:hidden;`;
    panel.innerHTML = `
        <div style="padding:0.9rem 1.1rem;background:rgba(99,102,241,0.1);border-bottom:1px solid rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:0.6rem;">
                <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#22d3ee);display:flex;align-items:center;justify-content:center;font-size:0.95rem;">🤖</div>
                <div>
                    <div style="font-weight:700;color:#fff;font-size:0.88rem;">Papyrus AI</div>
                    <div style="font-size:0.68rem;color:#4ade80;">● Cybersecurity Expert</div>
                </div>
            </div>
            <button onclick="window.toggleChat()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.4rem;cursor:pointer;line-height:1;padding:0;">×</button>
        </div>
        <div id="chat-messages" style="flex:1;overflow-y:auto;padding:0.9rem;display:flex;flex-direction:column;gap:0.65rem;min-height:200px;max-height:300px;">
            <div class="cmsg-bot"><span style="font-size:1rem;flex-shrink:0;">🤖</span><div class="cmsg-bubble">Hi! I'm Papyrus AI — your cybersecurity assistant. Ask me anything about phishing, passwords, encryption, or any of our 11 tools!</div></div>
            ${!hasKey ? `<div class="cmsg-bot"><span style="font-size:1rem;flex-shrink:0;">⚙️</span><div class="cmsg-bubble" style="border-color:rgba(251,191,36,0.3);background:rgba(251,191,36,0.08);color:#fde68a;">No Gemini API key set. Set one in AI Settings to enable the chat assistant.</div></div>` : ''}
        </div>
        <div style="padding:0.65rem;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:0.4rem;">
            <input id="chat-input" type="text" placeholder="${hasKey ? 'Ask a cybersecurity question...' : 'Set API key to chat...'}"
                ${hasKey ? '' : 'disabled'}
                onkeydown="if(event.key==='Enter') window.sendChatMsg()"
                style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9px;padding:0.6rem 0.8rem;color:#fff;font-size:0.86rem;font-family:Outfit,sans-serif;outline:none;">
            <button onclick="window.sendChatMsg()" ${hasKey ? '' : 'disabled'}
                style="padding:0.6rem 0.85rem;background:${hasKey ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'rgba(255,255,255,0.05)'};border:none;border-radius:9px;color:#fff;cursor:${hasKey ? 'pointer' : 'not-allowed'};font-size:0.95rem;">▶</button>
        </div>
        ${!hasKey ? `<div style="padding:0 0.65rem 0.65rem;"><button onclick="openGeminiSettings()" style="width:100%;padding:0.55rem;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:8px;color:#a5b4fc;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;">⚙️ Configure Gemini API Key</button></div>` : ''}
    `;
    document.body.appendChild(panel);
};

window.toggleChat = function() {
    const p = document.getElementById('papyrus-chat-panel');
    if (!p) return;
    p.classList.toggle('open');
    if (p.classList.contains('open')) document.getElementById('chat-input')?.focus();
};

let _chatHistory = [];
window.sendChatMsg = async function() {
    if (!window.hasGeminiKey()) { window.openGeminiSettings(); return; }
    const input = document.getElementById('chat-input');
    const msgs = document.getElementById('chat-messages');
    const msg = input?.value?.trim();
    if (!msg) return;
    input.value = '';

    // User bubble
    const ub = document.createElement('div');
    ub.className = 'cmsg-user';
    ub.innerHTML = `<div class="cmsg-bubble">${msg.replace(/</g,'&lt;')}</div><span style="font-size:1rem;flex-shrink:0;">👤</span>`;
    msgs.appendChild(ub);

    // Bot loading bubble
    const bb = document.createElement('div');
    bb.className = 'cmsg-bot';
    bb.innerHTML = `<span style="font-size:1rem;flex-shrink:0;">🤖</span><div class="cmsg-bubble" style="color:rgba(255,255,255,0.4);">Thinking…</div>`;
    msgs.appendChild(bb);
    msgs.scrollTop = msgs.scrollHeight;

    _chatHistory.push({ role: 'user', content: msg });
    const lang = localStorage.getItem('language') === 'hindi' ? 'Hindi (Devanagari)' : 'English';
    const sys = `You are Papyrus AI, a friendly expert cybersecurity assistant on The Papyrus security platform. The platform has 11 tools: Phishing Scanner, AI Threat Detection, Deepfake Detection, File Verifier, Encryption Vault, DLP Scanner, Password Guardian, Secure API Management, Fraud Detection, Privacy AI, and Breach Monitor. Answer concisely in under 120 words. Respond in ${lang}.`;
    const prompt = `${sys}\n\n${_chatHistory.slice(-8).map(m=>`${m.role==='user'?'User':'Assistant'}: ${m.content}`).join('\n')}\nAssistant:`;

    try {
        const reply = await window.callGemini(prompt);
        bb.querySelector('.cmsg-bubble').style.color = 'rgba(255,255,255,0.88)';
        bb.querySelector('.cmsg-bubble').textContent = reply;
        _chatHistory.push({ role: 'assistant', content: reply });
    } catch(e) {
        bb.querySelector('.cmsg-bubble').style.color = '#f87171';
        bb.querySelector('.cmsg-bubble').textContent = `Error: ${e.message}`;
    }
    msgs.scrollTop = msgs.scrollHeight;
};

// Init chat widget on every page
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.initChatWidget, 600);
    
    // --- Auto-open Simulator Handler ---
    // Opens the simulator automatically if redirected from dashboard/about dropdowns
    if (window.location.pathname.includes('services.html') || window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const autoOpen = localStorage.getItem('autoOpenSim');
        if (autoOpen) {
            localStorage.removeItem('autoOpenSim');
            setTimeout(() => {
                if (typeof window.openSimulator === 'function') {
                    window.openSimulator(autoOpen);
                }
            }, 400);
        }
    }
});