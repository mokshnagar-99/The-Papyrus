
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

    // Add active class to current sidebar nav link
    const currentLocation = window.location.pathname.split('/').pop() || 'index.html';
    
    // Handle sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.split('/').pop() === currentLocation) {
            link.classList.add('active');
        }
    });
    
    // Also check direct links
    const directLinks = document.querySelectorAll('.sidebar-bottom .sidebar-link, .sidebar-sign-in-btn');
    directLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.split('/').pop() === currentLocation) {
            link.classList.add('active');
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
    // Set persistence 
    localStorage.setItem('autoOpenSim', toolId);
    
    console.log('Opening tool:', toolId);
    
    // Open tool directly
    if (typeof window.openSimulator === 'function') {
        window.openSimulator(toolId);
    } else {
        // Fallback: create modal directly
        // Clear any existing modal
        const existing = document.querySelector('.modal-overlay');
        if (existing) {
            existing.remove();
        }
        
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'service-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-btn" id="close-service-modal">&times;</button>
                <div style="text-align:center;padding:2rem;">
                    <h2 class="sim-title">${toolId.charAt(0).toUpperCase() + toolId.slice(1).replace('_', ' ')}</h2>
                    <p style="color:rgba(255,255,255,0.5);margin-top:1rem;">Tool loading...</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close handler
        document.getElementById('close-service-modal').onclick = function() {
            document.getElementById('service-modal').classList.add('hidden');
        };
        
        // Show modal
        setTimeout(function() {
            var m = document.getElementById('service-modal');
            if (m) m.classList.remove('hidden');
        }, 100);
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
            <div class="security-tool-header">
                <div class="security-tool-icon-wrap password">🔐</div>
                <div class="security-tool-title-group">
                    <div class="security-tool-title" data-en="Smart Password Guardian" data-hi="स्मार्ट पासवर्ड गार्डियन">Smart Password Guardian</div>
                    <div class="security-tool-subtitle" data-en="Real-time strength analysis + breach detection" data-hi="रीयल-टाइम स्ट्रेंग्थ एनालिसिस + ब्रीच डिटेक्शन">Real-time strength analysis + breach detection</div>
                </div>
            </div>
            
            <div class="security-tool-section">
                <div class="security-tool-section-title">
                    <span class="step-num">⚡</span>
                    <span data-en="Password Strength Test" data-hi="पासवर्ड स्ट्रेंग्थ टेस्ट">Password Strength Test</span>
                </div>
                <p style="color:rgba(255,255,255,0.5); margin-bottom:1.25rem; font-size:0.95rem;" data-en="Test your password strength in real-time with visual feedback." data-hi="विज़ुअल फीडबैक के साथ वास्तविक समय में अपने पासवर्ड की ताकत का परीक्षण करें।">Test your password strength in real-time with visual feedback.</p>
                
                <div class="security-input-group">
                    <input type="password" id="sim-pass-input" class="sim-input" placeholder=" " onkeyup="checkPasswordStrength()">
                    <label class="security-input-label" data-en="Enter a password to test..." data-hi="परीक्षण के लिए पासवर्ड दर्ज करें...">Enter a password to test...</label>
                </div>
                
                <div id="pass-strength-display" style="margin-top:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <span style="color:rgba(255,255,255,0.6); font-size:0.9rem;" data-en="Strength:" data-hi="ताकत:">Strength:</span>
                        <span id="pass-strength" style="font-weight:700; font-size:0.95rem;">—</span>
                    </div>
                    <div class="security-strength-meter">
                        <div id="sim-progress-fill" class="security-strength-fill" style="width:0%;"></div>
                    </div>
                    <p style="margin-top:0.75rem; font-size:0.9rem; color:rgba(255,255,255,0.5);" id="pass-feedback"></p>
                </div>
                
                <div class="security-check-list">
                    <div class="security-check-item" id="check-length">
                        <span class="security-check-icon">✓</span>
                        <span data-en="8+ characters" data-hi="8+ अक्षर">8+ characters</span>
                    </div>
                    <div class="security-check-item" id="check-upper">
                        <span class="security-check-icon">✓</span>
                        <span data-en="Uppercase letter" data-hi="अपरकेस अक्षर">Uppercase</span>
                    </div>
                    <div class="security-check-item" id="check-number">
                        <span class="security-check-icon">✓</span>
                        <span data-en="Number" data-hi="नंबर">Number</span>
                    </div>
                    <div class="security-check-item" id="check-symbol">
                        <span class="security-check-icon">✓</span>
                        <span data-en="Symbol (!@#$%)" data-hi="सिंबल (!@#$%)">Symbol</span>
                    </div>
                </div>
            </div>
            
            <div class="security-divider">
                <span data-en="OR" data-hi="या">OR</span>
            </div>
            
            <div class="security-tool-section">
                <div class="security-tool-section-title">
                    <span class="step-num">🛡️</span>
                    <span data-en="Breach Check" data-hi="ब्रीच चेक">Breach Check</span>
                </div>
                <p style="color:rgba(255,255,255,0.5); margin-bottom:1.25rem; font-size:0.95rem;" data-en="Check if your password has appeared in known data breaches. Privacy-safe — only a partial hash is sent." data-hi="जांचें कि आपका पासवर्ड ज्ञात डेटा उल्लंघनों में दिखाई दिया है या निजता-सुरक्षित — केवल आंशिक हैश भेजा जाता है।">Check if your password has appeared in known data breaches. Privacy-safe — only a partial hash is sent.</p>
                
                <div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.15); border-radius:12px; padding:1rem; margin-bottom:1.25rem;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <span style="font-size:1.25rem;">🔒</span>
                        <div>
                            <strong style="color:#fff; font-size:0.9rem;">k-Anonymity</strong>
                            <p style="color:rgba(255,255,255,0.4); font-size:0.8rem; margin:0;">Only first 5 chars of SHA-1 hash sent. Your password never leaves your device.</p>
                        </div>
                    </div>
                </div>
                
                <div class="security-input-group">
                    <input type="password" id="sim-breach-pass" class="sim-input" placeholder=" " autocomplete="new-password">
                    <label class="security-input-label" data-en="Enter password to check breaches..." data-hi="उल्लंघन जांचने के लिए पासवर्ड दर्ज करें...">Enter password to check breaches...</label>
                </div>
                
                <button class="sim-btn" style="margin-top:0.5rem;" onclick="checkBreach()">
                    <span data-en="Check Against Known Breaches" data-hi="ज्ञात उल्लंघनों के विरुद्ध जांचें">Check Against Known Breaches</span>
                </button>
                
                <div id="breach-results" class="hidden" style="margin-top:1rem;"></div>
            </div>
        `;
    } else if (serviceType === 'fraud') {
        contentHTML = `
            <div class="security-tool-header">
                <div class="security-tool-icon-wrap fraud">🕵️</div>
                <div class="security-tool-title-group">
                    <div class="security-tool-title" data-en="Fraud Detection" data-hi="फ्रॉड डिटेक्शन">Fraud Detection</div>
                    <div class="security-tool-subtitle" data-en="Transaction pattern analysis & risk scoring" data-hi="ट्रांज़ैक्शन पैटर्न एनालिसिस और रिस्क स्कोरिंग">Transaction pattern analysis & risk scoring</div>
                </div>
            </div>
            
            <div class="security-tool-section">
                <div class="security-tool-section-title">
                    <span class="step-num">💳</span>
                    <span data-en="Analyze Transaction" data-hi="ट्रांज़ैक्शन का विश्लेषण करें">Analyze Transaction</span>
                </div>
                <p style="color:rgba(255,255,255,0.5); margin-bottom:1.25rem; font-size:0.95rem;" data-en="Enter transaction details to check for fraud indicators and risk factors." data-hi="फ्रॉड संकेतकों और जोखिम कारकों की जांच के लिए ट्रांज़ैक्शन विवरण दर्ज करें।">Enter transaction details to check for fraud indicators and risk factors.</p>
                
                <div class="security-input-group">
                    <input type="number" id="sim-fraud-amt" class="sim-input" placeholder=" ">
                    <label id="fraud-amt-label" class="security-input-label" data-en="Transaction amount (USD)..." data-hi="ट्रांज़ैक्शन राशि (USD)...">Transaction amount (USD)...</label>
                </div>
                
                <label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; font-size:0.85rem; color:rgba(255,255,255,0.6);">
                    <span>🌍</span>
                    <span data-en="Transaction origin country" data-hi="ट्रांज़ैक्शन मूल देश">Transaction origin country</span>
                </label>
                <select id="sim-fraud-country" class="security-select" onchange="updateCurrencyLabel()">
                    <option value="US">🇺🇸 United States</option>
                    <option value="UK">🇬🇧 United Kingdom</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="AU">🇦🇺 Australia</option>
                    <option value="IN">🇮🇳 India</option>
                    <option value="CN">🇨🇳 China</option>
                    <option value="RU">🇷🇺 Russia</option>
                    <option value="BR">🇧🇷 Brazil</option>
                    <option value="NG">🇳🇬 Nigeria</option>
                </select>
                
                <button class="sim-btn" style="margin-top:0.5rem;" onclick="runFraudScan()">
                    <span data-en="Analyze for Fraud" data-hi="फ्रॉड के लिए विश्लेषण करें">Analyze for Fraud</span>
                </button>
                
                <div id="fraud-progress" class="sim-progress-bar" style="display:none; margin-top:1rem;"><div id="fraud-progress-fill" class="sim-progress-fill"></div></div>
                <div id="fraud-results" class="hidden" style="margin-top:1rem;"></div>
            </div>
            
            <div class="security-tool-section" style="margin-top:1.5rem;">
                <div class="security-tool-section-title">
                    <span class="step-num">📊</span>
                    <span data-en="Risk Indicators" data-hi="जोखिम संकेतक">Risk Indicators</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:1rem;">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:1rem; text-align:center;">
                        <div style="font-size:1.5rem; margin-bottom:0.25rem;">🌍</div>
                        <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px;">Geo Mismatch</div>
                        <div style="font-size:0.85rem; color:#fff; margin-top:0.25rem;" data-en="Non-US origin" data-hi="गैर-यूएस मूल">Non-US origin</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:1rem; text-align:center;">
                        <div style="font-size:1.5rem; margin-bottom:0.25rem;">💵</div>
                        <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px;">Amount</div>
                        <div style="font-size:0.85rem; color:#fff; margin-top:0.25rem;" data-en="Over $10,000" data-hi="$10,000 से अधिक">Over $10,000</div>
                    </div>
                </div>
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
            <div class="security-tool-header">
                <div class="security-tool-icon-wrap vault">🔒</div>
                <div class="security-tool-title-group">
                    <div class="security-tool-title" data-en="File Encryption Vault" data-hi="फ़ाइल एन्क्रिप्शन वॉल्ट">File Encryption Vault</div>
                    <div class="security-tool-subtitle" data-en="AES-256-GCM military-grade encryption" data-hi="AES-256-GCM सैन्य-ग्रेड एन्क्रिप्शन">AES-256-GCM military-grade encryption</div>
                </div>
            </div>
            
            <div class="security-tool-section">
                <div class="security-tool-section-title">
                    <span class="step-num">1</span>
                    <span data-en="Lock a File" data-hi="फ़ाइल लॉक करें">Lock a File</span>
                </div>
                <p style="color:rgba(255,255,255,0.5); margin-bottom:1.25rem; font-size:0.95rem;" data-en="Select any file and set a strong password to encrypt it. The file will be downloaded as a secure .papyrus blob." data-hi="कोई भी फ़ाइल चुनें और इसे एन्क्रिप्ट करने के लिए एक मजबूत पासवर्ड सेट करें। फ़ाइल एक सुरक्षित .papyrus ब्लॉब के रूप में डाउनलोड होगी।">Select any file and set a strong password to encrypt it. The file will be downloaded as a secure .papyrus blob.</p>
                
                <div class="security-file-drop" id="encrypt-drop-zone" onclick="document.getElementById('sim-encrypt-file').click()">
                    <div class="security-file-drop-icon">📁</div>
                    <div class="security-file-drop-text" data-en="Drop file here or click to browse" data-hi="फ़ाइल यहाँ ड्रॉप करें या ब्राउज़ करने के लिए क्लिक करें">Drop file here or click to browse</div>
                    <div class="security-file-drop-subtext">PDF, DOCX, TXT, JPG — All formats supported</div>
                </div>
                <input type="file" id="sim-encrypt-file" class="hidden" style="display:none;">
                
                <div class="security-input-group" style="margin-top:1.25rem;">
                    <input type="password" id="sim-encrypt-pass" class="sim-input" placeholder=" ">
                    <label class="security-input-label" data-en="Set encryption password..." data-hi="एन्क्रिप्शन पासवर्ड सेट करें...">Set encryption password...</label>
                </div>
                
                <button class="sim-btn" style="margin-top:0.5rem;" onclick="encryptVaultFile()">
                    <span data-en="Encrypt & Download (.papyrus)" data-hi="एन्क्रिप्ट और डाउनलोड करें (.papyrus)">Encrypt & Download (.papyrus)</button>
                </button>
                
                <div id="sim-progress-encrypt" class="sim-progress-bar" style="display:none; margin-top:1rem;"><div id="sim-progress-fill-encrypt" class="sim-progress-fill"></div></div>
                <div id="sim-results-encrypt" class="hidden" style="margin-top:1rem;"></div>
            </div>
            
            <div class="security-divider">
                <span data-en="OR" data-hi="या">OR</span>
            </div>
            
            <div class="security-tool-section">
                <div class="security-tool-section-title">
                    <span class="step-num">2</span>
                    <span data-en="Unlock a File" data-hi="फ़ाइल अनलॉक करें">Unlock a File</span>
                </div>
                <p style="color:rgba(255,255,255,0.5); margin-bottom:1.25rem; font-size:0.95rem;" data-en="Upload an encrypted .papyrus file and enter the original password to unlock and restore it." data-hi="एक एन्क्रिप्टेड .papyrus फ़ाइल अपलोड करें और इसे अनलॉक करने और पुनर्स्थापित करने के लिए मूल पासवर्ड दर्ज करें।">Upload an encrypted .papyrus file and enter the original password to unlock and restore it.</p>
                
                <div class="security-file-drop" id="decrypt-drop-zone" onclick="document.getElementById('sim-decrypt-file').click()">
                    <div class="security-file-drop-icon">🔐</div>
                    <div class="security-file-drop-text" data-en="Drop encrypted .papyrus file" data-hi="एन्क्रिप्टेड .papyrus फ़ाइल ड्रॉप करें">Drop encrypted .papyrus file</div>
                    <div class="security-file-drop-subtext">.papyrus files only</div>
                </div>
                <input type="file" id="sim-decrypt-file" class="hidden" style="display:none;" accept=".papyrus">
                
                <div class="security-input-group" style="margin-top:1.25rem;">
                    <input type="password" id="sim-decrypt-pass" class="sim-input" placeholder=" ">
                    <label class="security-input-label" data-en="Enter decryption password..." data-hi="डिक्रिप्शन पासवर्ड दर्ज करें...">Enter decryption password...</label>
                </div>
                
                <button class="sim-btn" style="margin-top:0.5rem;" onclick="decryptVaultFile()">
                    <span data-en="Decrypt & Download Original" data-hi="डिक्रिप्ट और ओरिजिनल डाउनलोड करें">Decrypt & Download Original</button>
                </button>
                
                <div id="sim-progress-decrypt" class="sim-progress-bar" style="display:none; margin-top:1rem;"><div id="sim-progress-fill-decrypt" class="sim-progress-fill"></div></div>
                <div id="sim-results-decrypt" class="hidden" style="margin-top:1rem;"></div>
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
            <div class="security-tool-header">
                <div class="security-tool-icon-wrap dlp">🚫</div>
                <div class="security-tool-title-group">
                    <div class="security-tool-title" data-en="Data Leakage Prevention" data-hi="डेटा रिसाव रोकथाम">Data Leakage Prevention</div>
                    <div class="security-tool-subtitle" data-en="Detect and redact sensitive information in text" data-hi="टेक्स्ट में संवेदनशील जानकारी का पता लगाएं और हटाएं">Detect and redact sensitive information in text</div>
                </div>
            </div>
            
            <div class="security-tool-section">
                <div class="security-tool-section-title">
                    <span class="step-num">🔍</span>
                    <span data-en="Scan Your Content" data-hi="अपनी सामग्री स्कैन करें">Scan Your Content</span>
                </div>
                <p style="color:rgba(255,255,255,0.5); margin-bottom:1.25rem; font-size:0.95rem;" data-en="Analyze outgoing text for sensitive information (PII, SSN, Credit Cards, Phone Numbers)." data-hi="संवेदनशील जानकारी के लिए आउटगोइंग टेक्स्ट का विश्लेषण करें (PII, SSN, क्रेडिट कार्ड, फ़ोन नंबर)।">Analyze outgoing text for sensitive information (PII, SSN, Credit Cards, Phone Numbers).</p>
                
                <div class="security-scan-animation">
                    <div class="security-scan-radar"></div>
                    <div class="security-scan-line"></div>
                </div>
                
                <textarea id="sim-dlp-input" class="sim-input" rows="5" placeholder="Hi team, my new phone number is 555-0198 and my card details are 4532 1122 8890 0011." style="min-height:140px; resize:none;"></textarea>
                
                <button class="sim-btn" onclick="runDLPScan()">
                    <span data-en="Inspect Payload" data-hi="पेलोड का निरीक्षण करें">Inspect Payload</button>
                </button>
                
                <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
                <div id="sim-results" class="hidden" style="margin-top:1rem;"></div>
            </div>
        `;
} else if (serviceType === 'federated') {
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
            <p style="margin-top:0.5rem">No obvious phishing indicators found.</p>
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
    const checkLength = document.getElementById('check-length');
    const checkUpper = document.getElementById('check-upper');
    const checkNumber = document.getElementById('check-number');
    const checkSymbol = document.getElementById('check-symbol');
    
    if(checkLength) {
        if(val.length >= 8) {
            checkLength.classList.add('met');
        } else {
            checkLength.classList.remove('met');
        }
    }
    if(checkUpper) {
        if(/[A-Z]/.test(val)) {
            checkUpper.classList.add('met');
        } else {
            checkUpper.classList.remove('met');
        }
    }
    if(checkNumber) {
        if(/[0-9]/.test(val)) {
            checkNumber.classList.add('met');
        } else {
            checkNumber.classList.remove('met');
        }
    }
    if(checkSymbol) {
        if(/[^A-Za-z0-9]/.test(val)) {
            checkSymbol.classList.add('met');
        } else {
            checkSymbol.classList.remove('met');
        }
    }
    
    if(!val) {
        strengthText.innerText = "—";
        strengthText.style.color = 'rgba(255,255,255,0.4)';
        fill.style.width = '0%';
        fill.className = 'security-strength-fill';
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
        strengthText.innerText = "Weak";
        strengthText.style.color = '#f87171';
        fill.style.width = '33%';
        fill.className = 'security-strength-fill weak';
        feedback.innerText = "Too easy to guess. Try adding numbers, special characters, or increasing length.";
    } else if (strength <= 4) {
        strengthText.innerText = "Moderate";
        strengthText.style.color = '#fbbf24';
        fill.style.width = '66%';
        fill.className = 'security-strength-fill medium';
        feedback.innerText = "Good, but could be stronger. Consider using a longer passphrase.";
    } else {
        strengthText.innerText = "Strong";
        strengthText.style.color = '#4ade80';
        fill.style.width = '100%';
        fill.className = 'security-strength-fill strong';
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
                a.download = file.name + ".papyrus";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
                
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
    
    if(!input.trim()) {
        results.style.display = 'block';
        results.innerHTML = `<div class="security-result-card warning"><p style="margin:0;">Please enter some text to scan.</p></div>`;
        return;
    }
    
    progress.style.display = 'block';
    results.style.display = 'none';
    results.classList.add('hidden');
    progressFill.style.width = '0%';
    
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
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
            let flags = [];
            let foundCards = [];
            
            if(cardRegex.test(input)) {
                flags.push('credit-card');
                const cardMatches = input.match(/\b(?:\d[ -]*?){13,16}\b/g);
                if(cardMatches) foundCards = cardMatches.slice(0,3);
            }
            if(ssnRegex.test(input)) flags.push('ssn');
            if(phoneRegex.test(input)) flags.push('phone');
            if(emailRegex.test(input)) flags.push('email');
            
            results.classList.remove('hidden');
            
            if(flags.length > 0) {
                let tagsHTML = '';
                if(flags.includes('credit-card')) tagsHTML += '<span class="security-tag credit-card">💳 Credit Card</span>';
                if(flags.includes('ssn')) tagsHTML += '<span class="security-tag ssn">🆔 SSN</span>';
                if(flags.includes('phone')) tagsHTML += '<span class="security-tag phone">📱 Phone</span>';
                if(flags.includes('email')) tagsHTML += '<span class="security-tag email">✉️ Email</span>';
                
                results.innerHTML = `
                    <div class="security-result-card danger">
                        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                            <span style="font-size:1.5rem;">🚫</span>
                            <span style="font-size:1.1rem; font-weight:700; color:#f87171;">PII Detected — Blocked</span>
                        </div>
                        <div class="security-tags">${tagsHTML}</div>
                        <p style="margin-top:1rem; margin-bottom:0.5rem; line-height:1.6;">Policy Violation: <strong>${flags.length}</strong> sensitive data type${flags.length>1?'s':''} detected.</p>
                        <p style="font-size:0.9rem; color:#f87171;">Data transfer has been blocked for review.</p>
                    </div>
                `;
            } else {
                results.innerHTML = `
                    <div class="security-result-card safe">
                        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                            <span style="font-size:1.5rem;">✅</span>
                            <span style="font-size:1.1rem; font-weight:700; color:#4ade80;">Cleared — No PII Found</span>
                        </div>
                        <p style="margin-bottom:0.5rem; line-height:1.6;">Content complies with DLP policies. Safe to transmit.</p>
                        <p style="font-size:0.85rem; color:rgba(255,255,255,0.4); margin:0;">No credit card numbers, SSN, or phone numbers detected.</p>
                    </div>
                `;
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

window.updateCurrencyLabel = function() {
    const country = document.getElementById('sim-fraud-country').value;
    const label = document.getElementById('fraud-amt-label');
    const currencyMap = {
        'US': 'USD', 'UK': 'GBP', 'DE': 'EUR', 'CA': 'CAD',
        'AU': 'AUD', 'IN': 'INR', 'CN': 'CNY', 'RU': 'RUB',
        'BR': 'BRL', 'NG': 'NGN'
    };
    const currency = currencyMap[country] || 'USD';
    label.textContent = `Transaction amount (${currency})...`;
    label.setAttribute('data-en', `Transaction amount (${currency})...`);
    label.setAttribute('data-hi', `ट्रांज़ैक्शन राशि (${currency})...`);
}

window.runFraudScan = function() {
    const amt = parseFloat(document.getElementById('sim-fraud-amt').value);
    const country = document.getElementById('sim-fraud-country').value;
    const progress = document.getElementById('fraud-progress');
    const progressFill = document.getElementById('fraud-progress-fill');
    const results = document.getElementById('fraud-results');
    
    if(isNaN(amt)) {
        results.style.display = 'block';
        results.innerHTML = `<div class="security-result-card warning"><p style="margin:0;">Please enter a valid amount.</p></div>`;
        return;
    }
    
    progress.style.display = 'block';
    results.style.display = 'none';
    results.classList.add('hidden');
    progressFill.style.width = '0%';
    
    let width = 0;
    const interval = setInterval(() => {
        width += 20;
        progressFill.style.width = width + '%';
        if(width >= 100) {
            clearInterval(interval);
            
            let isSuspicious = false;
            let riskScore = 0;
            let reasons = [];
            
            if(country !== "US") {
                isSuspicious = true;
                riskScore += 45;
                reasons.push("Non-US transaction origin");
            }
            if(amt > 10000) {
                isSuspicious = true;
                riskScore += 45;
                reasons.push("Amount exceeds $10,000 threshold");
            }
            if(amt > 1000 && amt <= 10000) {
                riskScore += 20;
            }
            
            const finalScore = Math.min(99, 12 + riskScore);
            
            results.classList.remove('hidden');
            
            if(isSuspicious || finalScore > 50) {
                const cardClass = finalScore > 75 ? 'danger' : 'warning';
                const icon = finalScore > 75 ? '🚨' : '⚠️';
                const label = finalScore > 75 ? 'High Risk — Blocked' : 'Suspicious — Review Required';
                
                let reasonHTML = reasons.map(r => `<div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.5rem;"><span style="color:#fbbf24;">•</span><span>${r}</span></div>`).join('');
                
                results.innerHTML = `
                    <div class="security-result-card ${cardClass}">
                        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                            <span style="font-size:1.5rem;">${icon}</span>
                            <span style="font-size:1.1rem; font-weight:700; color:${finalScore > 75 ? '#f87171' : '#fbbf24'};">${label}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                            <div style="flex:1;">
                                <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.25rem;">Fraud Score</div>
                                <div style="font-size:2rem; font-weight:800; color:${finalScore > 75 ? '#f87171' : '#fbbf24'};">${finalScore}<span style="font-size:1rem; color:rgba(255,255,255,0.4);">/100</span></div>
                            </div>
                        </div>
                        <p style="margin-bottom:0.5rem; font-weight:600;">Risk Factors Detected:</p>
                        ${reasonHTML}
                        <p style="margin-top:1rem; font-size:0.85rem; color:rgba(255,255,255,0.5);">This transaction has been flagged for manual review.</p>
                    </div>
                `;
            } else {
                results.innerHTML = `
                    <div class="security-result-card safe">
                        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                            <span style="font-size:1.5rem;">✅</span>
                            <span style="font-size:1.1rem; font-weight:700; color:#4ade80;">Approved — Low Risk</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                            <div style="flex:1;">
                                <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.25rem;">Fraud Score</div>
                                <div style="font-size:2rem; font-weight:800; color:#4ade80;">${finalScore}<span style="font-size:1rem; color:rgba(255,255,255,0.4);">/100</span></div>
                            </div>
                        </div>
                        <p style="margin-bottom:0.5rem; line-height:1.6;">Transaction is consistent with user profile and history.</p>
                        <p style="font-size:0.85rem; color:rgba(255,255,255,0.4); margin:0;">No fraud indicators detected.</p>
                    </div>
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
//  BREACH CHECK — Button Triggered
// ============================================================
window.checkBreach = async function() {
    const passField = document.getElementById('sim-breach-pass');
    const pass = passField?.value?.trim();
    const results = document.getElementById('breach-results');
    
    if (!pass) {
        if(results) {
            results.style.display = 'block';
            results.innerHTML = `<div class="security-result-card warning"><p style="margin:0;">Please enter a password to check.</p></div>`;
        }
        return;
    }
    
    results.style.display = 'block';
    results.innerHTML = `<div style="text-align:center; padding:1rem;"><div class="security-scan-animation" style="height:60px; margin:0 auto 1rem; width:60px;"></div><p style="color:rgba(255,255,255,0.5);">Checking databases...</p></div>`;
    
    try {
        const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(pass));
        const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
        const prefix = hex.slice(0, 5), suffix = hex.slice(5);
        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { 'Add-Padding': 'true' } });
        
        if (!res.ok) throw new Error(`API ${res.status}`);
        const text = await res.text();
        const match = text.split('\n').find(l => l.toUpperCase().startsWith(suffix));
        const count = match ? parseInt(match.split(':')[1]) : 0;
        
        if (count > 0) {
            results.innerHTML = `
                <div class="security-result-card danger">
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
                        <span style="font-size:1.5rem;">⚠️</span>
                        <span style="font-size:1.1rem; font-weight:700; color:#f87171;">Pwned! Found in Breaches</span>
                    </div>
                    <p style="margin-bottom:0.5rem; line-height:1.6;">This password has appeared in <strong style="color:#f87171; font-size:1.2rem;">${count.toLocaleString()}</strong> known data breach records.</p>
                    <p style="font-size:0.9rem; color:#fbbf24; margin-bottom:0;"><strong>Action required:</strong> Change this password immediately on all sites.</p>
                </div>
            `;
        } else {
            results.innerHTML = `
                <div class="security-result-card safe">
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
                        <span style="font-size:1.5rem;">✅</span>
                        <span style="font-size:1.1rem; font-weight:700; color:#4ade80;">Not Found in Breaches</span>
                    </div>
                    <p style="margin-bottom:0.5rem; line-height:1.6;">This password has not appeared in any known data breach.</p>
                    <p style="font-size:0.85rem; color:rgba(255,255,255,0.4); margin:0;">Remember: Use unique passwords for every service and enable 2FA.</p>
                </div>
            `;
        }
    } catch(e) {
        results.innerHTML = `<div class="security-result-card warning"><p style="margin:0;">Error: ${e.message}</p></div>`;
    }
};

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

// Init chat widget on every page
document.addEventListener('DOMContentLoaded', () => {
    
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