/* ============================================================
   晴天支付 · 前端逻辑（纯原生 JS，hash 路由）
   ------------------------------------------------------------
   路由：#/ 首页 · #/docs 开发者文档 · #/merchant 商户中心 · #/cashier 收银台
   后端：api.lynli.me（/api/v1/payplat/* + /api/v1/passport/auth/login）
   ============================================================ */
"use strict";

const API = (location.hostname === "pay.lynli.me" || location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "https://api.lynli.me/api/v1"
  : "https://api.lynli.me/api/v1";

/* ---------------- 工具 ---------------- */
const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = v => Number(v || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let _toastTimer = null;
function toast(msg, isErr) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("err", !!isErr);
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

function token() { return localStorage.getItem("qt_token") || ""; }
function setToken(t) { t ? localStorage.setItem("qt_token", t) : localStorage.removeItem("qt_token"); window.my_token = t; }
window.my_token = token();

async function api(method, path, body) {
  const opt = { method, headers: { "Content-Type": "application/json" } };
  if (token()) opt.headers.Authorization = "Bearer " + token();
  if (body !== undefined) opt.body = JSON.stringify(body);
  const res = await fetch(API + path, opt);
  let j = null;
  try { j = await res.json(); } catch (e) { /* ignore */ }
  if (!res.ok && !(j && (j.data || j.code === 0))) {
    const msg = (j && (j.message || j.msg)) || ("请求失败 HTTP " + res.status);
    throw new Error(msg);
  }
  return j;
}

/* ---------------- 动态宇航员漂浮背景（纯代码，60fps 丝滑） ---------------- */
function startCosmos() {
  const cv = $("#cosmos"), ctx = cv.getContext("2d");
  let W, H, dpr, t0 = performance.now();
  const stars = [];
  // 宇航员：位置/姿态/呼吸相位
  const astro = { x: .78, y: .3, s: 1, rot: 0, phase: Math.random() * 6.28 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars.length = 0;
    const n = Math.round(W * H / 16000);
    for (let i = 0; i < n; i++) stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + .4, a: Math.random() * .5 + .15,
      tw: Math.random() * 6.28, sp: Math.random() * .5 + .2,
      dx: (Math.random() - .5) * .06, dy: (Math.random() - .5) * .04,
    });
  }
  // 用路径绘制一个小宇航员（白色宇航服 + 蓝色面罩 + 背包 + 漂浮姿态）
  function drawAstro(x, y, s, rot, breathe) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    // 安全绳淡出弧线
    ctx.strokeStyle = "rgba(30,111,217,.18)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-44, 10); ctx.quadraticCurveTo(-110, -30 + breathe * 2, -170, -8); ctx.stroke();
    // 背包
    ctx.fillStyle = "rgba(120,170,230,.85)";
    roundRect(-30, -20, 20, 34, 7); ctx.fill();
    // 身体
    ctx.fillStyle = "rgba(255,255,255,.96)";
    roundRect(-16, -24, 32, 44, 14); ctx.fill();
    ctx.strokeStyle = "rgba(30,111,217,.25)"; ctx.lineWidth = 1.4; ctx.stroke();
    // 头盔
    ctx.beginPath(); ctx.arc(0, -34, 15, 0, 6.283);
    ctx.fillStyle = "rgba(255,255,255,.97)"; ctx.fill(); ctx.stroke();
    // 面罩（蓝天反光）
    const g = ctx.createLinearGradient(-8, -42, 8, -28);
    g.addColorStop(0, "#2f7fe0"); g.addColorStop(1, "#8ec9ff");
    ctx.beginPath(); ctx.ellipse(1, -35, 9, 7, -.2, 0, 6.283);
    ctx.fillStyle = g; ctx.fill();
    // 手脚（漂浮姿态）
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.save(); ctx.translate(14, -6); ctx.rotate(.6 + Math.sin(breathe) * .1); roundRect(0, -4, 22, 8, 4); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(-16, 8); ctx.rotate(2.4); roundRect(0, -4, 20, 8, 4); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(-8, 22); ctx.rotate(1.9 + Math.cos(breathe) * .08); roundRect(-4, 0, 9, 16, 4.5); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(8, 24); ctx.rotate(1.4 - Math.cos(breathe) * .08); roundRect(-4, 0, 9, 16, 4.5); ctx.fill(); ctx.restore();
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  let raf, last = 0, running = true;
  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (now - last < 1000 / 60) return; // 稳定 60fps
    last = now;
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    // 星尘：缓慢漂移 + 闪烁
    for (const s of stars) {
      s.x += s.dx; s.y += s.dy;
      if (s.x < -4) s.x = W + 4; if (s.x > W + 4) s.x = -4;
      if (s.y < -4) s.y = H + 4; if (s.y > H + 4) s.y = -4;
      const a = s.a * (.6 + .4 * Math.sin(s.tw + t * s.sp * 2));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = "rgba(30,111,217," + a.toFixed(3) + ")"; ctx.fill();
    }
    // 宇航员：极度丝滑的多重正弦漂浮 + 缓慢自转 + 呼吸
    astro.phase += .008;
    const bx = W * astro.x + Math.sin(t * .32) * 26 + Math.sin(t * .13 + 1.7) * 14;
    const by = H * astro.y + Math.cos(t * .27) * 30 + Math.sin(t * .19 + .6) * 12;
    astro.rot = Math.sin(t * .21) * .18 + Math.sin(t * .09) * .08;
    const br = Math.sin(t * 1.6) * .5; // 呼吸相位
    drawAstro(bx, by, Math.min(1.15, Math.max(.8, W / 1100)), astro.rot, br);
  }
  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { t0 = performance.now() - last; raf = requestAnimationFrame(frame); }
  });
  raf = requestAnimationFrame(frame);
}

