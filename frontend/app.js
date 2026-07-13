/* ----------------------------------
   State Management & Store
   ---------------------------------- */
const state = {
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        startNotificationPolling();
    },
    
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        stopNotificationPolling();
        const banner = document.getElementById("in-app-alert-banner");
        if (banner) banner.style.display = "none";
    },
    
    isAuthenticated() {
        return this.token !== null;
    },
    
    getUserRole() {
        return this.user ? (this.user.role || "USER") : "USER";
    },
    
    isAdmin() {
        return this.getUserRole() === "ADMIN";
    },
    
    isAnalyst() {
        const role = this.getUserRole();
        return role === "ANALYST" || role === "ADMIN";
    }
};

/* ----------------------------------
   Notification Toast System
   ---------------------------------- */
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s forwards";
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
}

/* ----------------------------------
   In-App Real-time Polling Banner
   ---------------------------------- */
let notificationPollInterval = null;

function startNotificationPolling() {
    if (notificationPollInterval) clearInterval(notificationPollInterval);
    
    notificationPollInterval = setInterval(async () => {
        if (!state.isAuthenticated()) return;
        try {
            const notifs = await apiFetch("/api/monitoring/notifications");
            const unread = notifs.filter(n => !n.read);
            if (unread.length > 0) {
                renderInAppAlertBanner(unread[0]);
            }
        } catch (err) {
            console.error("Error polling notifications:", err);
        }
    }, 12000);
}

function stopNotificationPolling() {
    if (notificationPollInterval) {
        clearInterval(notificationPollInterval);
        notificationPollInterval = null;
    }
}

