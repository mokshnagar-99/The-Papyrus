// ============================================================
//  EMAIL GUARDIAN — The Papyrus
//  Provides the email_guardian simulator content + logic.
//  Note: Real IMAP/OAuth integration requires a server-side 
//  proxy (e.g., Firebase Functions + Gmail API). This module
//  provides the full UI flow and simulates the scanning 
//  experience. The paste-to-scan feature works fully.
// ============================================================

// Inject the email_guardian simulator HTML into openSimulator
(function() {
    const _origOpen = window.openSimulator;
    window.openSimulator = function(serviceType) {
        if (serviceType !== 'email_guardian') {
            return _origOpen ? _origOpen(serviceType) : undefined;
        }

        let modal = document.getElementById('service-modal');
        if (!modal) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="service-modal" class="modal-overlay hidden">
                    <div class="modal-content">
                        <button class="close-btn" id="close-modal">&times;</button>
                        <div id="modal-body"></div>
                    </div>
                </div>
            `);
            modal = document.getElementById('service-modal');
            const cb = document.getElementById('close-modal');
            if (cb) cb.onclick = () => modal.classList.add('hidden');
        }

        const modalBody = document.getElementById('modal-body');
        if (!modal || !modalBody) return;

        const isConnected = localStorage.getItem('eg_connected');
        const provider = localStorage.getItem('eg_provider') || 'gmail';
        const providerMeta = {
            gmail:   { icon: '📬', name: 'Gmail' },
            outlook: { icon: '📮', name: 'Outlook' },
            yahoo:   { icon: '✉️', name: 'Yahoo Mail' },
            imap:    { icon: '🔒', name: 'Custom IMAP' },
        };

        modalBody.innerHTML = `
            <h2 class="sim-title">📧 Email Guardian</h2>
            <p style="color:rgba(255,255,255,0.55);font-size:0.95rem;margin-bottom:1.5rem;line-height:1.6;">
                Connect your inbox so every incoming message is automatically scanned for phishing, malicious links, and impersonation — <em>before</em> you read it.
            </p>

            <!-- Paste-to-scan (always visible) -->
            <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.18);border-radius:16px;padding:1.25rem;margin-bottom:1.25rem;">
                <p style="font-size:0.8rem;font-weight:700;color:#a5b4fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.75rem;">⚡ Instant Scan — Paste Any Email</p>
                <textarea id="eg-paste-input" class="sim-input" rows="5"
                    placeholder="Paste an email subject + body here to scan it instantly for phishing...&#10;&#10;Example: 'Dear Customer, your account will be suspended. Click here: http://bit.ly/...'"></textarea>
                <button class="sim-btn" onclick="window.runEmailGuardianScan()" style="margin-bottom:0;">🔍 Scan Email</button>
            </div>

            <div id="sim-progress" class="sim-progress-bar"><div id="sim-progress-fill" class="sim-progress-fill"></div></div>
            <div id="sim-results" class="sim-results" style="margin-top:1rem;display:none;"></div>

            <!-- Connect section -->
            <div id="eg-connect-panel" style="display:${isConnected ? 'none' : 'block'};">
                <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:1.25rem;margin-top:1.25rem;">
                    <p style="font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem;">🔗 Connect Inbox for Live Scanning</p>
                    <div style="background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:0.85rem;margin-bottom:1rem;font-size:0.82rem;color:#fbbf24;line-height:1.5;">
                        ⚠️ <strong>Note:</strong> Live inbox scanning requires a backend service with OAuth credentials (Firebase Functions + Gmail API). This demo simulates the full UX flow. The paste-to-scan above works fully.
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        ${['gmail','outlook','yahoo','imap'].map(p => `
                            <button onclick="window.connectEmailProvider('${p}')"
                                style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;
                                background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);
                                border-radius:12px;color:rgba(255,255,255,0.75);font-size:0.875rem;font-weight:700;
                                cursor:pointer;font-family:Outfit,sans-serif;transition:all 0.2s;text-align:left;"
                                onmouseover="this.style.background='rgba(99,102,241,0.1)';this.style.borderColor='rgba(99,102,241,0.3)'"
                                onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.09)'">
                                <span style="font-size:1.4rem;">${providerMeta[p].icon}</span>
                                <span>${providerMeta[p].name}<br>
                                    <span style="font-weight:400;font-size:0.72rem;color:rgba(255,255,255,0.3);">${p === 'imap' ? 'App Password' : 'OAuth 2.0'}</span>
                                </span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Connected state -->
            <div id="eg-connected-panel" style="display:${isConnected ? 'block' : 'none'};">
                <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:1.25rem;margin-top:1.25rem;">
                    <div style="display:flex;align-items:center;gap:0.75rem;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.18);border-radius:12px;padding:1rem;margin-bottom:1rem;">
                        <span style="font-size:1.4rem;">${providerMeta[provider]?.icon || '📬'}</span>
                        <div style="flex:1;">
                            <div style="font-size:0.9rem;font-weight:700;color:#4ade80;">${providerMeta[provider]?.name || 'Email'} Connected</div>
                            <div style="font-size:0.75rem;color:rgba(255,255,255,0.35);">Guardian is active — monitoring for threats</div>
                        </div>
                        <div style="width:9px;height:9px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;animation:sdot 2s infinite;"></div>
                    </div>
                    <div id="eg-scan-log" style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:1rem;font-family:monospace;font-size:0.78rem;color:rgba(255,255,255,0.45);height:160px;overflow-y:auto;line-height:1.9;"></div>
                    <button onclick="window.disconnectEmailGuardian()"
                        style="margin-top:0.75rem;padding:0.5rem 1rem;background:rgba(239,68,68,0.08);
                        border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#f87171;
                        font-size:0.82rem;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;transition:all 0.2s;"
                        onmouseover="this.style.background='rgba(239,68,68,0.15)'"
                        onmouseout="this.style.background='rgba(239,68,68,0.08)'">Disconnect</button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Start scan log if connected
        if (isConnected) {
            setTimeout(() => window._startEGScanLog(), 300);
        }
    };
})();

// --- Connect to email provider (simulated OAuth flow) ---
window.connectEmailProvider = function(provider) {
    const providerNames = { gmail: 'Gmail', outlook: 'Outlook', yahoo: 'Yahoo Mail', imap: 'Custom IMAP' };
    const name = providerNames[provider] || provider;

    // Simulate OAuth popup
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);
        display:flex;align-items:center;justify-content:center;z-index:99999;`;
    popup.innerHTML = `
        <div style="background:linear-gradient(135deg,#0d0f1a,#111520);border:1px solid rgba(99,102,241,0.3);
            border-radius:20px;padding:2rem;width:90%;max-width:400px;text-align:center;
            box-shadow:0 20px 60px rgba(0,0,0,0.8);">
            <div style="font-size:2rem;margin-bottom:0.75rem;">🔐</div>
            <h3 style="font-family:Cinzel,serif;color:#fff;margin-bottom:0.5rem;font-size:1.1rem;">Authorize ${name}</h3>
            <p style="color:rgba(255,255,255,0.45);font-size:0.82rem;margin-bottom:1.5rem;line-height:1.6;">
                The Papyrus is requesting <strong style="color:#a5b4fc;">read-only</strong> access to your inbox metadata. 
                You can revoke this at any time from your ${name} settings.
            </p>
            <div style="background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:0.75rem;margin-bottom:1.25rem;font-size:0.8rem;color:#86efac;text-align:left;">
                ✅ Read message headers<br>
                ✅ Read message body text<br>
                ❌ Cannot send or delete emails<br>
                ❌ Cannot access attachments
            </div>
            <div style="display:flex;gap:0.75rem;">
                <button onclick="this.closest('[style*=fixed]').remove()" 
                    style="flex:1;padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                    border-radius:10px;color:rgba(255,255,255,0.5);font-size:0.9rem;font-weight:600;cursor:pointer;font-family:Outfit,sans-serif;">
                    Cancel
                </button>
                <button onclick="window._completeEmailConnect('${provider}');this.closest('[style*=fixed]').remove();"
                    style="flex:1;padding:0.75rem;background:linear-gradient(135deg,#6366f1,#4f46e5);border:none;
                    border-radius:10px;color:#fff;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;
                    box-shadow:0 4px 15px rgba(99,102,241,0.35);">
                    Authorize →
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    popup.addEventListener('click', e => { if (e.target === popup) popup.remove(); });
};

window._completeEmailConnect = function(provider) {
    localStorage.setItem('eg_connected', '1');
    localStorage.setItem('eg_provider', provider);

    // Reopen the modal to show connected state
    window.openSimulator('email_guardian');
    setTimeout(() => window._startEGScanLog(), 500);
};

window.disconnectEmailGuardian = function() {
    localStorage.removeItem('eg_connected');
    localStorage.removeItem('eg_provider');
    window.openSimulator('email_guardian');
};

// --- Live scan log simulation ---
window._egScanInterval = null;
window._startEGScanLog = function() {
    const log = document.getElementById('eg-scan-log');
    if (!log) return;
    if (window._egScanInterval) clearInterval(window._egScanInterval);

    const fakeSenders = ['notifications@linkedin.com','no-reply@amazon.com','security@paypal-support.xyz',
        'team@github.com','alert@bankofamerica-secure.net','support@netflix.com','noreply@dropbox.com'];
    const fakeSubjects = ['Your account needs verification','You have a new message','Invoice #INV-2024-0089 attached',
        'Action required: Unusual sign-in','Reset your password now','You\'ve been selected!','Exclusive offer just for you'];

    const statuses = [
        { label: '✅ SAFE', color: '#4ade80', chance: 0.75 },
        { label: '⚠️ SUSPICIOUS', color: '#fbbf24', chance: 0.15 },
        { label: '🚨 PHISHING', color: '#f87171', chance: 0.10 },
    ];

    let count = 0;
    const addEntry = () => {
        count++;
        const sender = fakeSenders[Math.floor(Math.random() * fakeSenders.length)];
        const subject = fakeSubjects[Math.floor(Math.random() * fakeSubjects.length)];
        const r = Math.random();
        let status = statuses[0];
        if (r > 0.85) status = statuses[2];
        else if (r > 0.70) status = statuses[1];

        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.innerHTML = `<span style="color:rgba(255,255,255,0.2);">${time}</span>  <span style="color:${status.color};font-weight:700;">${status.label}</span>  <span style="color:rgba(255,255,255,0.6);">${sender}</span>  <em style="color:rgba(255,255,255,0.3);">${subject.substr(0,34)}…</em>`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    };

    // Add 3 instant entries on load
    addEntry(); addEntry(); addEntry();

    // Then one every 4 seconds
    window._egScanInterval = setInterval(() => {
        if (!document.getElementById('eg-scan-log')) { clearInterval(window._egScanInterval); return; }
        addEntry();
    }, 4000);
};

// --- Paste-to-scan function ---
window.runEmailGuardianScan = async function() {
    const input = document.getElementById('eg-paste-input')?.value?.trim();
    const progress = document.getElementById('sim-progress');
    const fill = document.getElementById('sim-progress-fill');
    const results = document.getElementById('sim-results');

    if (!input) {
        if (results) { results.style.display = 'block'; results.innerHTML = '<p style="color:#fbbf24;">Please paste an email first.</p>'; }
        return;
    }

    if (progress) progress.style.display = 'block';
    if (fill) fill.style.width = '0%';
    if (results) results.style.display = 'none';


    // Heuristic fallback
    let w2 = 0;
    const iv = setInterval(() => {
        w2 += 10;
        if (fill) fill.style.width = w2 + '%';
        if (w2 >= 100) { clearInterval(iv); _runEGHeuristics(input); }
    }, 90);
};

function _runEGHeuristics(text) {
    const results = document.getElementById('sim-results');
    if (!results) return;
    const lower = text.toLowerCase();
    const phishWords = ['urgent','verify your account','click here','suspended','compromised','confirm your','update your','unusual sign','your password has','won','selected','prize','wire transfer','crypto','bitcoin'];
    const urlRed = /http[s]?:\/\/(bit\.ly|tinyurl|goo\.gl|t\.co|[0-9]{1,3}\.[0-9]{1,3})/i;
    const domainSpoof = /paypal-|amazon-|apple-|microsoft-|bank.*secure|secure.*bank/i;

    let flags = [];
    let score = 0;
    phishWords.forEach(w => { if (lower.includes(w)) { flags.push(w); score += 1; } });
    if (urlRed.test(text)) { flags.push('Shortened/suspicious URL'); score += 3; }
    if (domainSpoof.test(text)) { flags.push('Spoofed domain pattern'); score += 3; }

    const riskLevel = score >= 4 ? 'critical' : score >= 2 ? 'suspicious' : 'safe';
    const bc = riskLevel === 'safe' ? 'badge-safe' : riskLevel === 'suspicious' ? 'badge-warning' : 'badge-danger';
    const bl = riskLevel === 'safe' ? '✅ Safe — No major threats' : riskLevel === 'suspicious' ? `⚠️ Suspicious — ${score} flags` : `🚨 Phishing Detected — ${score} flags`;

    results.style.display = 'block';
    results.innerHTML = `
        <div class="${bc} sim-badge">${bl}</div>
        ${flags.length ? `<p style="margin-top:0.75rem;"><strong>Red flags found:</strong> ${flags.map(f => `<span style="background:rgba(239,68,68,0.1);color:#f87171;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.82rem;margin:0.1rem;display:inline-block;">${f}</span>`).join(' ')}</p>` : '<p style="margin-top:0.75rem;">No obvious phishing indicators detected.</p>'}
    `;
}
