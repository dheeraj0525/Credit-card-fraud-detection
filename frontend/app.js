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
    
    isAdmin() {
        return this.user && this.user.is_admin === true;
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
   Mock Datasets for Tester Form
   ---------------------------------- */
const sampleData = {
    safe: {
        Time: 40600.0,
        Amount: 25.90,
        V1: -0.338262, V2: 1.119593, V3: 1.044367, V4: -0.122161, V5: 0.697386, 
        V6: -0.465120, V7: 0.997701, V8: -0.272188, V9: -0.120794, V10: -0.228512, 
        V11: -0.923481, V12: -0.320188, V13: -0.420199, V14: -0.589887, V15: 0.932401, 
        V16: 0.220199, V17: -0.120199, V18: -0.450199, V19: 0.120199, V20: 0.150199, 
        V21: -0.248371, V22: -0.638421, V23: -0.050199, V24: -0.300199, V25: 0.150199, 
        V26: -0.210199, V27: 0.080199, V28: 0.050199
    },
    fraud: {
        Time: 90200.0,
        Amount: 890.00,
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
    const isAdmin = state.isAdmin();
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
                    <li class="menu-item ${activeRoute.startsWith("#/transactions") ? "active" : ""}">
                        <a href="#/transactions"><i class="fa-solid fa-cash-register"></i> New Predict</a>
                    </li>
                    <li class="menu-item ${activeRoute.startsWith("#/upload") ? "active" : ""}">
                        <a href="#/upload"><i class="fa-solid fa-file-csv"></i> CSV Upload</a>
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
                        <p class="user-role">${isAdmin ? "Administrator" : "Analyst"}</p>
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
                        
                        <button type="submit" class="btn"><i class="fa-solid fa-right-to-bracket"></i> Log In</button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Don't have an account? <a href="#/register">Create one</a></p>
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
                const email = document.getElementById("login-email").value;
                const password = document.getElementById("login-password").value;
                
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
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <div class="input-container">
                                <i class="fa-solid fa-lock"></i>
                                <input type="password" class="form-control" id="register-password" required placeholder="••••••••">
                            </div>
                        </div>
                        
                        <button type="submit" class="btn"><i class="fa-solid fa-user-plus"></i> Register</button>
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
                const email = document.getElementById("register-email").value;
                const password = document.getElementById("register-password").value;
                
                try {
                    await apiFetch("/api/auth/register", {
                        method: "POST",
                        body: JSON.stringify({ email: email, password: password })
                    });
                    
                    showToast("Registration successful! Please log in.");
                    window.location.hash = "#/login";
                } catch (err) {
                    showToast(err.message, "error");
                }
            });
        }
    }
};

// 3. USER DASHBOARD VIEW
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

        const recentAlertsHtml = alerts.slice(0, 5).map(tx => `
            <tr>
                <td>TX-${tx.id}</td>
                <td>$${tx.amount.toFixed(2)}</td>
                <td>${(tx.fraud_probability * 100).toFixed(1)}%</td>
                <td><span class="badge badge-high">${tx.risk_level}</span></td>
                <td>${new Date(tx.created_at).toLocaleString()}</td>
            </tr>
        `).join("");

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
                                <th>Scored At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentAlertsHtml || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No high-risk transactions detected.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    init() {}
};