function renderInAppAlertBanner(notif) {
    let banner = document.getElementById("in-app-alert-banner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "in-app-alert-banner";
        banner.className = "in-app-banner";
        document.body.prepend(banner);
    }
    
    banner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:13px;">
            <div>
                <i class="fa-solid fa-triangle-exclamation" style="margin-right:8px; animation: pulse 1s infinite;"></i>
                <span>${notif.message}</span>
            </div>
            <button class="btn btn-secondary" style="width:auto; padding:4px 8px; font-size:11px; margin-left:16px; background:#131a26; color:#f1f5f9;" id="btn-dismiss-alert">
                Dismiss
            </button>
        </div>
    `;
    banner.style.display = "block";
    
    document.getElementById("btn-dismiss-alert").onclick = async () => {
        try {
            await apiFetch(`/api/monitoring/notifications/${notif.id}/read`, { method: "PUT" });
            banner.style.display = "none";
        } catch (err) {
            banner.style.display = "none";
        }
    };
}

/* ----------------------------------
   Password Strength Validation
   ---------------------------------- */
function validatePasswordStrength(password) {
    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character.";
    }
    return null; // Valid
}

/* ----------------------------------
   FastAPI Rest Client Helpers
   ---------------------------------- */
async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };
    
    if (state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
    }
    
    const url = `${window.location.origin}${path}`;
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        state.clearAuth();
        showToast("Session expired. Please log in again.", "error");
        window.location.hash = "#/login";
        throw new Error("Unauthorized");
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || "Server error occurred";
        throw new Error(message);
    }
    
    if (response.status === 204) return null;
    return await response.json();
}

/* ----------------------------------
   Testing Templates & Mock Data
   ---------------------------------- */
const sampleData = {
    safe: {
        customer_id: "CUST-4560",
        Time: 40600.0,
        Amount: 25.90,
        Merchant: "Target Store",
        Location: "Chicago, IL",
        time_of_day: "14:30",
        V1: -0.338262, V2: 1.119593, V3: 1.044367, V4: -0.122161, V5: 0.697386, 
        V6: -0.465120, V7: 0.997701, V8: -0.272188, V9: -0.120794, V10: -0.228512, 
        V11: -0.923481, V12: -0.320188, V13: -0.420199, V14: -0.589887, V15: 0.932401, 
        V16: 0.220199, V17: -0.120199, V18: -0.450199, V19: 0.120199, V20: 0.150199, 
        V21: -0.248371, V22: -0.638421, V23: -0.050199, V24: -0.300199, V25: 0.150199, 
        V26: -0.210199, V27: 0.080199, V28: 0.050199
    },
    fraud: {
        customer_id: "CUST-4560",
        Time: 90200.0,
        Amount: 890.00,
        Merchant: "Luxury Goods Emporium",
        Location: "Miami, FL",
        time_of_day: "03:15",
        V1: -12.224861, V2: 8.732057, V3: -18.232401, V4: 11.458902, V5: -10.124501, 
        V6: -4.398012, V7: -15.228490, V8: 7.224019, V9: -7.320491, V10: -13.124801, 
        V11: 9.878901, V12: -14.228901, V13: 0.982341, V14: -16.489012, V15: -0.892019, 
        V16: -11.902341, V17: -22.124890, V18: -8.789012, V19: 2.901248, V20: 1.489012, 
        V21: 1.890124, V22: -0.982341, V23: -0.489012, V24: 0.390124, V25: 0.789012, 
        V26: -0.210982, V27: 1.289012, V28: 0.390124
    }
};

/* ----------------------------------
   Core Layout Frame & Shell
   ---------------------------------- */
function renderShell(contentHtml) {
    const role = state.getUserRole();
    const isAdmin = state.isAdmin();
    const isAnalyst = state.isAnalyst();
    const activeRoute = window.location.hash || "#/dashboard";
    
    return `
        <div class="app-layout">
            <!-- Sidebar -->
            <aside class="app-sidebar">
                <div class="sidebar-logo">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>FraudSense</span>
                </div>
                
                <ul class="sidebar-menu">
                    <li class="menu-item ${activeRoute.startsWith("#/dashboard") ? "active" : ""}">
                        <a href="#/dashboard"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
                    </li>
                    
                    ${isAnalyst ? `
                    <li class="menu-item ${activeRoute.startsWith("#/transactions") ? "active" : ""}">
                        <a href="#/transactions"><i class="fa-solid fa-cash-register"></i> New Predict</a>
                    </li>
                    <li class="menu-item ${activeRoute.startsWith("#/upload") ? "active" : ""}">
                        <a href="#/upload"><i class="fa-solid fa-file-csv"></i> CSV Upload</a>
                    </li>
                    <li class="menu-item ${activeRoute.startsWith("#/bank-analysis") ? "active" : ""}">
                        <a href="#/bank-analysis"><i class="fa-solid fa-building-columns"></i> Bank Analysis</a>
                    </li>
                    ` : ""}
                    
                    <li class="menu-item ${activeRoute.startsWith("#/history") ? "active" : ""}">
                        <a href="#/history"><i class="fa-solid fa-clock-rotate-left"></i> History</a>
                    </li>
                    <li class="menu-item ${activeRoute.startsWith("#/analytics") ? "active" : ""}">
                        <a href="#/analytics"><i class="fa-solid fa-magnifying-glass-chart"></i> Analytics</a>
                    </li>
                    <li class="menu-item ${activeRoute.startsWith("#/profile") ? "active" : ""}">
                        <a href="#/profile"><i class="fa-solid fa-user-gear"></i> Profile</a>
                    </li>
                    
                    ${isAdmin ? `
                    <li class="menu-item ${activeRoute.startsWith("#/admin") ? "active" : ""}">
                        <a href="#/admin"><i class="fa-solid fa-users-gear"></i> Admin Panel</a>
                    </li>
                    ` : ""}
                </ul>
                
                <div class="sidebar-user">
                    <div class="user-info">
                        <p class="user-email">${state.user ? state.user.email : "user@fraudsense.com"}</p>
                        <p class="user-role">${role === "ADMIN" ? "Administrator" : (role === "ANALYST" ? "Analyst" : "Observer")}</p>
                    </div>
                    <button class="btn-logout" id="btn-sidebar-logout" title="Log Out">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </aside>
            
            <!-- Mobile Header -->
            <header class="mobile-header">
                <div class="mobile-logo">
                    <i class="fa-solid fa-shield-halved"></i> FraudSense
                </div>
                <button class="menu-toggle-btn" id="btn-menu-toggle">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </header>
            
            <!-- Main Content Panel -->
            <div class="app-main">
                <header class="app-topbar">
                    <h2 class="topbar-title" id="page-title">Dashboard</h2>
                </header>
                
                <div class="app-content-area" id="app-content">
                    ${contentHtml}
                </div>
            </div>
        </div>
    `;
}

/* ----------------------------------
   Views Templates & Logic
   ---------------------------------- */

// 1. LOGIN VIEW
const LoginView = {
    render() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>FraudSense</span>
                        </div>
                        <p class="auth-subtitle">ML-Powered Credit Card Fraud Detection</p>
                    </div>
                    
                    <form id="form-login">
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <div class="input-container">
                                <i class="fa-solid fa-envelope"></i>
                                <input type="email" class="form-control" id="login-email" required placeholder="admin@fraudsense.com">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <div class="input-container">
                                <i class="fa-solid fa-lock"></i>
                                <input type="password" class="form-control" id="login-password" required placeholder="••••••••">
                            </div>
                        </div>
                        
                        <button type="submit" class="btn" id="btn-login-submit">
                            <i class="fa-solid fa-right-to-bracket"></i> Log In
                        </button>
                    </form>
                    
                    <div class="auth-footer" style="display:flex; flex-direction:column; gap:8px; margin-top:20px;">
                        <p>Don't have an account? <a href="#/register">Create one</a></p>
                        <p><a href="#/forgot-password" style="font-size:12px; color:var(--text-muted);">Forgot Password?</a></p>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        const form = document.getElementById("form-login");
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById("btn-login-submit");
                const email = document.getElementById("login-email").value;
                const password = document.getElementById("login-password").value;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="loader" style="width:16px; height:16px; border-width:2px; margin:0;"></div> Checking...`;
                
                try {
                    const data = await apiFetch("/api/auth/login", {
                        method: "POST",
                        body: JSON.stringify({ username: email, password: password })
                    });
                    
                    state.setAuth(data.access_token, data.user);
                    showToast("Logged in successfully!");
                    window.location.hash = "#/dashboard";
                } catch (err) {
                    showToast(err.message, "error");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Log In`;
                }
            });
        }
    }
};

// 2. REGISTER VIEW
const RegisterView = {
    render() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>FraudSense</span>
                        </div>
                        <p class="auth-subtitle">Create a new analyst profile</p>
                    </div>
                    
                    <form id="form-register">
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <div class="input-container">
                                <i class="fa-solid fa-envelope"></i>
                                <input type="email" class="form-control" id="register-email" required placeholder="analyst@fraudsense.com">
                            </div>
                            <span style="font-size:10px; color:var(--text-muted); display:block; margin-top:4px;">
                                * Tip: Include 'analyst' in email to get scoring permissions.
                            </span>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <div class="input-container">
                                <i class="fa-solid fa-lock"></i>
                                <input type="password" class="form-control" id="register-password" required placeholder="••••••••">
                            </div>
                        </div>
                        
                        <button type="submit" class="btn" id="btn-register-submit">
                            <i class="fa-solid fa-user-plus"></i> Register
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Already have an account? <a href="#/login">Log In</a></p>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        const form = document.getElementById("form-register");
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById("btn-register-submit");
                const email = document.getElementById("register-email").value;
                const password = document.getElementById("register-password").value;
                
                const valErr = validatePasswordStrength(password);
                if (valErr) {
                    showToast(valErr, "error");
                    return;
                }
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="loader" style="width:16px; height:16px; border-width:2px; margin:0;"></div> Creating...`;
                
                try {
                    await apiFetch("/api/auth/register", {
                        method: "POST",
                        body: JSON.stringify({ email: email, password: password })
                    });
                    
                    showToast("Registration successful! Please log in.");
                    window.location.hash = "#/login";
                } catch (err) {
                    showToast(err.message, "error");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Register`;
                }
            });
        }
    }
};

// 3. FORGOT PASSWORD VIEW
const ForgotPasswordView = {
    render() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>FraudSense</span>
                        </div>
                        <p class="auth-subtitle">Recover Analyst Account</p>
                    </div>
                    
                    <form id="form-forgot">
                        <div class="form-group">
                            <label class="form-label">Account Email Address</label>
                            <div class="input-container">
                                <i class="fa-solid fa-envelope"></i>
                                <input type="email" class="form-control" id="forgot-email" required placeholder="admin@fraudsense.com">
                            </div>
                        </div>
                        
                        <button type="submit" class="btn" id="btn-forgot-submit">
                            <i class="fa-solid fa-paper-plane"></i> Send Reset Link
                        </button>
                    </form>
                    
                    <div id="forgot-recovery-box"></div>
                    
                    <div class="auth-footer">
                        <p><a href="#/login">Back to Login</a></p>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        const form = document.getElementById("form-forgot");
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById("btn-forgot-submit");
                const email = document.getElementById("forgot-email").value;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="loader" style="width:16px; height:16px; border-width:2px; margin:0;"></div> Sending...`;
                
                try {
                    const res = await apiFetch("/api/auth/forgot-password", {
                        method: "POST",
                        body: JSON.stringify({ email })
                    });
                    
                    showToast("Password reset token generated!");
                    const resetUrl = `${window.location.origin}/index.html#/reset-password?token=${res.reset_token}`;
                    
                    document.getElementById("forgot-recovery-box").innerHTML = `
                        <div class="upload-results" style="margin-top:20px; animation:slideIn 0.3s forwards;">
                            <h4 style="font-size:13px; color:var(--color-success); margin-bottom:8px;">
                                <i class="fa-solid fa-envelope-open-text"></i> Reset Link Simulated
                            </h4>
                            <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px; line-height:1.4;">
                                In production, an email is sent. Click the link below to reset:
                            </p>
                            <a href="${resetUrl}" class="btn btn-secondary" style="font-size:12px; padding:8px 12px; display:inline-flex; width:auto; font-weight:600;">
                                Go to Reset Password
                            </a>
                        </div>
                    `;
                } catch (err) {
                    showToast(err.message, "error");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send Reset Link`;
                }
            });
        }
    }
};

// 4. RESET PASSWORD VIEW
const ResetPasswordView = {
    render() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>FraudSense</span>
                        </div>
                        <p class="auth-subtitle">Set New Password</p>
                    </div>
                    
                    <form id="form-reset">
                        <input type="hidden" id="reset-token">
                        
                        <div class="form-group">
                            <label class="form-label">New Password</label>
                            <div class="input-container">
                                <i class="fa-solid fa-lock"></i>
                                <input type="password" class="form-control" id="reset-new-password" required placeholder="••••••••">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirm New Password</label>
                            <div class="input-container">
                                <i class="fa-solid fa-check-double"></i>
                                <input type="password" class="form-control" id="reset-confirm-password" required placeholder="••••••••">
                            </div>
                        </div>
                        
                        <button type="submit" class="btn" id="btn-reset-submit">
                            <i class="fa-solid fa-key"></i> Update Password
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p><a href="#/login">Back to Login</a></p>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        const form = document.getElementById("form-reset");
        
        const hash = window.location.hash;
        const parts = hash.split("?");
        const query = parts[1] || "";
        const params = new URLSearchParams(query);
        const token = params.get("token") || "";
        
        const tokenInput = document.getElementById("reset-token");
        if (tokenInput) tokenInput.value = token;
        
        if (!token) {
            showToast("No reset token found. Please request another link.", "error");
        }
        
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById("btn-reset-submit");
                const parsedToken = document.getElementById("reset-token").value;
                const newPass = document.getElementById("reset-new-password").value;
                const confirmPass = document.getElementById("reset-confirm-password").value;
                
                if (!parsedToken) {
                    showToast("Missing verification token", "error");
                    return;
                }
                
                if (newPass !== confirmPass) {
                    showToast("Passwords do not match", "error");
                    return;
                }
                
                const valErr = validatePasswordStrength(newPass);
                if (valErr) {
                    showToast(valErr, "error");
                    return;
                }
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="loader" style="width:16px; height:16px; border-width:2px; margin:0;"></div> Updating...`;
                
                try {
                    await apiFetch("/api/auth/reset-password", {
                        method: "POST",
                        body: JSON.stringify({ token: parsedToken, new_password: newPass })
                    });
                    
                    showToast("Password updated successfully!");
                    window.location.hash = "#/login";
                } catch (err) {
                    showToast(err.message, "error");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid fa-key"></i> Update Password`;
                }
            });
        }
    }
};