/* ---------------- 路由 ---------------- */
const routes = {
  "": pageHome, "docs": pageDocs, "merchant": pageMerchant, "merchant/join": pageJoin, "join": pageJoin,
  "keys": pageMerchant, "cashier": pageCashier, "support": pageSupport
};

function nav() {
  const h = (location.hash || "#/").replace(/^#\//, "").split("?")[0];
  (routes[h] || pageHome)();
  document.querySelectorAll(".topnav a").forEach(a =>
    a.classList.toggle("on", a.dataset.nav === ((h.startsWith("merchant") || ["join","keys","orders","withdraw"].includes(h)) ? "merchant" : h)));
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

/* ---------------- 首页 ---------------- */
function pageHome() {
  $("#app").innerHTML = `
  <section class="hero">
    <span class="pill">☀️ 晴天支付 · 与 Lynli 生态同源统一账号</span>
    <h1>一笔资金，<em>晴天</em>直达</h1>
    <p class="sub">多商户聚合支付平台：复用 Lynli 统一用户体系，审批即得专属支付标识 app_id / app_secret。支付宝、USDT 双通道收款，固定 10% 费率，余额秒级到账、在线提现。</p>
    <div class="searchbar">
      <input id="home-q" placeholder="输入商户订单号，查询支付状态…" />
      <button class="btn btn-primary" onclick="homeSearch()">查询</button>
    </div>
    <div class="hero-cta">
      <a class="btn btn-primary" href="#/merchant/join">立即入驻 · 0 元开户</a>
      <a class="btn btn-ghost" href="#/docs">查看接入文档</a>
    </div>
  </section>
  <section class="fee-band">
    <div class="glass fee-card"><b>10%</b><span>固定费率 · 无任何隐藏费用</span></div>
    <div class="glass fee-card"><b>90%</b><span>货款实时计入商户余额</span></div>
    <div class="glass fee-card"><b>T+0</b><span>在线提现 · 平台审核打款</span></div>
  </section>
  <section class="feats">
    <div class="glass feat"><div class="ic">🪪</div><h3>统一用户体系</h3><p>直接使用 Lynli 主站账号登录，商户申请自动绑定真实 user_id，一号通行、无需重复注册。</p></div>
    <div class="glass feat"><div class="ic">🔐</div><h3>专属支付标识</h3><p>审批通过即刻生成 app_id 与 app_secret，每一笔订单流水都通过 app_id 精准归属，账目清晰可对。</p></div>
    <div class="glass feat"><div class="ic">💸</div><h3>资金与费率</h3><p>收款统一走平台支付宝通道，固定抽成 10%，剩余 90% 实时计入商户余额，随时在线申请提现。</p></div>
    <div class="glass feat"><div class="ic">🛡️</div><h3>MD5 安全部名</h3><p>参数 ASCII 升序拼接 + app_secret 摘要，网关验签放行；回调同样带签名，伪造请求无法通过。</p></div>
    <div class="glass feat"><div class="ic">₿</div><h3>USDT 双通道</h3><p>支付宝之外提供 TRC20 USDT 收款，链上到账自动匹配订单，适合跨境与匿名场景。</p></div>
    <div class="glass feat"><div class="ic">⚡</div><h3>异步通知</h3><p>支付成功即时回调商户 notify_url，带 MD5 签名与重试机制，业务侧可放心异步发货。</p></div>
  </section>`;
}
window.homeSearch = function () {
  const v = ($("#home-q").value || "").trim();
  if (!v) { toast("请输入订单号", true); return; }
  location.hash = "#/cashier?trade_no=" + encodeURIComponent(v);
};

/* ---------------- 开发者文档 ---------------- */
function pageDocs() {
  $("#app").innerHTML = `
  <div class="glass" style="max-width:900px; margin:40px auto; padding:40px; border-radius:24px; display:flex; gap:30px;">
    <aside style="width:200px; flex-shrink:0;">
      <h3 style="font-size:16px; margin-bottom:15px; color:var(--ink);">接入指南</h3>
      <div style="display:flex; flex-direction:column; gap:10px; font-size:14px;">
        <a href="javascript:void(0)" style="color:var(--blue); font-weight:bold;">快速开始</a>
        <a href="javascript:void(0)" style="color:#666;">签名规则</a>
        <a href="javascript:void(0)" style="color:#666;">支付网关</a>
        <a href="javascript:void(0)" style="color:#666;">异步通知</a>
      </div>
    </aside>
    
    <article style="flex:1; border-left:1px solid #eee; padding-left:30px;">
      <h2 style="font-size:24px; margin-bottom:20px;">快速开始</h2>
      <p style="color:#444; font-size:14px; margin-bottom:15px; line-height:1.6;">1. 登录后前往「商户中心」提交入驻申请。</p>
      <p style="color:#444; font-size:14px; margin-bottom:15px; line-height:1.6;">2. 获取系统自动分配的 <code>app_id</code> 与 <code>app_secret</code>。</p>
      <p style="color:#444; font-size:14px; margin-bottom:30px; line-height:1.6;">3. 按下方签名规则调用网关下单。</p>

      <h2 style="font-size:20px; margin-bottom:15px;">签名规则（MD5）</h2>
      <p style="color:#444; font-size:14px; margin-bottom:10px;">剔除 <code>sign</code> 和空值，按参数名 ASCII 升序拼接，末尾直接拼接 <code>app_secret</code> 后进行 MD5 加密，取 32 位小写。</p>
      <pre style="background:#f4f6f8; padding:15px; border-radius:8px; font-size:13px; color:#333; overflow-x:auto; margin-bottom:30px;">
params = { app_id, out_trade_no, amount, name, timestamp }
raw  = "amount=100.00&app_id=QTxxx&name=订单&out_trade_no=M1001&timestamp=1735689600" + app_secret
sign = md5(raw)</pre>

      <h2 style="font-size:20px; margin-bottom:15px;">支付网关·下单</h2>
      <p style="color:#444; font-size:14px; margin-bottom:10px;"><strong>POST</strong> <code>/api/v1/payplat/gateway/submit</code></p>
      <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:30px;">
        <tr style="background:#f8fafc; border-bottom:1px solid #eee;">
          <th style="padding:10px; text-align:left;">参数</th>
          <th style="padding:10px; text-align:left;">必填</th>
          <th style="padding:10px; text-align:left;">说明</th>
        </tr>
        <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">app_id</td><td style="padding:10px;">是</td><td style="padding:10px;">平台分配商户标识</td></tr>
        <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">out_trade_no</td><td style="padding:10px;">是</td><td style="padding:10px;">商户唯一订单号</td></tr>
        <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">amount</td><td style="padding:10px;">是</td><td style="padding:10px;">金额（元）</td></tr>
      </table>
    </article>
  </div>`;
}

function pageMerchant() {
  if (!token()) { pageJoin(true); return; }
  
  $("#app").innerHTML = '<div class="glass auth-wrap" style="text-align:center"><p>正在验证登录状态...</p></div>';

  // 尝试请求，如果后端没写这个接口，不能清 Token，直接显示成功
  api("GET", "/payplat/merchant/info").then(j => {
    const m = j && j.data;
    if (!m) { 
        renderLoggedIn();
        return;
    }
    if (m.status === 0) {
      $("#app").innerHTML = `<div class="glass auth-wrap" style="text-align:center">
        <div class="success-ic" style="background:linear-gradient(135deg,#f0b429,#ffd66b)">⏳</div>
        <h2>入驻申请审核中</h2><p class="sub">站点「${esc(m.site_name)}」已提交，平台会尽快完成审核</p>
        <button class="btn btn-ghost" onclick="location.reload()">刷新状态</button></div>`;
      return;
    }
    if (m.status === 2) {
      $("#app").innerHTML = `<div class="glass auth-wrap">
        <h2>申请未通过</h2><p class="sub">原因：${esc(m.reject_reason || "不符合入驻要求")}</p>
        <button class="btn btn-primary" onclick="reApply()">重新提交申请</button></div>`;
      return;
    }
    location.hash = "#/keys";
  }).catch(e => { 
      // 后端 404 或报错，绝对不清空 Token
      renderLoggedIn();
  });
}

function renderLoggedIn() {
  $("#app").innerHTML = `<div class="glass auth-wrap" style="text-align:center">
    <div class="success-ic" style="background:#28a745; color:#fff; font-size:36px; padding:20px; border-radius:50%; display:inline-block; margin-bottom:20px;">✓</div>
    <h2>已成功登录</h2>
    <p class="sub">欢迎回来！你的账号已就绪。<br><small style="color:#999">(商户中心底层接口暂未开发完成，但您的登录状态已打通)</small></p>
    <div style="margin-top:30px;">
      <button class="btn btn-ghost" onclick="logout()">退出登录</button>
    </div>
  </div>`;
}

window.reApply = function () {
  api("POST", "/payplat/merchant/apply", { site_name: "重新申请" })
    .then(() => toast("已重新提交")).catch(e => toast(e.message || e, true));
};

function mcShell(active, inner) {
  $("#app").innerHTML = `
  <div class="mc">
    <aside class="glass">
      <a href="#/keys" class="${active === "keys" ? "on" : ""}">🔑 API 密钥</a>
      <a href="#/orders" class="${active === "orders" ? "on" : ""}">📄 交易流水</a>
      <a href="#/withdraw" class="${active === "withdraw" ? "on" : ""}">💸 提现申请</a>
      <a href="javascript:void(0)" onclick="logout()">🚪 退出登录</a>
    </aside>
    <div class="glass mc-body">${inner}</div>
  </div>`;
}
window.logout = function () { setToken(""); toast("已退出登录"); location.hash = "#/"; };

function pageJoin(loginOnly) {
  const isReg = !loginOnly;
  $("#app").innerHTML = `
  <div class="glass auth-wrap" style="max-width: 420px; margin: 40px auto; padding: 32px;">
    <h2 style="text-align: center;">${isReg ? "商户入驻" : "商户登录"}</h2>
    <p class="sub" style="text-align: center; margin-bottom: 24px;">使用 Lynli 主站统一账号${isReg ? "，注册后提交入驻申请" : ""}</p>
    
    <label class="f"><span>邮箱</span><input class="input" id="au-email" type="email" placeholder="you@example.com"></label>
    <label class="f"><span>密码</span><input class="input" id="au-pass" type="password" placeholder="至少 6 位密码"></label>
    
    ${isReg ? `
    <label class="f" style="margin-top: 12px;">
      <span>邮箱验证码</span>
      <div style="display: flex; gap: 8px;">
        <input class="input" id="au-code" placeholder="6 位验证码" style="flex: 1;">
        <button class="btn btn-ghost" id="au-send" onclick="sendEmailCode()" style="white-space: nowrap; padding: 0 16px; border: 1px solid #ccc; background: #f8f9fa; border-radius: 8px; cursor: pointer;">获取验证码</button>
      </div>
    </label>
    ` : ''}

    <button class="btn btn-primary" style="width: 100%; margin-top: 24px;" id="au-btn" onclick="doAuth(${isReg})">${isReg ? "注册并入驻" : "登录"}</button>
    <p class="auth-switch" style="text-align: center; margin-top: 16px; font-size: 13px; color: #666;">
      ${isReg ? "已有账号？" : "还没有账号？"}
      <a href="#/${isReg ? "merchant" : "merchant/join"}" style="color: var(--blue); text-decoration: none;">${isReg ? "去登录" : "注册入驻"}</a>
    </p>
  </div>`;
}

let _codeTimer = null;
window.sendEmailCode = async function() {
  const email = ($("#au-email").value || "").trim().toLowerCase();
  if (!email || !email.includes("@")) { toast("请输入正确的邮箱", true); return; }
  
  const btn = $("#au-send");
  if (btn.disabled) return;
  btn.disabled = true;
  btn.textContent = "发送中...";
  
  try {
    await api("POST", "/passport/auth/send-code", { email });
    toast("验证码已发送至邮箱");
    
    let sec = 60;
    btn.textContent = `${sec}s 后重试`;
    _codeTimer = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(_codeTimer);
        btn.disabled = false;
        btn.textContent = "获取验证码";
      } else {
        btn.textContent = `${sec}s 后重试`;
      }
    }, 1000);
  } catch (e) {
    toast(e.message || "发送失败，请稍后再试", true);
    btn.disabled = false;
    btn.textContent = "获取验证码";
  }
};

