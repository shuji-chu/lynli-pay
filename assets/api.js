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

/* ---------------- 通用工具 ---------------- */
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function money(v) { const n = Number(v || 0); return isNaN(n) ? "0.00" : n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtTime(ts) { if (!ts) return "--"; return new Date(Number(ts) * 1000).toLocaleString("zh-CN", { hour12: false }); }
async function apiGet(path) {
    const headers = { "Content-Type": "application/json" };
    if (getToken()) headers["Authorization"] = "Bearer " + getToken();
    const res = await fetch(API_BASE + path, { method: "GET", headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) { if (res.status === 401) { clearToken(); location.href = "login.html"; } throw new Error((data && (data.message || data.msg)) || ("HTTP " + res.status)); }
    return data;
}
function requireLogin() { if (!getToken()) location.href = "login.html"; return !!getToken(); }
async function copyText(t) {
    try { await navigator.clipboard.writeText(t); toast("已复制到剪贴板"); }
    catch (e) {
        const ta = document.createElement("textarea"); ta.value = t;
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); toast("已复制到剪贴板");
    }
}

/* ---------------- MD5（纯 JS，网关真实签名） ---------------- */
function md5(str) {
    function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
    function au(x, y) { const l = (x & 0xFFFF) + (y & 0xFFFF), m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); }
    function cmn(q, a, b, x, s, t) { return au(rl(au(au(a, q), au(x, t)), s), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
    const u = unescape(encodeURIComponent(str));
    let x = Array.from(u, ch => ch.charCodeAt(0));
    const len = x.length;
    x.push(0x80);
    while (x.length % 64 !== 56) x.push(0);
    const bitLen = len * 8;
    for (let i = 0; i < 4; i++) x.push((bitLen >>> (i * 8)) & 0xFF);
    x.push(0, 0, 0, 0);
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 64) {
        const M = [];
        for (let j = 0; j < 16; j++) M[j] = x[i+j*4] | (x[i+j*4+1] << 8) | (x[i+j*4+2] << 16) | (x[i+j*4+3] << 24);
        let A = a, B = b, C = c, D = d;
        a=ff(a,b,c,d,M[0],7,-680876936); d=ff(d,a,b,c,M[1],12,-389564586); c=ff(c,d,a,b,M[2],17,606105819); b=ff(b,c,d,a,M[3],22,-1044525330);
        a=ff(a,b,c,d,M[4],7,-176418897); d=ff(d,a,b,c,M[5],12,1200080426); c=ff(c,d,a,b,M[6],17,-1473231341); b=ff(b,c,d,a,M[7],22,-45705983);
        a=ff(a,b,c,d,M[8],7,1770035416); d=ff(d,a,b,c,M[9],12,-1958414417); c=ff(c,d,a,b,M[10],17,-42063); b=ff(b,c,d,a,M[11],22,-1990404162);
        a=ff(a,b,c,d,M[12],7,1804603682); d=ff(d,a,b,c,M[13],12,-40341101); c=ff(c,d,a,b,M[14],17,-1502002290); b=ff(b,c,d,a,M[15],22,1236535329);
        a=gg(a,b,c,d,M[1],5,-165796510); d=gg(d,a,b,c,M[6],9,-1069501632); c=gg(c,d,a,b,M[11],14,643717713); b=gg(b,c,d,a,M[0],20,-373897302);
        a=gg(a,b,c,d,M[5],5,-701558691); d=gg(d,a,b,c,M[10],9,38016083); c=gg(c,d,a,b,M[15],14,-660478335); b=gg(b,c,d,a,M[4],20,-405537848);
        a=gg(a,b,c,d,M[9],5,568446438); d=gg(d,a,b,c,M[14],9,-1019803690); c=gg(c,d,a,b,M[3],14,-187363961); b=gg(b,c,d,a,M[8],20,1163531501);
        a=gg(a,b,c,d,M[13],5,-1444681467); d=gg(d,a,b,c,M[2],9,-51403784); c=gg(c,d,a,b,M[7],14,1735328473); b=gg(b,c,d,a,M[12],20,-1926607734);
        a=hh(a,b,c,d,M[5],4,-378558); d=hh(d,a,b,c,M[8],11,-2022574463); c=hh(c,d,a,b,M[11],16,1839030562); b=hh(b,c,d,a,M[14],23,-35309556);
        a=hh(a,b,c,d,M[1],4,-1530992060); d=hh(d,a,b,c,M[4],11,1272893353); c=hh(c,d,a,b,M[7],16,-155497632); b=hh(b,c,d,a,M[10],23,-1094730640);
        a=hh(a,b,c,d,M[13],4,681279174); d=hh(d,a,b,c,M[0],11,-358537222); c=hh(c,d,a,b,M[3],16,-722521979); b=hh(b,c,d,a,M[6],23,76029189);
        a=hh(a,b,c,d,M[9],4,-640364487); d=hh(d,a,b,c,M[12],11,-421815835); c=hh(c,d,a,b,M[15],16,530742520); b=hh(b,c,d,a,M[2],23,-995338651);
        a=ii(a,b,c,d,M[0],6,-198630844); d=ii(d,a,b,c,M[7],10,1126891415); c=ii(c,d,a,b,M[14],15,-1416354905); b=ii(b,c,d,a,M[5],21,-57434055);
        a=ii(a,b,c,d,M[12],6,1700485571); d=ii(d,a,b,c,M[3],10,-1894986606); c=ii(c,d,a,b,M[10],15,-1051523); b=ii(b,c,d,a,M[1],21,-2054922799);
        a=ii(a,b,c,d,M[8],6,1873313359); d=ii(d,a,b,c,M[15],10,-30611744); c=ii(c,d,a,b,M[6],15,-1560198380); b=ii(b,c,d,a,M[13],21,1309151649);
        a=ii(a,b,c,d,M[4],6,-145523070); d=ii(d,a,b,c,M[11],10,-1120210379); c=ii(c,d,a,b,M[2],15,718787259); b=ii(b,c,d,a,M[9],21,-343485551);
        a = au(a, A); b = au(b, B); c = au(c, C); d = au(d, D);
    }
    function hex(n) { let s = ""; for (let i = 0; i < 4; i++) s += ((n >>> (i * 8)) & 0xFF).toString(16).padStart(2, "0"); return s; }
    return hex(a) + hex(b) + hex(c) + hex(d);
}

/* ---------------- 发起测试支付（真实网关 + 真实 MD5 签名，拉起收银台） ---------------- */
async function lynTestPay() {
    if (!requireLogin()) return;
    const amount = parseFloat(prompt("测试支付金额（元）：", "1.00"));
    if (!(amount >= 0.01)) { toast("金额无效", true); return; }
    toast("正在创建测试订单…");
    try {
        const info = await apiGet("/payplat/merchant/info");
        const m = info && info.data;
        if (!m || m.status !== 1 || !m.app_id) throw new Error("商户未通过审核，无法发起测试支付");
        const params = {
            app_id: m.app_id,
            out_trade_no: "TEST" + Date.now(),
            amount: amount.toFixed(2),
            name: "晴天支付 · 测试订单",
            method: "alipay",
            timestamp: Math.floor(Date.now() / 1000),
        };
        params.sign = md5(Object.keys(params).sort().map(k => k + "=" + params[k]).join("&") + m.app_secret);
        const res = await fetch(API_BASE + "/payplat/gateway/submit", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params),
        });
        const j = await res.json().catch(() => null);
        const d = j && (j.data || j);
        const tradeNo = d && (d.trade_no || d.tradeNo);
        if (!tradeNo) throw new Error((j && (j.message || j.msg)) || "验签失败或下单失败（code " + (j && j.code) + "）");
        toast("测试订单已创建，跳转收银台");
        setTimeout(() => { location.href = "cashier.html?trade_no=" + encodeURIComponent(tradeNo); }, 600);
    } catch (e) { toast(e.message || e, true); }
}