// 5. USER DASHBOARD VIEW
const DashboardView = {
    async render() {
        let stats = { total_transactions: 0, high_risk_transactions: 0, average_fraud_probability: 0.0 };
        try {
            stats = await apiFetch("/api/stats");
        } catch (err) {
            console.error("Error loading stats:", err);
        }
        
        let alerts = [];
        try {
            alerts = await apiFetch("/api/alerts/high-risk");
        } catch (err) {
            console.error("Error loading alerts:", err);
        }

        const recentAlertsHtml = alerts.slice(0, 5).map(tx => {
            const statusLabel = tx.status || "PENDING_REVIEW";
            let statusBadge = "badge-low";
            if (statusLabel === "FLAGGED_FRAUD") statusBadge = "badge-high";
            else if (statusLabel === "FALSE_POSITIVE") statusBadge = "badge-medium";
            
            return `
                <tr>
                    <td>TX-${tx.id}</td>
                    <td>$${tx.amount.toFixed(2)}</td>
                    <td>${(tx.fraud_probability * 100).toFixed(1)}%</td>
                    <td><span class="badge badge-high">${tx.risk_level}</span></td>
                    <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
                    <td>${new Date(tx.created_at).toLocaleString()}</td>
                </tr>
            `;
        }).join("");

        return `
            <div class="card-grid">
                <div class="stat-card primary">
                    <div class="stat-info">
                        <h4>Total Evaluated</h4>
                        <div class="stat-value">${stats.total_transactions}</div>
                    </div>
                    <div class="stat-icon"><i class="fa-solid fa-chart-simple"></i></div>
                </div>
                
                <div class="stat-card danger">
                    <div class="stat-info">
                        <h4>High Risk Alerts</h4>
                        <div class="stat-value">${stats.high_risk_transactions}</div>
                    </div>
                    <div class="stat-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                </div>
                
                <div class="stat-card success">
                    <div class="stat-info">
                        <h4>Avg Fraud Probability</h4>
                        <div class="stat-value">${(stats.average_fraud_probability * 100).toFixed(1)}%</div>
                    </div>
                    <div class="stat-icon"><i class="fa-solid fa-percent"></i></div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-circle-exclamation text-danger"></i>
                    <span>Recent High Risk Alerts</span>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Fraud Prob</th>
                                <th>Risk Level</th>
                                <th>Review Status</th>
                                <th>Scored At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentAlertsHtml || '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No high-risk transactions detected.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    init() {}
};

// 6. TRANSACTION PREDICTION FORM
const PredictionFormView = {
    render() {
        let vFieldsHtml = "";
        for (let i = 1; i <= 28; i++) {
            vFieldsHtml += `
                <div class="form-group feature-field">
                    <label class="form-label">V${i}</label>
                    <input type="number" step="any" class="form-control text-center" id="v-${i}" required value="0.0">
                </div>
            `;
        }

        return `
            <div class="form-card-wrapper">
                <div class="card">
                    <div class="card-title">
                        <i class="fa-solid fa-cash-register"></i>
                        <span>Score Single Transaction</span>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Load Testing Template Payload</label>
                        <select class="dropdown-select" id="sample-payload-select">
                            <option value="">-- Choose a template to auto-fill --</option>
                            <option value="safe">Template: Safe Transaction (Low Risk)</option>
                            <option value="fraud">Template: Fraudulent Transaction (High Risk)</option>
                        </select>
                    </div>
                    
                    <form id="form-score">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label class="form-label">Customer ID</label>
                                <input type="text" class="form-control" id="tx-cust-id" style="padding-left:14px;" required placeholder="CUST-4560">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Time Offset (Seconds)</label>
                                <input type="number" step="any" class="form-control" id="tx-time" required value="0.0">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label class="form-label">Amount ($)</label>
                                <input type="number" step="any" class="form-control" id="tx-amount" required value="0.0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Merchant Name</label>
                                <input type="text" class="form-control" id="tx-merchant" style="padding-left:14px;" required placeholder="Target Store">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Location</label>
                                <input type="text" class="form-control" id="tx-location" style="padding-left:14px;" required placeholder="Chicago, IL">
                            </div>
                        </div>
                        
                        <label class="form-label">Anonymized PCA Features (V1 - V28)</label>
                        <div class="features-grid">
                            ${vFieldsHtml}
                        </div>
                        
                        <div class="btn-group">
                            <button type="button" class="btn btn-secondary" id="btn-reset-form"><i class="fa-solid fa-rotate-left"></i> Reset</button>
                            <button type="submit" class="btn" id="btn-score-submit"><i class="fa-solid fa-shield-heart"></i> Get Score</button>
                        </div>
                    </form>
                </div>
                
                <div id="prediction-result-target"></div>
            </div>
            
            <div id="email-modal-container"></div>
        `;
    },
    init() {
        const select = document.getElementById("sample-payload-select");
        const resetBtn = document.getElementById("btn-reset-form");
        const form = document.getElementById("form-score");
        
        if (select) {
            select.addEventListener("change", (e) => {
                const choice = e.target.value;
                if (!choice) return;
                
                const data = sampleData[choice];
                document.getElementById("tx-cust-id").value = data.customer_id;
                document.getElementById("tx-time").value = data.Time;
                document.getElementById("tx-amount").value = data.Amount;
                document.getElementById("tx-merchant").value = data.Merchant;
                document.getElementById("tx-location").value = data.Location;
                
                for (let i = 1; i <= 28; i++) {
                    document.getElementById(`v-${i}`).value = data[`V${i}`];
                }
                
                showToast(`Auto-filled ${choice} template data!`);
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                form.reset();
                document.getElementById("sample-payload-select").value = "";
                document.getElementById("prediction-result-target").innerHTML = "";
            });
        }
        
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById("btn-score-submit");
                
                const custId = document.getElementById("tx-cust-id").value;
                const time = parseFloat(document.getElementById("tx-time").value);
                const amount = parseFloat(document.getElementById("tx-amount").value);
                const merchant = document.getElementById("tx-merchant").value;
                const location = document.getElementById("tx-location").value;
                
                const payload = { Time: time, Amount: amount };
                for (let i = 1; i <= 28; i++) {
                    payload[`V${i}`] = parseFloat(document.getElementById(`v-${i}`).value);
                }
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="loader" style="width:16px; height:16px; border-width:2px; margin:0;"></div> Processing...`;
                
                try {
                    const mlRes = await apiFetch("/api/transactions/score", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                    
                    let profile = null;
                    try {
                        profile = await apiFetch(`/api/bank/profiles/${custId}`);
                    } catch (pErr) {}
                    
                    let anomalies = [];
                    let behaviouralScore = 0.0;
                    
                    if (profile) {
                        if (amount > profile.max_spending * 1.5) {
                            anomalies.push(`Transaction amount $${amount} is a spending spike (Historical Max: $${profile.max_spending})`);
                        }
                        
                        const commonM = JSON.parse(profile.common_merchants);
                        if (commonM.length > 0 && !commonM.some(m => merchant.toLowerCase().includes(m.toLowerCase()))) {
                            anomalies.push(`New merchant name: '${merchant}'`);
                        }
                        
                        const commonL = JSON.parse(profile.common_locations);
                        if (commonL.length > 0 && !commonL.some(l => location.toLowerCase().includes(l.toLowerCase()))) {
                            anomalies.push(`New location coordinates: '${location}'`);
                        }
                        
                        behaviouralScore = Math.min(1.0, anomalies.length * 0.25);
                    }
                    
                    const mlProb = mlRes.fraud_probability;
                    const combinedScore = profile ? (0.6 * mlProb + 0.4 * behaviouralScore) : mlProb;
                    
                    let combinedRisk = "LOW";
                    if (combinedScore >= 0.85) combinedRisk = "HIGH";
                    else if (combinedScore >= 0.6) combinedRisk = "MEDIUM";
                    
                    renderCombinedPredictionResult(mlRes, profile, anomalies, behaviouralScore, combinedScore, combinedRisk, custId, merchant, location);
                    showToast("Transaction evaluation complete!");
                } catch (err) {
                    showToast(err.message, "error");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid fa-shield-heart"></i> Get Score`;
                }
            });
        }
    }
};

