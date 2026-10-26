const API_BASE = "https://api.lynli.me/api/v1";
function getToken() { return localStorage.getItem('qt_token') || ''; }
function setToken(t) { localStorage.setItem('qt_token', t); }
function clearToken() { localStorage.removeItem('qt_token'); }
function toast(msg, isErr) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div'); t.id = 'toast';
        t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translate(-50%,-20px);background:rgba(17,24,39,0.95);color:#fff;padding:12px 24px;border-radius:8px;z-index:99999;font-size:14px;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);opacity:0;pointer-events:none;text-align:center;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);backdrop-filter:blur(8px);';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = isErr ? 'rgba(220,38,38,0.95)' : 'rgba(17,24,39,0.95)';
    t.style.opacity = '1';
    t.style.transform = 'translate(-50%, 0)';
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translate(-50%, -20px)'; }, 3000);
}
async function apiFetch(path, body) {
    const headers = { "Content-Type": "application/json" };
    if (getToken()) headers["Authorization"] = "Bearer " + getToken();
    const res = await fetch(API_BASE + path, { method: "POST", headers: headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.msg || "网络请求失败");
    return data;
}
function logout() { clearToken(); window.location.href = 'login.html'; }
async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const headers = {};
    if (getToken()) headers["Authorization"] = "Bearer " + getToken();
    const res = await fetch(API_BASE + '/user/avatar', { method: "POST", headers: headers, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.msg || "上传失败");
    return data;
}
