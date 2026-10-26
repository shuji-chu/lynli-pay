const API_BASE = "https://api.lynli.me/api/v1";

// 全局 Token 管理
function getToken() { return localStorage.getItem('qt_token') || ''; }
function setToken(t) { localStorage.setItem('qt_token', t); }
function clearToken() { localStorage.removeItem('qt_token'); }

// 全局 Toast 提示
function toast(msg, isErr) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:8px;z-index:99999;font-size:14px;transition:opacity 0.3s;opacity:0;pointer-events:none;text-align:center;';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    if(isErr) t.style.background = '#d9534f'; else t.style.background = 'rgba(0,0,0,0.85)';
    t.style.opacity = '1';
    setTimeout(() => t.style.opacity = '0', 2500);
}

// 统一请求方法
async function apiFetch(path, body) {
    const headers = { "Content-Type": "application/json" };
    if (getToken()) headers["Authorization"] = "Bearer " + getToken();
    const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.msg || "网络请求失败");
    return data;
}

// 退出登录
function logout() {
    clearToken();
    window.location.href = 'login.html';
}