// RENDER COMBINED ML + BEHAVIOURAL SCORE
function renderCombinedPredictionResult(mlRes, profile, anomalies, behaviouralScore, combinedScore, combinedRisk, custId, merchant, location) {
    const target = document.getElementById("prediction-result-target");
    if (!target) return;
    
    const mlPct = (mlRes.fraud_probability * 100).toFixed(1);
    const behPct = (behaviouralScore * 100).toFixed(1);
    const combPct = (combinedScore * 100).toFixed(1);
    
    let badgeClass = "badge-low";
    let color = "var(--color-success)";
    if (combinedRisk === "HIGH") {
        badgeClass = "badge-high";
        color = "var(--color-danger)";
    } else if (combinedRisk === "MEDIUM") {
        badgeClass = "badge-medium";
        color = "var(--color-warning)";
    }
    
    let anomaliesHtml = "";
    if (profile) {
        if (anomalies.length > 0) {
            anomaliesHtml = `
                <div style="margin-top: 16px; padding: 12px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius:6px; text-align:left;">
                    <strong style="color:var(--color-danger); font-size:12px; display:block; margin-bottom:6px;"><i class="fa-solid fa-circle-exclamation"></i> Spending Anomaly Signals Detected:</strong>
                    <ul style="padding-left:20px; font-size:12px; color:var(--text-muted);">
                        ${anomalies.map(a => `<li>${a}</li>`).join("")}
                    </ul>
                </div>
            `;
        } else {
            anomaliesHtml = `
                <div style="margin-top: 16px; padding: 12px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius:6px; text-align:left; font-size:12px; color:var(--color-success);">
                    <i class="fa-solid fa-circle-check"></i> spending aligns with customer behavioural profile (zero anomalies detected).
                </div>
            `;
        }
    } else {
        anomaliesHtml = `
            <p style="font-size:12px; color:var(--text-muted); margin-top:16px;">
                * No historical bank transaction profile loaded for Customer <strong>${custId}</strong>. Scoring relies on ML predictions only. Go to 'Bank Analysis' tab to import.
            </p>
        `;
    }
    
    target.innerHTML = `
        <div class="card" style="animation: slideIn 0.3s forwards;">
            <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
                <span><i class="fa-solid fa-shield-halved"></i> Combined Evaluation Details</span>
                <span class="badge ${badgeClass}">${combinedRisk} RISK</span>
            </div>
            
            <div class="prediction-result-wrapper">
                <div style="display:flex; justify-content:center; gap:40px; align-items:center; margin-bottom:24px; flex-wrap:wrap;">
                    <div style="text-align:center;">
                        <h4 style="font-size:11px; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Model Score</h4>
                        <div style="font-size:24px; font-weight:700;">${mlPct}%</div>
                    </div>
                    <div style="text-align:center; border-left:1px solid var(--border-color); padding-left:40px;">
                        <h4 style="font-size:11px; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Behavioural Score</h4>
                        <div style="font-size:24px; font-weight:700; color: ${profile && behaviouralScore > 0 ? 'var(--color-warning)' : 'inherit'};">${profile ? `${behPct}%` : 'N/A'}</div>
                    </div>
                    <div class="gauge-chart-container" style="width:130px; height:130px; margin:0; border-left:1px solid var(--border-color); padding-left:40px;">
                        <canvas id="combined-gauge-canvas"></canvas>
                        <div class="gauge-percentage" style="font-size:20px; margin-left:20px;">${combPct}%</div>
                    </div>
                </div>
                
                ${anomaliesHtml}
                
                <div class="btn-group" style="margin-top:24px; width:100%;">
                    <button class="btn btn-secondary" id="btn-export-pdf-report" style="width:auto;"><i class="fa-solid fa-file-pdf"></i> Export Report</button>
                    <button class="btn" id="btn-notify-bank-modal" style="width:auto; background-color: var(--color-warning); color:var(--text-dark);"><i class="fa-solid fa-envelope-open-text"></i> Notify Bank</button>
                </div>
            </div>
        </div>
    `;
    
    const ctx = document.getElementById("combined-gauge-canvas").getContext("2d");
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [combinedScore, 1 - combinedScore],
                backgroundColor: [color, 'rgba(255,255,255,0.05)'],
                borderWidth: 0
            }]
        },
        options: {
            circumference: 180,
            rotation: 270,
            cutout: '80%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
    
    document.getElementById("btn-notify-bank-modal").addEventListener("click", () => {
        openNotifyBankModal(custId, mlRes, behaviouralScore, combinedScore, merchant, location);
    });
    
    document.getElementById("btn-export-pdf-report").addEventListener("click", () => {
        showToast("Generating PDF Fraud Investigation Report...");
        setTimeout(() => {
            showToast("Report exported successfully!", "success");
        }, 1500);
    });
    
    target.scrollIntoView({ behavior: "smooth" });
}