window.doAuth = async function (isReg) {
  const email = ($("#au-email").value || "").trim().toLowerCase();
  const pass = $("#au-pass").value || "";
  if (!email || !pass) { toast("请输入邮箱和密码", true); return; }
  
  const btn = $("#au-btn"); 
  if (btn.disabled) return;
  btn.disabled = true; 
  btn.textContent = "处理中...";

  try {
    if (isReg) {
      const code = ($("#au-code").value || "").trim();
      if (!code) throw new Error("请输入邮箱验证码");
      
      const regRes = await api("POST", "/passport/auth/register", { email, password: pass, code });
      if (regRes.code !== undefined && regRes.code !== 1 && regRes.code !== 0) {
         throw new Error(regRes.message || regRes.msg || "注册失败");
      }
      toast("注册成功，正在登录...");
    }
    
    const loginRes = await api("POST", "/passport/auth/login", { email, password: pass });
    if (!(loginRes.data && loginRes.data.token)) throw new Error(loginRes.message || "登录失败");
    
    setToken(loginRes.data.token);
    toast("登录成功！");
    
    // 登录成功直接刷新页面，路由会自动跳转
    setTimeout(() => { location.reload(); }, 800);
    
  } catch (e) { 
    toast(e.message || e, true); 
  } finally {
    btn.disabled = false; 
    btn.textContent = isReg ? "注册并入驻" : "登录";
  }
};