// 4. TRANSACTION PREDICTION FORM
const PredictionFormView = {
    render() {
        // Generate inputs V1-V28
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
                                <label class="form-label">Time Offset (Seconds)</label>
                                <input type="number" step="any" class="form-control" id="tx-time" required value="0.0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Amount ($)</label>
                                <input type="number" step="any" class="form-control" id="tx-amount" required value="0.0">
                            </div>
                        </div>
                        
                        <label class="form-label">Anonymized PCA Features (V1 - V28)</label>
                        <div class="features-grid">
                            ${vFieldsHtml}
                        </div>
                        
                        <div class="btn-group">
                            <button type="button" class="btn btn-secondary" id="btn-reset-form"><i class="fa-solid fa-rotate-left"></i> Reset</button>
                            <button type="submit" class="btn"><i class="fa-solid fa-shield-heart"></i> Get Score</button>
                        </div>
                    </form>
                </div>
                
                <div id="prediction-result-target"></div>
            </div>
        `;
    },
    init() {
        const select = document.getElementById("sample-payload-select");
        const resetBtn = document.getElementById("btn-reset-form");
        const form = document.getElementById("form-score");
        
        // Auto-fill mock template values
        if (select) {
            select.addEventListener("change", (e) => {
                const choice = e.target.value;
                if (!choice) return;
                
                const data = sampleData[choice];
                document.getElementById("tx-time").value = data.Time;
                document.getElementById("tx-amount").value = data.Amount;
                
                for (let i = 1; i <= 28; i++) {
                    document.getElementById(`v-${i}`).value = data[`V${i}`];
                }
                
                showToast(`Auto-filled ${choice} template data!`);
            });
        }
        
        // Reset form to zeroes
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                form.reset();
                document.getElementById("sample-payload-select").value = "";
                document.getElementById("prediction-result-target").innerHTML = "";
            });
        }
        
        // Form Submission
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                // Assemble prediction payload
                const payload = {
                    Time: parseFloat(document.getElementById("tx-time").value),
                    Amount: parseFloat(document.getElementById("tx-amount").value)
                };
                
                for (let i = 1; i <= 28; i++) {
                    payload[`V${i}`] = parseFloat(document.getElementById(`v-${i}`).value);
                }
                
                try {
                    const res = await apiFetch("/api/transactions/score", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                    
                    renderPredictionResult(res);
                } catch (err) {
                    showToast(err.message, "error");
                }
            });
        }
    }
};

// PREDICTION RESULT CARD INJECTOR
function renderPredictionResult(res) {
    const target = document.getElementById("prediction-result-target");
    if (!target) return;
    
    const percentage = (res.fraud_probability * 100).toFixed(1);
    const risk = res.risk_level;
    
    let color = "var(--color-success)";
    let badgeClass = "badge-low";
    if (risk === "HIGH") {
        color = "var(--color-danger)";
        badgeClass = "badge-high";
    } else if (risk === "MEDIUM") {
        color = "var(--color-warning)";
        badgeClass = "badge-medium";
    }
    
    target.innerHTML = `
        <div class="card" style="animation: slideIn 0.3s forwards;">
            <div class="card-title">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>Evaluation Result</span>
            </div>
            
            <div class="prediction-result-wrapper">
                <div class="gauge-chart-container">
                    <canvas id="gauge-canvas"></canvas>
                    <div class="gauge-percentage">${percentage}%</div>
                </div>
                
                <div class="result-badge badge ${badgeClass}">
                    ${risk} RISK LEVEL
                </div>
                
                <p class="result-details">
                    This transaction has a <strong>${percentage}%</strong> probability of being fraudulent. 
                    ${risk === "HIGH" ? "Immediate hold is recommended." : "No suspicious indicators detected."}
                </p>
            </div>
        </div>
    `;
    
    // Draw Gauge Chart via Chart.js
    const ctx = document.getElementById("gauge-canvas").getContext("2d");
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [res.fraud_probability, 1 - res.fraud_probability],
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
    
    target.scrollIntoView({ behavior: "smooth" });
}

// 5. CSV BATCH UPLOAD VIEW
const CSVUploadView = {
    render() {
        return `
            <div class="card" style="max-width: 700px; margin: 0 auto;">
                <div class="card-title">
                    <i class="fa-solid fa-file-csv"></i>
                    <span>Batch Predict with CSV file</span>
                </div>
                
                <p style="margin-bottom: 20px; color: var(--text-muted); font-size: 14px;">
                    Upload a credit card transaction history file. The CSV must contain column headers corresponding to 
                    <code>Time</code>, <code>Amount</code>, and all PCA features <code>V1</code> to <code>V28</code>.
                </p>
                
                <div class="upload-dropzone" id="csv-dropzone">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <h3>Drag & Drop CSV File here</h3>
                    <p>or click to browse local computer</p>
                    <input type="file" id="csv-file-input" class="file-input" accept=".csv">
                </div>
                
                <div id="upload-results-target"></div>
            </div>
        `;
    },
    init() {
        const dropzone = document.getElementById("csv-dropzone");
        const fileInput = document.getElementById("csv-file-input");
        
        if (dropzone) {
            dropzone.addEventListener("click", () => fileInput.click());
            
            // Drag and drop events
            dropzone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropzone.classList.add("dragover");
            });
            
            dropzone.addEventListener("dragleave", () => {
                dropzone.classList.remove("dragover");
            });
            
            dropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropzone.classList.remove("dragover");
                
                const files = e.dataTransfer.files;
                if (files.length) {
                    processCSVUpload(files[0]);
                }
            });
        }
        
        if (fileInput) {
            fileInput.addEventListener("change", (e) => {
                const files = e.target.files;
                if (files.length) {
                    processCSVUpload(files[0]);
                }
            });
        }
    }
};

// File Upload processing using FormData
async function processCSVUpload(file) {
    const target = document.getElementById("upload-results-target");
    if (!target) return;
    
    // Validate file
    if (!file.name.endsWith(".csv")) {
        showToast("Only CSV files are supported", "error");
        return;
    }
    
    target.innerHTML = `
        <div style="text-align: center; padding: 24px;">
            <div class="loader" style="margin: 0 auto 12px auto;"></div>
            <p>Processing CSV file. Please wait...</p>
        </div>
    `;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const headers = {};
        if (state.token) {
            headers["Authorization"] = `Bearer ${state.token}`;
        }
        
        const response = await fetch(`${window.location.origin}/api/transactions/upload`, {
            method: "POST",
            body: formData,
            headers
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || "Upload failed");
        }
        
        const data = await response.json();
        
        target.innerHTML = `
            <div class="upload-results" style="animation: slideIn 0.3s forwards;">
                <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: var(--color-success);">
                    <i class="fa-solid fa-circle-check"></i> File Scored Successfully
                </h4>
                <div style="font-size: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
                    <div><strong>Filename:</strong> ${data.filename}</div>
                    <div><strong>Processed:</strong> ${data.total_records_processed}</div>
                    <div><strong>High Risk Warnings:</strong> <span style="color: var(--color-danger); font-weight:700;">${data.fraud_alerts_detected}</span></div>
                    <div><strong>Truncated (&gt;5000 records):</strong> ${data.truncated ? 'Yes' : 'No'}</div>
                </div>
            </div>
        `;
        showToast("CSV processing completed!");
        
    } catch (err) {
        target.innerHTML = `
            <div class="alert-error" style="margin-top: 24px;">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>${err.message}</span>
            </div>
        `;
    }
}

// 6. ANALYTICS & FRAUD CHARTS
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
        
        // Total safe vs high risk
        const safeCount = Math.max(0, stats.total_transactions - stats.high_risk_transactions);
        const highRiskCount = stats.high_risk_transactions;
        
        // Draw Doughnut Chart
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
        
        // Draw Bar Chart
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

// 7. PROFILE VIEW
const ProfileView = {
    render() {
        const user = state.user || { email: "user@fraudsense.com", is_admin: false };
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
                        <strong>${user.is_admin ? 'ADMINISTRATOR' : 'ANALYST'}</strong>
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

// 8. ADMIN DASHBOARD VIEW (MANAGE USERS)
const AdminView = {
    async render() {
        if (!state.isAdmin()) {
            return `
                <div class="alert-error">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Unauthorized. Administrative privileges required.</span>
                </div>
            `;
        }

        let users = [];
        try {
            users = await apiFetch("/api/users");
        } catch (err) {
            console.error("Error loading users list:", err);
        }

        const usersHtml = users.map(u => `
            <tr>
                <td>ID-${u.id}</td>
                <td>${u.email}</td>
                <td>${u.is_admin ? '<span class="badge badge-medium">ADMIN</span>' : '<span class="badge badge-low">ANALYST</span>'}</td>
                <td>
                    <span class="badge ${u.is_active ? 'badge-active' : 'badge-inactive'}">
                        ${u.is_active ? 'Active' : 'Blocked'}
                    </span>
                </td>
                <td>
                    ${u.is_active && !u.is_admin ? `
                        <button class="btn btn-danger btn-block-user" data-id="${u.id}" style="padding: 6px 12px; font-size:11px; width:auto;">
                            Block User
                        </button>
                    ` : 'None'}
                </td>
            </tr>
        `).join("");

        return `
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-users-gear"></i>
                    <span>Manage Analyst Accounts</span>
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
                            ${usersHtml || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No users registered.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    init() {
        // Block User actions
        const blockButtons = document.querySelectorAll(".btn-block-user");
        blockButtons.forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const userId = e.target.getAttribute("data-id");
                if (confirm("Are you sure you want to block this user analyst?")) {
                    try {
                        await apiFetch(`/api/users/${userId}/block`, {
                            method: "PUT"
                        });
                        showToast("User blocked successfully!");
                        window.location.reload();
                    } catch (err) {
                        showToast(err.message, "error");
                    }
                }
            });
        });
    }
};