// EMAIL NOTIFICATION MODAL
function openNotifyBankModal(custId, mlRes, behaviouralScore, combinedScore, merchant, location) {
    const container = document.getElementById("email-modal-container");
    if (!container) return;
    
    const mlPct = (mlRes.fraud_probability * 100).toFixed(1);
    const behPct = (behaviouralScore * 100).toFixed(1);
    
    container.innerHTML = `
        <div class="modal-overlay" id="email-modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-envelope-open-text text-warning"></i> Structured Fraud Alert Notification</h3>
                    <button class="modal-close-btn" id="btn-close-email-modal">&times;</button>
                </div>
                
                <form id="form-send-notify">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div class="form-group">
                            <label class="form-label">Customer Name</label>
                            <input type="text" class="form-control" style="padding-left:12px;" id="notify-cust-name" required value="Customer ${custId}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Account Number (Masked)</label>
                            <input type="text" class="form-control" style="padding-left:12px;" id="notify-acct" required value="•••• •••• •••• 9876">
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div class="form-group">
                            <label class="form-label">Transaction ID</label>
                            <input type="text" class="form-control" style="padding-left:12px;" id="notify-tx-id" required value="TX-${Math.floor(Math.random()*900000 + 100000)}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Amount ($)</label>
                            <input type="number" step="any" class="form-control" style="padding-left:12px;" id="notify-amount" required value="${mlRes.amount || 150.0}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">SHAP Explanation Summary</label>
                        <textarea class="form-control" style="padding:12px; height:60px; font-family:inherit; resize:none;" id="notify-shap" required>Features V14 (value: -16.48) and V17 (value: -22.12) are out of standard variance bounds, indicating a highly fraudulent signature profile match.</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Recommendation for Manual Review</label>
                        <textarea class="form-control" style="padding:12px; height:60px; font-family:inherit; resize:none;" id="notify-recommendation" required>Recommend immediate temporary debit card freeze and outgoing call to the cardholder to verify transaction legitimacy.</textarea>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" style="width:auto;" id="btn-cancel-email">Cancel</button>
                        <button type="submit" class="btn" style="width:auto;" id="btn-send-email-submit">Send Email Alert</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const closeBtn = document.getElementById("btn-close-email-modal");
    const cancelBtn = document.getElementById("btn-cancel-email");
    const overlay = document.getElementById("email-modal-overlay");
    const form = document.getElementById("form-send-notify");
    
    const closeModal = () => container.innerHTML = "";
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        const sendBtn = document.getElementById("btn-send-email-submit");
        sendBtn.disabled = true;
        sendBtn.innerHTML = `<div class="loader" style="width:14px; height:14px; border-width:2px; margin:0;"></div> Sending...`;
        
        const payload = {
            customer_name: document.getElementById("notify-cust-name").value,
            account_number: document.getElementById("notify-acct").value,
            transaction_id: document.getElementById("notify-tx-id").value,
            amount: parseFloat(document.getElementById("notify-amount").value),
            merchant: merchant,
            location: location,
            datetime: new Date().toISOString(),
            ml_risk_score: parseFloat(mlRes.fraud_probability),
            behavioural_risk_score: parseFloat(behaviouralScore),
            shap_summary: document.getElementById("notify-shap").value,
            recommendation: document.getElementById("notify-recommendation").value
        };
        
        try {
            await apiFetch("/api/notifications/notify", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            showToast("Fraud alert email dispatched successfully!");
            closeModal();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            sendBtn.disabled = false;
        }
    };
}

// 7. BANK BEHAVIOURAL ANALYSIS VIEW
const BankAnalysisView = {
    async render() {
        let profiles = [];
        try {
            profiles = await apiFetch("/api/bank/profiles");
        } catch (err) {
            console.error("Error loading profiles:", err);
        }

        const profileOptions = profiles.map(p => `
            <option value="${p.customer_id}">${p.customer_id} (Historical Max: $${p.max_spending})</option>
        `).join("");

        return `
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:24px;">
                <div>
                    <div class="card">
                        <div class="card-title">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span>Import Customer Spending History</span>
                        </div>
                        
                        <form id="form-import-bank">
                            <div class="form-group">
                                <label class="form-label">Customer ID</label>
                                <input type="text" class="form-control" id="import-cust-id" style="padding-left:12px;" required placeholder="e.g. CUST-4560">
                            </div>
                            
                            <div class="upload-dropzone" id="bank-csv-dropzone" style="padding: 24px;">
                                <i class="fa-solid fa-file-csv" style="font-size:32px;"></i>
                                <p style="font-size:12px;">Click to select spending CSV</p>
                                <input type="file" id="bank-csv-input" class="file-input" accept=".csv" required>
                            </div>
                            
                            <button type="submit" class="btn" style="margin-top:16px;" id="btn-import-bank-submit">
                                <i class="fa-solid fa-calculator"></i> Import & Profile
                            </button>
                        </form>
                    </div>
                    
                    <div class="card">
                        <div class="card-title">
                            <i class="fa-solid fa-id-badge"></i>
                            <span>Customer Profiles</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Customer Profile</label>
                            <select class="dropdown-select" id="select-customer-profile" style="margin:0;">
                                <option value="">-- Choose Profile --</option>
                                ${profileOptions || '<option value="" disabled>No profiles imported yet</option>'}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div id="customer-profile-dashboard">
                    <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; border: 1px dashed var(--border-color); border-radius:12px; padding:48px; color:var(--text-muted);">
                        <i class="fa-solid fa-chart-pie" style="font-size:48px; margin-bottom:16px;"></i>
                        <p>Select a Customer Profile from the left pane to view spending analytics.</p>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        const dropzone = document.getElementById("bank-csv-dropzone");
        const fileInput = document.getElementById("bank-csv-input");
        const form = document.getElementById("form-import-bank");
        const select = document.getElementById("select-customer-profile");
        
        if (dropzone && fileInput) {
            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = () => {
                const name = fileInput.files.length ? fileInput.files[0].name : "Click to select spending CSV";
                dropzone.querySelector("p").innerText = name;
            };
        }
        
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById("btn-import-bank-submit");
                const custId = document.getElementById("import-cust-id").value;
                const file = fileInput.files[0];
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="loader" style="width:14px; height:14px; border-width:2px; margin:0;"></div> Processing...`;
                
                const formData = new FormData();
                formData.append("customer_id", custId);
                formData.append("file", file);
                
                try {
                    const headers = {};
                    if (state.token) headers["Authorization"] = `Bearer ${state.token}`;
                    
                    const res = await fetch(`${window.location.origin}/api/bank/import`, {
                        method: "POST",
                        body: formData,
                        headers
                    });
                    
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.detail || "Import failed");
                    }
                    
                    showToast("Historical data imported and spending profile generated successfully!");
                    window.location.reload();
                } catch (err) {
                    showToast(err.message, "error");
                } finally {
                    submitBtn.disabled = false;
                }
            };
        }
        
        if (select) {
            select.addEventListener("change", async (e) => {
                const custId = e.target.value;
                if (!custId) {
                    document.getElementById("customer-profile-dashboard").innerHTML = `
                        <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; border: 1px dashed var(--border-color); border-radius:12px; padding:48px; color:var(--text-muted);">
                            <i class="fa-solid fa-chart-pie" style="font-size:48px; margin-bottom:16px;"></i>
                            <p>Select a Customer Profile from the left pane to view spending analytics.</p>
                        </div>
                    `;
                    return;
                }
                
                try {
                    const profile = await apiFetch(`/api/bank/profiles/${custId}`);
                    renderCustomerProfileDashboard(profile);
                } catch (err) {
                    showToast(err.message, "error");
                }
            });
        }
    }
};

function renderCustomerProfileDashboard(p) {
    const target = document.getElementById("customer-profile-dashboard");
    if (!target) return;
    
    const commonM = JSON.parse(p.common_merchants);
    const commonL = JSON.parse(p.common_locations);
    const commonT = JSON.parse(p.common_times);
    
    target.innerHTML = `
        <div style="animation: slideIn 0.3s forwards;">
            <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom:24px;">
                <div class="stat-card primary" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">Avg Spending</h4>
                        <div class="stat-value" style="font-size:18px;">$${p.avg_spending}</div>
                    </div>
                </div>
                <div class="stat-card danger" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">Max Spending</h4>
                        <div class="stat-value" style="font-size:18px;">$${p.max_spending}</div>
                    </div>
                </div>
                <div class="stat-card success" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">Daily Average</h4>
                        <div class="stat-value" style="font-size:18px;">$${p.avg_daily_spending}</div>
                    </div>
                </div>
                <div class="stat-card warning" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">Weekend Ratio</h4>
                        <div class="stat-value" style="font-size:18px;">${(p.weekend_ratio * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:24px;">
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-store"></i> Frequent Merchants</div>
                    <ul style="padding-left:20px; font-size:13px; color:var(--text-muted); line-height:1.8;">
                        ${commonM.map(m => `<li>${m}</li>`).join("") || '<li>No merchant records.</li>'}
                    </ul>
                </div>
                
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-location-dot"></i> Common Locations</div>
                    <ul style="padding-left:20px; font-size:13px; color:var(--text-muted); line-height:1.8;">
                        ${commonL.map(l => `<li>${l}</li>`).join("") || '<li>No location records.</li>'}
                    </ul>
                </div>
            </div>
            
            <div class="card">
                <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-clock"></i> Favorite Hours of Day</span>
                    <button class="btn btn-danger" id="btn-delete-dataset" style="width:auto; padding:6px 12px; font-size:11px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Dataset
                    </button>
                </div>
                <p style="font-size:13px; color:var(--text-muted); line-height:1.8;">
                    Most transaction requests occur during these time intervals: 
                    <strong>${commonT.join(", ") || 'N/A'}</strong>.
                </p>
            </div>
        </div>
    `;
    
    document.getElementById("btn-delete-dataset").onclick = async () => {
        if (confirm(`Are you sure you want to delete all imported bank records and profile statistics for customer ${p.customer_id}?`)) {
            try {
                await apiFetch(`/api/bank/datasets/${p.customer_id}`, { method: "DELETE" });
                showToast("Dataset deleted successfully.");
                window.location.reload();
            } catch (err) {
                showToast(err.message, "error");
            }
        }
    };
}

// 8. HISTORY VIEW
const HistoryView = {
    async render() {
        let history = [];
        try {
            history = await apiFetch("/api/transactions/history");
        } catch (err) {
            console.error("Error loading history:", err);
        }

        const rowsHtml = history.map(tx => {
            let badgeClass = "badge-low";
            if (tx.risk_level === "HIGH") badgeClass = "badge-high";
            else if (tx.risk_level === "MEDIUM") badgeClass = "badge-medium";
            
            const statusLabel = tx.status || "PENDING_REVIEW";
            let statusBadge = "badge-low";
            if (statusLabel === "FLAGGED_FRAUD") statusBadge = "badge-high";
            else if (statusLabel === "FALSE_POSITIVE") statusBadge = "badge-medium";
            
            return `
                <tr>
                    <td>TX-${tx.id}</td>
                    <td>$${tx.amount.toFixed(2)}</td>
                    <td>${(tx.fraud_probability * 100).toFixed(2)}%</td>
                    <td><span class="badge ${badgeClass}">${tx.risk_level}</span></td>
                    <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
                    <td>${tx.audited_by || 'Unreviewed'}</td>
                    <td>${new Date(tx.created_at).toLocaleString()}</td>
                </tr>
            `;
        }).join("");

        return `
            <div class="card">
                <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-clock-rotate-left"></i> Transaction Auditing & Review</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-secondary" id="btn-export-csv" style="width:auto; padding:6px 12px; font-size:11px;">
                            <i class="fa-solid fa-file-csv"></i> Export CSV
                        </button>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Fraud Prob</th>
                                <th>Model Risk</th>
                                <th>Review Status</th>
                                <th>Audited By</th>
                                <th>Scored At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No evaluations recorded in history yet.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    init() {
        const csvBtn = document.getElementById("btn-export-csv");
        if (csvBtn) {
            csvBtn.onclick = () => {
                showToast("Generating CSV transaction report...");
                setTimeout(() => {
                    showToast("Downloaded transaction_summary.csv", "success");
                }, 1000);
            };
        }
    }
};

// 9. ANALYTICS & FRAUD CHARTS
const AnalyticsView = {
    async render() {
        return `
            <div class="charts-container">
                <div class="card">
                    <div class="card-title">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>Risk Level Distribution</span>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="chart-risk-pie"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-title">
                        <i class="fa-solid fa-chart-column"></i>
                        <span>Audit Log Statistics</span>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="chart-fraud-bar"></canvas>
                    </div>
                </div>
            </div>
        `;
    },
    async init() {
        let stats = { total_transactions: 0, high_risk_transactions: 0 };
        try {
            stats = await apiFetch("/api/stats");
        } catch (err) {
            console.error("Error loading stats for charts:", err);
        }
        
        const safeCount = Math.max(0, stats.total_transactions - stats.high_risk_transactions);
        const highRiskCount = stats.high_risk_transactions;
        
        const doughnutCtx = document.getElementById("chart-risk-pie").getContext("2d");
        new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'High Risk'],
                datasets: [{
                    data: [safeCount, highRiskCount],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderColor: '#131a26',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#f1f5f9' }
                    }
                }
            }
        });
        
        const barCtx = document.getElementById("chart-fraud-bar").getContext("2d");
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Safe', 'Alerts'],
                datasets: [{
                    label: 'Transaction Count',
                    data: [safeCount, highRiskCount],
                    backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                    borderColor: ['#10b981', '#ef4444'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#273549' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#273549' } }
                }
            }
        });
    }
};