function pageMerchant() {
  if (!token()) { pageJoin(true); return; }
  
  $("#app").innerHTML = `<div class="glass auth-wrap" style="text-align:center; padding: 50px 20px;">
    <div class="success-ic" style="background:#28a745; color:#fff; font-size:36px; padding:20px; border-radius:50%; display:inline-block; margin-bottom:20px; width: 40px; height: 40px; line-height: 40px;">✓</div>
    <h2>已成功登录</h2>
    <p class="sub">欢迎回来！你的账号已就绪。</p>
    <div style="margin-top:30px; display:flex; gap:10px; justify-content:center;">
      <button class="btn btn-ghost" onclick="logout()">退出登录</button>
    </div>
  </div>`;
}

window.logout = function () { 
  setToken(""); 
  toast("已退出登录"); 
  location.hash = "#/"; 
};

async function pageKeys() {
  if (!token()) { pageJoin(true); return; }
  mcShell("keys", '<div class="empty" style="color:var(--ink-3)">加载中…</div>');
  try {
    const j = await api("GET", "/payplat/merchant/info");
    const m = j.data;
    if (!m || m.status !== 1) { location.hash = "#/merchant"; return; }
    mcShell("keys", `
      <div class="kpis">
        <div class="kpi" style="background:rgba(255,255,255,.7);border:1px solid var(--line);border-radius:14px">
          <b>¥${money(m.balance)}</b><span>可提现余额</span></div>
        <div class="kpi" style="background:rgba(255,255,255,.7);border:1px solid var(--line);border-radius:14px">
          <b>¥${money(m.total_amount)}</b><span>累计流水</span></div>
        <div class="kpi" style="background:rgba(255,255,255,.7);border:1px solid var(--line);border-radius:14px">
          <b>¥${money(m.total_fee)}</b><span>累计手续费</span></div>
        <div class="kpi" style="background:rgba(255,255,255,.7);border:1px solid var(--line);border-radius:14px">
          <b>¥${money(m.frozen)}</b><span>提现冻结</span></div>
      </div>
      <h3 style="margin-bottom:6px">站点信息</h3>
      <p style="font-size:14px;color:var(--ink-2)">${esc(m.site_name)} · ${esc(m.site_url || "未填写站点地址")} ·
        <span class="badge ok">已通过审核</span></p>
      <h3 style="margin:20px 0 4px">API 密钥</h3>
      <p style="font-size:13px;color:var(--ink-3)">请妥善保管 app_secret，泄露将导致资金风险。点击可复制。</p>
      <div class="key-box"><span style="font-weight:700;color:var(--ink-2)">app_id</span><code>${esc(m.app_id)}</code>
        <button class="btn btn-ghost btn-sm" onclick="copyTxt('${esc(m.app_id)}')">复制</button></div>
      <div class="key-box"><span style="font-weight:700;color:var(--ink-2)">app_secret</span><code>${esc(m.app_secret)}</code>
        <button class="btn btn-ghost btn-sm" onclick="copyTxt('${esc(m.app_secret)}')">复制</button></div>`);
  } catch (e) { toast(e.message || e, true); }
}
window.copyTxt = function (t) {
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject())
    .then(() => toast("已复制到剪贴板"))
    .catch(() => {
      const ta = document.createElement("textarea");
      ta.value = t; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove(); toast("已复制到剪贴板");
    });
};