/* ----------------------------------
   App Navigation Routing Map
   ---------------------------------- */
const routes = {
    "#/login": LoginView,
    "#/register": RegisterView,
    "#/dashboard": DashboardView,
    "#/transactions": PredictionFormView,
    "#/upload": CSVUploadView,
    "#/analytics": AnalyticsView,
    "#/profile": ProfileView,
    "#/admin": AdminView
};

async function handleRouter() {
    const hash = window.location.hash || "#/dashboard";
    
    // Auth Guard redirects
    if (!state.isAuthenticated() && hash !== "#/register") {
        window.location.hash = "#/login";
        renderView(LoginView, "Login");
        return;
    }
    
    if (state.isAuthenticated() && (hash === "#/login" || hash === "#/register")) {
        window.location.hash = "#/dashboard";
        return;
    }
    
    const view = routes[hash];
    if (view) {
        let title = "Dashboard";
        if (hash.startsWith("#/transactions")) title = "New Evaluation";
        else if (hash.startsWith("#/upload")) title = "Batch CSV Upload";
        else if (hash.startsWith("#/analytics")) title = "Fraud Analytics";
        else if (hash.startsWith("#/profile")) title = "Analyst Profile";
        else if (hash.startsWith("#/admin")) title = "Admin Panel";
        
        renderView(view, title);
    } else {
        // Redirect to dashboard on unmatched hash
        window.location.hash = "#/dashboard";
    }
}

// Render dynamic html templates to Shell
async function renderView(view, title) {
    const shell = document.getElementById("app-shell");
    if (!shell) return;
    
    const isAuthPage = view === LoginView || view === RegisterView;
    
    if (isAuthPage) {
        shell.innerHTML = view.render();
        view.init();
    } else {
        // Authenticated shell
        const contentHtml = await view.render();
        shell.innerHTML = renderShell(contentHtml);
        
        // Add dynamic title
        const titleEl = document.getElementById("page-title");
        if (titleEl) titleEl.innerText = title;
        
        view.init();
        attachShellEvents();
    }
}

// Hook sidebar action buttons
function attachShellEvents() {
    // Logout Action
    const logoutBtn = document.getElementById("btn-sidebar-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            state.clearAuth();
            showToast("Logged out successfully");
            window.location.hash = "#/login";
        });
    }
    
    // Mobile responsive sidebar toggle
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