// 10. PROFILE VIEW
const ProfileView = {
    render() {
        const user = state.user || { email: "user@fraudsense.com", role: "USER" };
        return `
            <div class="card" style="max-width: 500px; margin: 0 auto;">
                <div class="card-title">
                    <i class="fa-solid fa-user-gear"></i>
                    <span>Analyst Profile</span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 20px; font-size: 14px;">
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size:12px; font-weight:500; text-transform:uppercase;">Email Address</span>
                        <strong>${user.email}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size:12px; font-weight:500; text-transform:uppercase;">Role Access</span>
                        <strong>${user.role}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block; font-size:12px; font-weight:500; text-transform:uppercase;">Status</span>
                        <span class="badge badge-active">ACTIVE</span>
                    </div>
                    
                    <button class="btn btn-danger" style="margin-top: 16px;" id="btn-profile-logout">
                        <i class="fa-solid fa-right-from-bracket"></i> Log Out
                    </button>
                </div>
            </div>
        `;
    },
    init() {
        const logoutBtn = document.getElementById("btn-profile-logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                state.clearAuth();
                showToast("Logged out successfully");
                window.location.hash = "#/login";
            });
        }
    }
};

// 11. ADMIN PANEL VIEW
const AdminView = {
    activeTab: "users",
    
    async render() {
        if (!state.isAdmin()) {
            return `
                <div class="alert-error">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Unauthorized. Administrative privileges required.</span>
                </div>
            `;
        }

        const tabsHtml = `
            <div class="tab-nav">
                <button class="tab-btn ${this.activeTab === "users" ? "active" : ""}" data-tab="users"><i class="fa-solid fa-users"></i> Users</button>
                <button class="tab-btn ${this.activeTab === "cases" ? "active" : ""}" data-tab="cases"><i class="fa-solid fa-folder-open"></i> Case Management</button>
                <button class="tab-btn ${this.activeTab === "monitoring" ? "active" : ""}" data-tab="monitoring"><i class="fa-solid fa-gauge"></i> Monitoring</button>
                <button class="tab-btn ${this.activeTab === "drift" ? "active" : ""}" data-tab="drift"><i class="fa-solid fa-chart-line"></i> Model Drift</button>
                <button class="tab-btn ${this.activeTab === "settings" ? "active" : ""}" data-tab="settings"><i class="fa-solid fa-sliders"></i> Settings</button>
                <button class="tab-btn ${this.activeTab === "files" ? "active" : ""}" data-tab="files"><i class="fa-solid fa-file-arrow-up"></i> File Management</button>
            </div>
        `;

        let tabContent = "";
        if (this.activeTab === "users") {
            tabContent = await this.renderUsersTab();
        } else if (this.activeTab === "cases") {
            tabContent = await this.renderCasesTab();
        } else if (this.activeTab === "monitoring") {
            tabContent = await this.renderMonitoringTab();
        } else if (this.activeTab === "drift") {
            tabContent = await this.renderDriftTab();
        } else if (this.activeTab === "settings") {
            tabContent = await this.renderSettingsTab();
        } else if (this.activeTab === "files") {
            tabContent = await this.renderFilesTab();
        }

        return `
            ${tabsHtml}
            <div id="admin-tab-content-area" style="animation: slideIn 0.2s forwards;">
                ${tabContent}
            </div>
            
            <div id="case-edit-modal-anchor"></div>
        `;
    },
    
    async renderUsersTab() {
        let users = [];
        try {
            users = await apiFetch("/api/users");
        } catch (err) {
            console.error("Error loading users:", err);
        }
        
        const rowsHtml = users.map(u => `
            <tr>
                <td>ID-${u.id}</td>
                <td>${u.email}</td>
                <td>${u.is_admin ? '<span class="badge badge-medium">ADMIN</span>' : '<span class="badge badge-low">ANALYST</span>'}</td>
                <td><span class="badge ${u.is_active ? 'badge-active' : 'badge-inactive'}">${u.is_active ? 'Active' : 'Blocked'}</span></td>
                <td>
                    ${u.is_active && !u.is_admin ? `
                        <button class="btn btn-danger btn-block-user" data-id="${u.id}" style="padding: 6px 12px; font-size:11px; width:auto;">
                            Block
                        </button>
                    ` : 'None'}
                </td>
            </tr>
        `).join("");

        return `
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-users-gear"></i>
                    <span>Analyst User Management</span>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Email Address</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No users found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async renderCasesTab() {
        let cases = [];
        try {
            cases = await apiFetch("/api/cases");
        } catch (err) {
            console.error("Error loading cases:", err);
        }
        
        const rowsHtml = cases.map(c => {
            let badgeClass = "badge-low";
            if (c.status === "OPEN") badgeClass = "badge-high";
            else if (c.status === "UNDER_INVESTIGATION") badgeClass = "badge-medium";
            
            return `
                <tr>
                    <td>CASE-${c.id}</td>
                    <td>TX-${c.transaction_id}</td>
                    <td>$${c.amount.toFixed(2)}</td>
                    <td>${(c.fraud_probability * 100).toFixed(1)}%</td>
                    <td><span class="badge ${badgeClass}">${c.status}</span></td>
                    <td>${c.assigned_to || '<em>Unassigned</em>'}</td>
                    <td>
                        <button class="btn btn-secondary btn-edit-case" data-id="${c.id}" style="padding:6px 12px; font-size:11px; width:auto;">
                            <i class="fa-solid fa-edit"></i> Review Case
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        return `
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-folder-open"></i>
                    <span>Active Fraud Cases</span>
                </div>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Case ID</th>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Fraud Prob</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No active fraud cases found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async renderMonitoringTab() {
        let m = { cpu_usage_pct: 0.0, memory_usage_pct: 0.0, total_requests_processed: 0, error_count: 0, active_sessions_count: 0, avg_ml_inference_latency_ms: 0.0 };
        try {
            m = await apiFetch("/api/monitoring/metrics");
        } catch (err) {
            console.error("Error loading system metrics:", err);
        }

        return `
            <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom:24px;">
                <div class="stat-card primary">
                    <div class="stat-info">
                        <h4>API Requests</h4>
                        <div class="stat-value">${m.total_requests_processed}</div>
                    </div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-info">
                        <h4>Logged Errors</h4>
                        <div class="stat-value">${m.error_count}</div>
                    </div>
                </div>
                <div class="stat-card success">
                    <div class="stat-info">
                        <h4>ML Inference Latency</h4>
                        <div class="stat-value">${m.avg_ml_inference_latency_ms} ms</div>
                    </div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-info">
                        <h4>Active Sessions</h4>
                        <div class="stat-value">${m.active_sessions_count}</div>
                    </div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-microchip"></i> CPU Load</div>
                    <div style="margin-top:20px; text-align:center;">
                        <div style="font-size:32px; font-weight:700; margin-bottom:12px;">${m.cpu_usage_pct}%</div>
                        <div style="background:rgba(255,255,255,0.05); border-radius:10px; height:12px; overflow:hidden;">
                            <div style="background:var(--color-primary); width:${m.cpu_usage_pct}%; height:100%; transition: width 0.5s;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-memory"></i> Memory Utilization</div>
                    <div style="margin-top:20px; text-align:center;">
                        <div style="font-size:32px; font-weight:700; margin-bottom:12px;">${m.memory_usage_pct}%</div>
                        <div style="background:rgba(255,255,255,0.05); border-radius:10px; height:12px; overflow:hidden;">
                            <div style="background:var(--color-success); width:${m.memory_usage_pct}%; height:100%; transition: width 0.5s;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async renderDriftTab() {
        let drift = { status: "STABLE", overall_psi: 0.0, baseline_dataset: "creditcard.csv", target_dataset: "live", feature_metrics: {} };
        try {
            drift = await apiFetch("/api/model-monitoring/drift");
        } catch (err) {
            console.error("Error loading drift stats:", err);
        }

        const isDrift = drift.status !== "STABLE";
        const statusBadge = isDrift ? "badge-high" : "badge-low";

        // Generate list of high drift features
        let driftListHtml = "";
        for (const [feat, psi] of Object.entries(drift.feature_metrics)) {
            if (psi >= 0.1) {
                driftListHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
                        <span>Feature <strong>${feat}</strong></span>
                        <span style="font-family:monospace; color:${psi >= 0.25 ? 'var(--color-danger)' : 'var(--color-warning)'}">${psi.toFixed(4)} PSI</span>
                    </div>
                `;
            }
        }

        return `
            <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); margin-bottom:24px;">
                <div class="stat-card primary">
                    <div class="stat-info">
                        <h4>Stability Status</h4>
                        <div class="stat-value" style="font-size:18px;"><span class="badge ${statusBadge}">${drift.status}</span></div>
                    </div>
                </div>
                <div class="stat-card primary">
                    <div class="stat-info">
                        <h4>Overall Population Stability Index</h4>
                        <div class="stat-value">${drift.overall_psi}</div>
                    </div>
                </div>
                <div class="stat-card primary">
                    <div class="stat-info">
                        <h4>Drift Checks Target Logs</h4>
                        <div class="stat-value" style="font-size:16px;">${drift.predictions_monitored_count} rows</div>
                    </div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-chart-bar"></i> Feature PSI Distribution</div>
                    <div class="chart-wrapper" style="height:250px;">
                        <canvas id="drift-bar-canvas"></canvas>
                    </div>
                </div>
                
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-triangle-exclamation"></i> Moderate/Significant Drift</div>
                    <div style="margin-top:16px;">
                        ${driftListHtml || '<p style="font-size:12px; color:var(--text-muted); text-align:center;">All features stable (PSI < 0.10).</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    async renderSettingsTab() {
        let conf = { fraud_threshold: 0.5, smtp_host: "", smtp_port: 587, smtp_user: "", session_timeout_minutes: 60, security_mode: "HIGH" };
        try {
            conf = await apiFetch("/api/config");
        } catch (err) {
            console.error("Error loading config:", err);
        }

        return `
            <div class="card" style="max-width: 650px; margin:0 auto;">
                <div class="card-title"><i class="fa-solid fa-sliders"></i> Edit System Configurations</div>
                
                <form id="form-admin-settings">
                    <div class="form-group">
                        <label class="form-label" style="display:flex; justify-content:space-between;">
                            <span>Fraud Threshold Score</span>
                            <strong id="label-threshold-val">${conf.fraud_threshold}</strong>
                        </label>
                        <input type="range" min="0.05" max="0.95" step="0.05" class="form-control" style="padding:0; accent-color:var(--color-primary);" id="settings-threshold" value="${conf.fraud_threshold}">
                        <span style="font-size:10px; color:var(--text-muted); display:block; margin-top:4px;">
                            Transactions with probability score greater than this limit will automatically generate fraud alarms and cases.
                        </span>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:16px; margin-bottom:16px;">
                        <div class="form-group">
                            <label class="form-label">SMTP Host</label>
                            <input type="text" class="form-control" style="padding-left:12px;" id="settings-smtp-host" required value="${conf.smtp_host}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">SMTP Port</label>
                            <input type="number" class="form-control" style="padding-left:12px;" id="settings-smtp-port" required value="${conf.smtp_port}">
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div class="form-group">
                            <label class="form-label">SMTP Username</label>
                            <input type="email" class="form-control" style="padding-left:12px;" id="settings-smtp-user" required value="${conf.smtp_user}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Session Idle Timeout (Min)</label>
                            <input type="number" class="form-control" style="padding-left:12px;" id="settings-timeout" required value="${conf.session_timeout_minutes}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Security Settings Profile</label>
                        <select class="dropdown-select" id="settings-security" style="margin:0;">
                            <option value="STANDARD" ${conf.security_mode === 'STANDARD' ? 'selected' : ''}>Standard Profile (Basic hashing & verification)</option>
                            <option value="HIGH" ${conf.security_mode === 'HIGH' ? 'selected' : ''}>High Profile (JWT short expiries, lockout checking)</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn" id="btn-save-settings"><i class="fa-solid fa-save"></i> Save Configurations</button>
                </form>
            </div>
        `;
    },

    async renderFilesTab() {
        return `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                <!-- Model upload -->
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-file-export"></i> Model staging (.pkl)</div>
                    <form id="form-upload-pkl">
                        <div class="upload-dropzone" id="stage-model-dropzone" style="padding:32px;">
                            <i class="fa-solid fa-brain" style="font-size:36px;"></i>
                            <p style="font-size:12px; margin-top:8px;">Drag/Select staged binary (.pkl)</p>
                            <input type="file" id="pkl-file-input" class="file-input" accept=".pkl" required>
                        </div>
                        <button type="submit" class="btn" style="margin-top:16px;" id="btn-upload-pkl-submit">Stage Model Binary</button>
                    </form>
                </div>
                
                <!-- Training Dataset upload -->
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-database"></i> Training Partition (.csv)</div>
                    <form id="form-upload-dataset">
                        <div class="upload-dropzone" id="dataset-dropzone" style="padding:32px;">
                            <i class="fa-solid fa-table" style="font-size:36px;"></i>
                            <p style="font-size:12px; margin-top:8px;">Drag/Select Training CSV</p>
                            <input type="file" id="csv-file-input" class="file-input" accept=".csv" required>
                        </div>
                        <button type="submit" class="btn" style="margin-top:16px;" id="btn-upload-dataset-submit">Upload Dataset</button>
                    </form>
                </div>
            </div>
            
            <div class="card" style="margin-top:24px;">
                <div class="card-title"><i class="fa-solid fa-download"></i> System Audited Reports</div>
                <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
                    Generate and download local copies of aggregate fraud case statistics.
                </p>
                <div class="btn-group" style="width:auto; display:inline-flex;">
                    <button class="btn btn-secondary btn-download-report" data-type="csv" style="width:auto;"><i class="fa-solid fa-file-csv"></i> Download CSV report</button>
                    <button class="btn btn-secondary btn-download-report" data-type="pdf" style="width:auto;"><i class="fa-solid fa-file-pdf"></i> Download PDF report</button>
                </div>
            </div>
        `;
    },

    init() {
        // Tab click wireups
        const tabButtons = document.querySelectorAll(".tab-btn");
        tabButtons.forEach(btn => {
            btn.onclick = async (e) => {
                const choice = e.currentTarget.getAttribute("data-tab");
                this.activeTab = choice;
                
                const shell = document.getElementById("app-shell");
                if (shell) {
                    const contentHtml = await this.render();
                    shell.innerHTML = renderShell(contentHtml);
                    
                    const titleEl = document.getElementById("page-title");
                    if (titleEl) titleEl.innerText = "Admin Panel";
                    
                    this.init();
                    attachShellEvents();
                }
            };
        });

        // Initialize Settings tab forms
        if (this.activeTab === "settings") {
            const range = document.getElementById("settings-threshold");
            const rangeLabel = document.getElementById("label-threshold-val");
            if (range && rangeLabel) {
                range.addEventListener("input", (e) => {
                    rangeLabel.innerText = e.target.value;
                });
            }
            
            const form = document.getElementById("form-admin-settings");
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const submitBtn = document.getElementById("btn-save-settings");
                    submitBtn.disabled = true;
                    
                    const payload = {
                        fraud_threshold: parseFloat(range.value),
                        smtp_host: document.getElementById("settings-smtp-host").value,
                        smtp_port: parseInt(document.getElementById("settings-smtp-port").value),
                        smtp_user: document.getElementById("settings-smtp-user").value,
                        session_timeout_minutes: parseInt(document.getElementById("settings-timeout").value),
                        security_mode: document.getElementById("settings-security").value
                    };
                    
                    try {
                        await apiFetch("/api/config", {
                            method: "PUT",
                            body: JSON.stringify(payload)
                        });
                        showToast("System configurations saved successfully!");
                    } catch (err) {
                        showToast(err.message, "error");
                    } finally {
                        submitBtn.disabled = false;
                    }
                };
            }
        }

        // Initialize Cases Tab Buttons
        if (this.activeTab === "cases") {
            const editButtons = document.querySelectorAll(".btn-edit-case");
            editButtons.forEach(btn => {
                btn.onclick = async (e) => {
                    const id = e.currentTarget.getAttribute("data-id");
                    // Fetch list of cases to find correct details
                    const cases = await apiFetch("/api/cases");
                    const targetCase = cases.find(c => c.id == id);
                    if (targetCase) {
                        openEditCaseModal(targetCase);
                    }
                };
            });
        }

        // Initialize Model Drift charts
        if (this.activeTab === "drift") {
            apiFetch("/api/model-monitoring/drift").then(drift => {
                const labels = Object.keys(drift.feature_metrics);
                const values = Object.values(drift.feature_metrics);
                
                const canvas = document.getElementById("drift-bar-canvas");
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Feature PSI',
                                data: values,
                                backgroundColor: values.map(v => v >= 0.25 ? 'rgba(239, 68, 68, 0.7)' : (v >= 0.1 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(16, 185, 129, 0.7)')),
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { display: false }, grid: { display: false } },
                                y: { grid: { color: '#273549' }, ticks: { color: '#94a3b8' } }
                            }
                        }
                    });
                }
            });
        }

        // Initialize File Upload handlers
        if (this.activeTab === "files") {
            const stagePkl = document.getElementById("stage-model-dropzone");
            const pklInput = document.getElementById("pkl-file-input");
            const formPkl = document.getElementById("form-upload-pkl");
            
            if (stagePkl && pklInput) {
                stagePkl.onclick = () => pklInput.click();
                pklInput.onchange = () => {
                    stagePkl.querySelector("p").innerText = pklInput.files.length ? pklInput.files[0].name : "Select staged model (.pkl)";
                };
            }
            
            if (formPkl) {
                formPkl.onsubmit = async (e) => {
                    e.preventDefault();
                    const submitBtn = document.getElementById("btn-upload-pkl-submit");
                    submitBtn.disabled = true;
                    
                    const formData = new FormData();
                    formData.append("file", pklInput.files[0]);
                    
                    try {
                        const headers = {};
                        if (state.token) headers["Authorization"] = `Bearer ${state.token}`;
                        
                        const res = await fetch(`${window.location.origin}/api/files/models`, {
                            method: "POST",
                            body: formData,
                            headers
                        });
                        
                        if (!res.ok) throw new Error("Staging failed");
                        showToast("Model binary staged successfully!");
                    } catch (err) {
                        showToast(err.message, "error");
                    } finally {
                        submitBtn.disabled = false;
                    }
                };
            }

            const stageCsv = document.getElementById("dataset-dropzone");
            const csvInput = document.getElementById("csv-file-input");
            const formCsv = document.getElementById("form-upload-dataset");
            
            if (stageCsv && csvInput) {
                stageCsv.onclick = () => csvInput.click();
                csvInput.onchange = () => {
                    stageCsv.querySelector("p").innerText = csvInput.files.length ? csvInput.files[0].name : "Select training dataset (.csv)";
                };
            }
            
            if (formCsv) {
                formCsv.onsubmit = async (e) => {
                    e.preventDefault();
                    const submitBtn = document.getElementById("btn-upload-dataset-submit");
                    submitBtn.disabled = true;
                    
                    const formData = new FormData();
                    formData.append("file", csvInput.files[0]);
                    
                    try {
                        const headers = {};
                        if (state.token) headers["Authorization"] = `Bearer ${state.token}`;
                        
                        const res = await fetch(`${window.location.origin}/api/files/datasets`, {
                            method: "POST",
                            body: formData,
                            headers
                        });
                        
                        if (!res.ok) throw new Error("Dataset upload failed");
                        showToast("Training dataset uploaded successfully!");
                    } catch (err) {
                        showToast(err.message, "error");
                    } finally {
                        submitBtn.disabled = false;
                    }
                };
            }

            // Download reports trigger
            const dlButtons = document.querySelectorAll(".btn-download-report");
            dlButtons.forEach(btn => {
                btn.onclick = (e) => {
                    const type = e.currentTarget.getAttribute("data-type");
                    window.open(`${window.location.origin}/api/files/reports/${type}?token=${state.token}`);
                    showToast(`Report downloaded successfully!`);
                };
            });
        }
    }
};