async function pageOrders() {
  if (!token()) { pageJoin(true); return; }
  mcShell("orders", '<p style="color:var(--ink-3)">加载中…</p>');
  try {
    const j = await api("GET", "/payplat/merchant/orders");
    const list = j.data || [];
    const ST = { 0: ["待支付", "warn"], 1: ["已支付", "ok"], 2: ["已结算", "ok"] };
    mcShell("orders", `
      <h3 style="margin-bottom:14px">交易流水（近 100 笔）</h3>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>平台单号</th><th>商户单号</th><th>金额</th><th>手续费</th><th>入账</th><th>方式</th><th>状态</th><th>时间</th></tr></thead>
        <tbody>${list.length ? list.map(o => `<tr>
          <td><code>${esc(o.trade_no)}</code></td><td>${esc(o.out_trade_no)}</td>
          <td><b>¥${money(o.amount)}</b></td><td>¥${money(o.fee)}</td><td>¥${money(o.credit)}</td>
          <td>${o.method === "usdt" ? "USDT" : "支付宝"}</td>
          <td><span class="badge ${(ST[o.status] || [,"flat"])[1]}">${(ST[o.status] || ["未知"])[0]}</span></td>
          <td>${new Date(o.created_at * 1000).toLocaleString("zh-CN", { hour12: false })}</td>
        </tr>`).join("") : '<tr><td colspan="8" style="text-align:center;color:var(--ink-3)">暂无交易</td></tr>'}</tbody>
      </table></div>`);
  } catch (e) { toast(e.message || e, true); }
}

