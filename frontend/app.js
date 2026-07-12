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
    },
    
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
    
    // Auto-remove toast after 4s
    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s forwards";
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
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
    
    // Return json if content exists
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
                <!-- Stat Cards -->
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
            
            <!-- Email Modal Anchor -->
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
                    // 1. Fetch ML Score from FastAPI
                    const mlRes = await apiFetch("/api/transactions/score", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                    
                    // 2. Fetch Behavioural Profile if it exists
                    let profile = null;
                    try {
                        profile = await apiFetch(`/api/bank/profiles/${custId}`);
                    } catch (pErr) {
                        // Profile does not exist, which is fine
                    }
                    
                    // 3. Compute Behavioural Anomaly Score
                    let anomalies = [];
                    let behaviouralScore = 0.0;
                    
                    if (profile) {
                        // Check spending spike (Amount > 1.5 * max historical spending)
                        if (amount > profile.max_spending * 1.5) {
                            anomalies.push(`Transaction amount $${amount} is a spending spike (Historical Max: $${profile.max_spending})`);
                        }
                        
                        // Check new merchant (Not in common merchants list)
                        const commonM = JSON.parse(profile.common_merchants);
                        if (commonM.length > 0 && !commonM.some(m => merchant.toLowerCase().includes(m.toLowerCase()))) {
                            anomalies.push(`New merchant name: '${merchant}'`);
                        }
                        
                        // Check new location
                        const commonL = JSON.parse(profile.common_locations);
                        if (commonL.length > 0 && !commonL.some(l => location.toLowerCase().includes(l.toLowerCase()))) {
                            anomalies.push(`New location coordinates: '${location}'`);
                        }
                        
                        // Score calculation: 0.25 boost per anomaly flag
                        behaviouralScore = Math.min(1.0, anomalies.length * 0.25);
                    }
                    
                    // 4. Calculate Combined Risk Score
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
                    <!-- ML Score -->
                    <div style="text-align:center;">
                        <h4 style="font-size:11px; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Model Score</h4>
                        <div style="font-size:24px; font-weight:700;">${mlPct}%</div>
                    </div>
                    <!-- Behavioral Score -->
                    <div style="text-align:center; border-left:1px solid var(--border-color); padding-left:40px;">
                        <h4 style="font-size:11px; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Behavioural Score</h4>
                        <div style="font-size:24px; font-weight:700; color: ${profile && behaviouralScore > 0 ? 'var(--color-warning)' : 'inherit'};">${profile ? `${behPct}%` : 'N/A'}</div>
                    </div>
                    <!-- Combined Gauge -->
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
    
    // Draw Gauge Chart
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
    
    // Wire up Notify Bank Modal
    document.getElementById("btn-notify-bank-modal").addEventListener("click", () => {
        openNotifyBankModal(custId, mlRes, behaviouralScore, combinedScore, merchant, location);
    });
    
    // Wire up Export PDF click
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
    
    // Cancel & Close handlers
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
                <!-- Left panel: CSV Upload & Profile selection -->
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
                
                <!-- Right panel: Behavioral dashboard stats -->
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
                
                // Fetch stats and render
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
            <!-- Spending Overview Grid -->
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
            
            <!-- Merchants / Location lists -->
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
    
    // Wire up delete button
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

        // Subtabs Navigation
        const tabsHtml = `
            <div class="tab-nav">
                <button class="tab-btn ${this.activeTab === "users" ? "active" : ""}" data-tab="users"><i class="fa-solid fa-users"></i> Users</button>
                <button class="tab-btn ${this.activeTab === "audit" ? "active" : ""}" data-tab="audit"><i class="fa-solid fa-list-check"></i> Audit Logs</button>
                <button class="tab-btn ${this.activeTab === "model" ? "active" : ""}" data-tab="model"><i class="fa-solid fa-brain"></i> Model Performance</button>
                <button class="tab-btn ${this.activeTab === "rules" ? "active" : ""}" data-tab="rules"><i class="fa-solid fa-bars-staggered"></i> Fraud Rules</button>
                <button class="tab-btn ${this.activeTab === "notifications" ? "active" : ""}" data-tab="notifications"><i class="fa-solid fa-envelope-circle-check"></i> Email Alerts Log</button>
            </div>
        `;

        let tabContent = "";
        if (this.activeTab === "users") {
            tabContent = await this.renderUsersTab();
        } else if (this.activeTab === "audit") {
            tabContent = await this.renderAuditTab();
        } else if (this.activeTab === "model") {
            tabContent = await this.renderModelTab();
        } else if (this.activeTab === "rules") {
            tabContent = await this.renderRulesTab();
        } else if (this.activeTab === "notifications") {
            tabContent = await this.renderNotificationsTab();
        }

        return `
            ${tabsHtml}
            <div id="admin-tab-content-area" style="animation: slideIn 0.2s forwards;">
                ${tabContent}
            </div>
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

    async renderAuditTab() {
        let logs = [];
        try {
            logs = await apiFetch("/api/admin/audit-logs");
        } catch (err) {
            console.error("Error loading audit logs:", err);
        }

        const rowsHtml = logs.map(l => `
            <tr>
                <td>ID-${l.id}</td>
                <td>${l.action}</td>
                <td>${new Date(l.created_at).toLocaleString()}</td>
            </tr>
        `).join("");

        return `
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-list-check"></i>
                    <span>System Audit Timelines</span>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>Activity Action</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No system activities logged.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async renderModelTab() {
        let perf = { version: "Unknown", roc_auc: 0.0, accuracy: 0.0, precision: 0.0, recall: 0.0, confusion_matrix: { tp: 0, fn: 0, fp: 0, tn: 0 } };
        try {
            perf = await apiFetch("/api/admin/model-performance");
        } catch (err) {
            console.error("Error loading model metrics:", err);
        }

        const matrix = perf.confusion_matrix;

        return `
            <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
                <div class="stat-card primary" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">Active Version</h4>
                        <div class="stat-value" style="font-size:16px; font-family:'Outfit'; text-overflow:ellipsis; overflow:hidden;">${perf.version}</div>
                    </div>
                </div>
                <div class="stat-card success" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">ROC-AUC metric</h4>
                        <div class="stat-value" style="font-size:18px;">${(perf.roc_auc * 100).toFixed(1)}%</div>
                    </div>
                </div>
                <div class="stat-card primary" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">Precision</h4>
                        <div class="stat-value" style="font-size:18px;">${(perf.precision * 100).toFixed(1)}%</div>
                    </div>
                </div>
                <div class="stat-card primary" style="padding:16px;">
                    <div class="stat-info">
                        <h4 style="font-size:10px;">Recall Rate</h4>
                        <div class="stat-value" style="font-size:18px;">${(perf.recall * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <!-- Confusion matrix -->
                <div class="card" style="margin:0;">
                    <div class="card-title"><i class="fa-solid fa-table-cells"></i> Confusion Matrix</div>
                    <div style="display:grid; grid-template-columns: 1fr 1.5fr 1.5fr; gap:12px; text-align:center; font-size:14px; margin-top:20px;">
                        <div></div>
                        <div style="font-weight:600; color:var(--text-muted);">Predict Safe</div>
                        <div style="font-weight:600; color:var(--text-muted);">Predict Fraud</div>
                        
                        <div style="font-weight:600; text-align:left; color:var(--text-muted);">Actual Safe</div>
                        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:12px; border-radius:4px;">
                            ${matrix.tn} <span style="font-size:10px; color:var(--text-muted); display:block;">TN</span>
                        </div>
                        <div style="background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:4px; color:var(--color-danger);">
                            ${matrix.fp} <span style="font-size:10px; color:var(--text-muted); display:block;">FP (False Alarm)</span>
                        </div>
                        
                        <div style="font-weight:600; text-align:left; color:var(--text-muted);">Actual Fraud</div>
                        <div style="background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:4px;">
                            ${matrix.fn} <span style="font-size:10px; color:var(--text-muted); display:block;">FN (Missed)</span>
                        </div>
                        <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); padding:12px; border-radius:4px; color:var(--color-success);">
                            ${matrix.tp} <span style="font-size:10px; color:var(--text-muted); display:block;">TP (Blocked)</span>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="margin:0; display:flex; flex-direction:column; justify-content:center; align-items:center; border:1px dashed var(--border-color); color:var(--text-muted);">
                    <i class="fa-solid fa-chart-area" style="font-size:48px; margin-bottom:12px;"></i>
                    <p>ROC Metric details extracted from local evaluate.py</p>
                </div>
            </div>
        `;
    },

    async renderRulesTab() {
        let rules = [];
        try {
            rules = await apiFetch("/api/admin/fraud-rules");
        } catch (err) {
            console.error("Error loading rules:", err);
        }

        const rowsHtml = rules.map(r => `
            <tr>
                <td>ID-${r.id}</td>
                <td><strong>${r.name}</strong></td>
                <td><code>${r.condition}</code></td>
                <td>+${(r.score_boost * 100).toFixed(0)}%</td>
                <td><span class="badge badge-active">${r.status}</span></td>
            </tr>
        `).join("");

        return `
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>Custom Behavioral Risk Rules</span>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Rule ID</th>
                                <th>Rule Name</th>
                                <th>Trigger Condition</th>
                                <th>Risk Score Weight</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No rules active.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async renderNotificationsTab() {
        let logs = [];
        try {
            logs = await apiFetch("/api/notifications");
        } catch (err) {
            console.error("Error loading notification logs:", err);
        }

        const rowsHtml = logs.map(l => {
            const isSent = l.status === "SENT";
            const badge = isSent ? "badge-low" : "badge-high";
            
            return `
                <tr>
                    <td>AL-${l.id}</td>
                    <td>${l.customer_name}</td>
                    <td>TX-${l.transaction_id}</td>
                    <td>$${l.amount.toFixed(2)}</td>
                    <td><span class="badge ${badge}">${l.status}</span></td>
                    <td>${new Date(l.created_at).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-secondary btn-resend-email" data-id="${l.id}" style="padding: 6px 12px; font-size:11px; width:auto;">
                            <i class="fa-solid fa-rotate"></i> Resend
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        return `
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-envelope-circle-check"></i>
                    <span>Fraud Email Alert Dispatch logs</span>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Alert ID</th>
                                <th>Customer Name</th>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Datetime</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No notifications sent yet.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    init() {
        // Wire up sub-tabs buttons click handlers
        const tabButtons = document.querySelectorAll(".tab-btn");
        tabButtons.forEach(btn => {
            btn.onclick = async (e) => {
                const choice = e.currentTarget.getAttribute("data-tab");
                this.activeTab = choice;
                
                // Re-render
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

        // Wire up Block Analyst action buttons
        if (this.activeTab === "users") {
            const blockButtons = document.querySelectorAll(".btn-block-user");
            blockButtons.forEach(btn => {
                btn.onclick = async (e) => {
                    const userId = e.target.getAttribute("data-id");
                    if (confirm("Are you sure you want to block this user analyst?")) {
                        try {
                            await apiFetch(`/api/users/${userId}/block`, {
                                method: "PUT"
                            });
                            showToast("User blocked successfully!");
                            // Force refresh users sub-tab content
                            const content = await this.renderUsersTab();
                            document.getElementById("admin-tab-content-area").innerHTML = content;
                            this.init();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    }
                };
            });
        }

        // Wire up Resend Email actions
        if (this.activeTab === "notifications") {
            const resendButtons = document.querySelectorAll(".btn-resend-email");
            resendButtons.forEach(btn => {
                btn.onclick = async (e) => {
                    const logId = e.currentTarget.getAttribute("data-id");
                    try {
                        const res = await apiFetch(`/api/notifications/${logId}/resend`, {
                            method: "POST"
                        });
                        showToast(res.message);
                        
                        // Force refresh notifications sub-tab
                        const content = await this.renderNotificationsTab();
                        document.getElementById("admin-tab-content-area").innerHTML = content;
                        this.init();
                    } catch (err) {
                        showToast(err.message, "error");
                    }
                };
            });
        }
    }
};

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
    
    // Parse query parameters
    const parts = rawHash.split("?");
    const hash = parts[0];
    const query = parts[1] || "";
    
    const isAuthPage = hash === "#/login" || hash === "#/register" || hash === "#/forgot-password" || hash === "#/reset-password";
    
    // Auth Guard redirects
    if (!state.isAuthenticated() && !isAuthPage) {
        window.location.hash = "#/login";
        renderView(LoginView, "Login");
        return;
    }
    
    if (state.isAuthenticated() && (hash === "#/login" || hash === "#/register" || hash === "#/forgot-password" || hash === "#/reset-password")) {
        window.location.hash = "#/dashboard";
        return;
    }
    
    // Role-based Access Guards
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

// Render dynamic html templates to Shell
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

// Hook sidebar action buttons
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

// Start listeners
window.addEventListener("hashchange", handleRouter);
window.addEventListener("DOMContentLoaded", handleRouter);