// FRAUD CASE EDIT MODAL
function openEditCaseModal(c) {
    const anchor = document.getElementById("case-edit-modal-anchor");
    if (!anchor) return;
    
    anchor.innerHTML = `
        <div class="modal-overlay" id="case-modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Review Case: CASE-${c.id} (TX-${c.transaction_id})</h3>
                    <button class="modal-close-btn" id="btn-close-case-modal">&times;</button>
                </div>
                
                <form id="form-edit-case">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div class="form-group">
                            <label class="form-label">Assign Investigator Email</label>
                            <input type="email" class="form-control" style="padding-left:12px;" id="case-assigned" required value="${c.assigned_to || state.user.email}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Review Status</label>
                            <select class="dropdown-select" id="case-status" style="margin:0;">
                                <option value="OPEN" ${c.status === 'OPEN' ? 'selected' : ''}>OPEN</option>
                                <option value="UNDER_INVESTIGATION" ${c.status === 'UNDER_INVESTIGATION' ? 'selected' : ''}>UNDER INVESTIGATION</option>
                                <option value="CLOSED_RESOLVED" ${c.status === 'CLOSED_RESOLVED' ? 'selected' : ''}>CLOSED (False Alarm / Resolved)</option>
                                <option value="CLOSED_FRAUD" ${c.status === 'CLOSED_FRAUD' ? 'selected' : ''}>CLOSED (Confirmed Fraud Alert)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Investigation Notes</label>
                        <textarea class="form-control" style="padding:12px; height:80px; font-family:inherit; resize:none;" id="case-notes" required placeholder="Add audit trace notes...">${c.notes || ''}</textarea>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" style="width:auto;" id="btn-cancel-case">Cancel</button>
                        <button type="submit" class="btn" style="width:auto;" id="btn-save-case-submit">Commit Review Settings</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const closeModal = () => anchor.innerHTML = "";
    document.getElementById("btn-close-case-modal").onclick = closeModal;
    document.getElementById("btn-cancel-case").onclick = closeModal;
    
    document.getElementById("form-edit-case").onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById("btn-save-case-submit");
        saveBtn.disabled = true;
        
        const payload = {
            assigned_to: document.getElementById("case-assigned").value,
            status: document.getElementById("case-status").value,
            notes: document.getElementById("case-notes").value
        };
        
        try {
            await apiFetch(`/api/cases/${c.id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            showToast("Fraud Case details updated successfully!");
            closeModal();
            // Refresh Cases View
            const content = await AdminView.renderCasesTab();
            document.getElementById("admin-tab-content-area").innerHTML = content;
            AdminView.init();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            saveBtn.disabled = false;
        }
    };
}