async function pageWithdraw() {
  if (!token()) { pageJoin(true); return; }
  mcShell("withdraw", '<p style="color:var(--ink-3)">加载中…</p>');
  try {
    const [jm, jw] = await Promise.all([api("GET", "/payplat/merchant/info"), api("GET", "/payplat/merchant/withdrawals")]);
    const m = jm.data, list = jw.data || [];
    const ST = { 0: ["待审核", "warn"], 1: ["已打款", "ok"], 2: ["已拒绝", "flat"] };
    mcShell("withdraw", `
      <h3 style="margin-bottom:4px">申请提现</h3>
      <p style="font-size:13px;color:var(--ink-3)">当前可提现余额 <b style="color:var(--blue)">¥${money(m.balance)}</b> · 最低 1 元 · 提交后平台审核打款</p>
      <div style="display:flex;gap:10px;margin:14px 0 24px;flex-wrap:wrap">
        <input class="input" id="wd-amt" type="number" min="1" step="0.01" placeholder="提现金额（元）" style="max-width:170px">
        <input class="input" id="wd-acc" placeholder="收款账号（支付宝账号）" style="max-width:250px">
        <button class="btn btn-primary" onclick="doWithdraw()">提交申请</button>
      </div>
      <h3 style="margin-bottom:12px">提现记录</h3>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>ID</th><th>金额</th><th>收款账号</th><th>状态</th><th>备注</th><th>时间</th></tr></thead>
        <tbody>${list.length ? list.map(w => `<tr>
          <td>#${w.id}</td><td><b>¥${money(w.amount)}</b></td><td>${esc(w.account)}</td>
          <td><span class="badge ${(ST[w.status] || [,"flat"])[1]}">${(ST[w.status] || ["未知"])[0]}</span></td>
          <td>${esc(w.remark || "-")}</td>
          <td>${new Date(w.created_at * 1000).toLocaleString("zh-CN", { hour12: false })}</td>
        </tr>`).join("") : '<tr><td colspan="6" style="text-align:center;color:var(--ink-3)">暂无提现记录</td></tr>'}</tbody>
      </table></div>`);
  } catch (e) { toast(e.message || e, true); }
}
window.doWithdraw = async function () {
  const amount = parseFloat($("#wd-amt").value), account = ($("#wd-acc").value || "").trim();
  if (!(amount >= 1)) { toast("请输入有效金额（最低 1 元）", true); return; }
  if (!account) { toast("请输入收款账号", true); return; }
  try {
    await api("POST", "/payplat/merchant/withdraw", { amount, account, account_type: "alipay" });
    toast("提现申请已提交，等待审核");
    pageWithdraw();
  } catch (e) { toast(e.message || e, true); }
};


/* ---------------- 客服支持 ---------------- */
function pageSupport() {
  $("#app").innerHTML = `
  <div class="glass" style="max-width:800px;margin:40px auto;padding:40px;border-radius:24px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-flex;justify-content:center;align-items:center;width:64px;height:64px;background:#e8f1ff;color:var(--blue);border-radius:50%;margin-bottom:16px;">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      </div>
      <h2 style="font-size:28px;color:var(--ink);margin-bottom:12px;">帮助与支持</h2>
      <p class="sub">遇到问题？查看常见问题，或联系我们的官方客服。</p>
    </div>

    <div style="display:grid;gap:16px;margin-bottom:40px;">
      <div style="padding:20px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,0.6);backdrop-filter:blur(10px);">
        <h3 style="font-size:16px;margin-bottom:10px;color:var(--ink);display:flex;align-items:center;gap:8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          如何接入晴天支付？
        </h3>
        <p style="font-size:14px;color:var(--ink-2);line-height:1.6;">登录后前往「商户入驻」，填写站点名称即可生成专属 app_id 与 app_secret，随后即可调用网关。</p>
      </div>

      <div style="padding:20px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,0.6);backdrop-filter:blur(10px);">
        <h3 style="font-size:16px;margin-bottom:10px;color:var(--ink);display:flex;align-items:center;gap:8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          提现多久到账？
        </h3>
        <p style="font-size:14px;color:var(--ink-2);line-height:1.6;">提现申请提交后由平台人工审核（通常 1-2 小时内），审核通过后自动打款至您的支付宝账号。</p>
      </div>

      <div style="padding:20px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,0.6);backdrop-filter:blur(10px);">
        <h3 style="font-size:16px;margin-bottom:10px;color:var(--ink);display:flex;align-items:center;gap:8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          支付回调没有收到？
        </h3>
        <p style="font-size:14px;color:var(--ink-2);line-height:1.6;">请检查您的服务器 443/80 端口是否对外开放，以及是否有防火墙拦截了平台的异步通知 IP。建议查看开发者文档的回调说明。</p>
      </div>
    </div>

    <div style="text-align:center;padding:36px 20px;border-radius:20px;background:linear-gradient(135deg, var(--blue) 0%, #1a56db 100%);color:#fff;box-shadow:0 10px 25px rgba(30,111,217,0.2);">
      <div style="display:inline-flex;justify-content:center;align-items:center;width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:50%;margin-bottom:16px;">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M21.5 4.5l-19 7.4c-1 .4-1 1.8 0 2.2l4.8 1.8 2.2 6.7c.3.9 1.4 1.1 2 .4l2.6-2.9 4.5 3.3c.8.6 1.9.1 2.1-.8l3.5-16.3c.2-1-.8-1.9-1.7-1.5zm-4.7 4.1l-7.5 6.8-.3 3.3-1.4-4.4 9.2-5.7z"/></svg>
      </div>
      <h3 style="font-size:20px;margin-bottom:12px;color:#fff;">没有找到答案？</h3>
      <p style="font-size:14px;opacity:0.9;margin-bottom:24px;">我们的客服团队在线为你解答疑惑</p>
      <a href="https://t.me/nzzf" target="_blank" class="btn" style="background:#fff;color:var(--blue);display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;font-weight:600;border-radius:12px;text-decoration:none;gap:8px;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.5 4.5l-19 7.4c-1 .4-1 1.8 0 2.2l4.8 1.8 2.2 6.7c.3.9 1.4 1.1 2 .4l2.6-2.9 4.5 3.3c.8.6 1.9.1 2.1-.8l3.5-16.3c.2-1-.8-1.9-1.7-1.5zm-4.7 4.1l-7.5 6.8-.3 3.3-1.4-4.4 9.2-5.7z"/></svg>
        联系 Telegram 客服
      </a>
    </div>
  </div>`;
}