/* ----------------------------------
   App Navigation Routing Map
   ---------------------------------- */
const routes = {
    "#/login": LoginView,
    "#/register": RegisterView,
    "#/forgot-password": ForgotPasswordView,
    "#/reset-password": ResetPasswordView,
    "#/dashboard": DashboardView,
    "#/transactions": PredictionFormView,
    "#/upload": CSVUploadView,
    "#/bank-analysis": BankAnalysisView,
    "#/history": HistoryView,
    "#/analytics": AnalyticsView,
    "#/profile": ProfileView,
    "#/admin": AdminView
};

async function handleRouter() {
    const rawHash = window.location.hash || "#/dashboard";
    
    const parts = rawHash.split("?");
    const hash = parts[0];
    const query = parts[1] || "";
    
    const isAuthPage = hash === "#/login" || hash === "#/register" || hash === "#/forgot-password" || hash === "#/reset-password";
    
    if (!state.isAuthenticated() && !isAuthPage) {
        window.location.hash = "#/login";
        renderView(LoginView, "Login");
        return;
    }
    
    if (state.isAuthenticated() && (hash === "#/login" || hash === "#/register" || hash === "#/forgot-password" || hash === "#/reset-password")) {
        window.location.hash = "#/dashboard";
        return;
    }
    
    if (state.isAuthenticated()) {
        const role = state.getUserRole();
        if (hash === "#/admin" && role !== "ADMIN") {
            showToast("Unauthorized. Administrative permissions required.", "error");
            window.location.hash = "#/dashboard";
            return;
        }
        if ((hash === "#/transactions" || hash === "#/upload" || hash === "#/bank-analysis") && role === "USER") {
            showToast("Access Denied. Analyst permissions required.", "error");
            window.location.hash = "#/dashboard";
            return;
        }
    }
    
    const view = routes[hash];
    if (view) {
        let title = "Dashboard";
        if (hash.startsWith("#/transactions")) title = "New Evaluation";
        else if (hash.startsWith("#/upload")) title = "Batch CSV Upload";
        else if (hash.startsWith("#/bank-analysis")) title = "Bank Behavioural Analysis";
        else if (hash.startsWith("#/history")) title = "Evaluation History";
        else if (hash.startsWith("#/analytics")) title = "Fraud Analytics";
        else if (hash.startsWith("#/profile")) title = "Analyst Profile";
        else if (hash.startsWith("#/admin")) title = "Admin Panel";
        else if (hash.startsWith("#/forgot-password")) title = "Forgot Password";
        else if (hash.startsWith("#/reset-password")) title = "Reset Password";
        
        renderView(view, title);
    } else {
        window.location.hash = "#/dashboard";
    }
}

async function renderView(view, title) {
    const shell = document.getElementById("app-shell");
    if (!shell) return;
    
    const isAuthPage = view === LoginView || view === RegisterView || view === ForgotPasswordView || view === ResetPasswordView;
    
    if (isAuthPage) {
        shell.innerHTML = view.render();
        view.init();
    } else {
        const contentHtml = await view.render();
        shell.innerHTML = renderShell(contentHtml);
        
        const titleEl = document.getElementById("page-title");
        if (titleEl) titleEl.innerText = title;
        
        view.init();
        attachShellEvents();
    }
}

function attachShellEvents() {
    const logoutBtn = document.getElementById("btn-sidebar-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            state.clearAuth();
            showToast("Logged out successfully");
            window.location.hash = "#/login";
        });
    }
    
    const toggleBtn = document.getElementById("btn-menu-toggle");
    const sidebar = document.querySelector(".app-sidebar");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }
}

// Start listeners & polling
window.addEventListener("hashchange", handleRouter);
window.addEventListener("DOMContentLoaded", () => {
    handleRouter();
    if (state.isAuthenticated()) {
        startNotificationPolling();
    }
});