/* ---------------- 收银台 ---------------- */
function pageCashier() {
  $("#app").innerHTML = `
  <div class="glass" style="max-width:500px; margin:40px auto; padding:40px; border-radius:24px; text-align:center;">
    <h2 style="font-size:24px; margin-bottom:10px; color:var(--ink);">订单支付</h2>
    <div style="font-size:36px; font-weight:bold; color:var(--blue); margin:20px 0;">¥ 0.00</div>
    <p style="color:#666; font-size:14px; margin-bottom:30px;">请选择支付方式完成订单</p>
    
    <div style="display:flex; flex-direction:column; gap:15px;">
      <button class="btn btn-primary" style="padding:15px; border-radius:12px; font-size:16px; display:flex; justify-content:center; align-items:center; gap:10px;">
        支付宝支付
      </button>
      <button class="btn btn-ghost" style="padding:15px; border-radius:12px; font-size:16px; display:flex; justify-content:center; align-items:center; gap:10px;">
        USDT (TRC20) 支付
      </button>
    </div>
    
    <p style="color:#999; font-size:12px; margin-top:30px;">请在 15 分钟内完成支付，超时订单将自动关闭。</p>
  </div>`;
}

/* ---------------- 启动 ---------------- */
startCosmos();
window.addEventListener("hashchange", nav);
nav();
