"use strict";

const API = "https://api.lynli.me/api/v1";

const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = v => Number(v || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let _toastTimer = null;
function toast(msg, isErr) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.toggle("err", !!isErr);
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

function token() { return localStorage.getItem("qt_token") || ""; }
function setToken(t) { t ? localStorage.setItem("qt_token", t) : localStorage.removeItem("qt_token"); }

async function api(method, path, body) {
  const opt = { method, headers: { "Content-Type": "application/json" } };
  if (token()) opt.headers.Authorization = "Bearer " + token();
  if (body !== undefined) opt.body = JSON.stringify(body);
  const res = await fetch(API + path, opt);
  let j = null;
  try { j = await res.json(); } catch (e) { }
  if (!res.ok) {
    const msg = (j && (j.message || j.msg)) || ("请求失败 HTTP " + res.status);
    throw new Error(msg);
  }
  return j;
}

// ================= 路由定义 =================
const routes = {
  "": pageHome,
  "docs": pageDocs,
  "merchant": pageMerchant,
  "merchant/join": pageJoin,
  "join": pageJoin,
  "support": pageSupport,
  "cashier": pageCashier
};

function nav() {
  const h = (location.hash || "#/").replace(/^#\//, "").split("?")[0];
  (routes[h] || pageHome)();
  document.querySelectorAll(".topnav a").forEach(a =>
    a.classList.toggle("on", a.dataset.nav === (h.startsWith("merchant") || ["join"].includes(h) ? "merchant" : h))
  );
  window.scrollTo({ top: 0 });
}

// ================= 各页面逻辑 =================

// 1. 首页
function pageHome() {
  $("#app").innerHTML = `
  <div style="max-width: 1000px; margin: 60px auto; padding: 0 20px; text-align: center;">
    <div style="display:inline-block; background:#e8f1ff; color:#1e73ff; padding:6px 16px; border-radius:20px; font-size:14px; font-weight:bold; margin-bottom:20px;">
      ☀️ 晴天支付 · 与 Lynli 生态同源统一账号
    </div>
    <h1 style="font-size: 48px; color: #111; margin-bottom: 20px;">一笔资金，<span style="color:#1e73ff;">晴天</span>直达</h1>
    <p style="color: #666; font-size: 16px; line-height: 1.6; max-width: 600px; margin: 0 auto 40px;">
      多商户聚合支付平台：复用 Lynli 统一用户体系，审批即得专属支付标识 app_id / app_secret。<br>支付宝、USDT 双通道收款，固定 10% 费率，余额秒级到账、在线提现。
    </p>
    
    <div style="display:flex; max-width:500px; margin:0 auto 40px; background:#fff; border-radius:12px; padding:8px; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
      <input type="text" placeholder="输入商户订单号，查询支付状态…" style="flex:1; border:none; outline:none; padding:12px 16px; font-size:15px;">
      <button onclick="location.hash='#/cashier'" style="background:#1e73ff; color:#fff; border:none; border-radius:8px; padding:0 24px; font-size:15px; cursor:pointer;">查询</button>
    </div>

    <div style="display:flex; gap:20px; justify-content:center;">
      <a href="#/merchant/join" style="display:inline-block; background:#1e73ff; color:#fff; padding:12px 32px; border-radius:24px; text-decoration:none; font-weight:bold;">立即入驻 · 0 元开户</a>
      <a href="#/docs" style="display:inline-block; background:#fff; color:#1e73ff; border:1px solid #1e73ff; padding:12px 32px; border-radius:24px; text-decoration:none; font-weight:bold;">查看接入文档</a>
    </div>
    
    <div style="margin-top: 60px; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
      <div style="background:#fff; padding:30px; border-radius:16px; flex:1; min-width:200px; box-shadow:0 4px 20px rgba(0,0,0,0.03);">
        <h3 style="font-size: 36px; color: #1e73ff; margin-bottom: 10px;">10%</h3>
        <p style="color: #666; font-size: 14px;">固定费率 · 无任何隐藏费用</p>
      </div>
      <div style="background:#fff; padding:30px; border-radius:16px; flex:1; min-width:200px; box-shadow:0 4px 20px rgba(0,0,0,0.03);">
        <h3 style="font-size: 36px; color: #1e73ff; margin-bottom: 10px;">90%</h3>
        <p style="color: #666; font-size: 14px;">货款实时计入商户余额</p>
      </div>
      <div style="background:#fff; padding:30px; border-radius:16px; flex:1; min-width:200px; box-shadow:0 4px 20px rgba(0,0,0,0.03);">
        <h3 style="font-size: 36px; color: #1e73ff; margin-bottom: 10px;">T+0</h3>
        <p style="color: #666; font-size: 14px;">在线提现 · 平台审核打款</p>
      </div>
    </div>
  </div>`;
}

// 2. 开发者文档
function pageDocs() {
  $("#app").innerHTML = `
  <div style="max-width: 1000px; margin: 40px auto; padding: 0 20px; display: flex; gap: 30px;">
    <div style="width: 240px; flex-shrink: 0;">
      <div style="background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); position: sticky; top: 100px;">
        <h3 style="font-size: 16px; color: #111; margin-bottom: 16px;">接入指南</h3>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
          <a href="#/docs" style="color: #1e73ff; font-weight: bold; text-decoration: none;">快速开始</a>
          <a href="#/docs" style="color: #666; text-decoration: none;">签名规则</a>
          <a href="#/docs" style="color: #666; text-decoration: none;">支付网关</a>
        </div>
      </div>
    </div>
    
    <div style="flex: 1; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
      <h1 style="font-size: 28px; margin-bottom: 24px;">快速开始</h1>
      <p style="color: #444; font-size: 15px; line-height: 1.8; margin-bottom: 16px;">1. 使用 Lynli 主站账号登录商户中心，提交站点信息申请入驻；</p>
      <p style="color: #444; font-size: 15px; line-height: 1.8; margin-bottom: 16px;">2. 平台审批通过后，在「API 密钥」页获取 <code style="background:#f4f6f8; padding:2px 6px; border-radius:4px; color:#d63384;">app_id</code> 与 <code style="background:#f4f6f8; padding:2px 6px; border-radius:4px; color:#d63384;">app_secret</code>；</p>
      <p style="color: #444; font-size: 15px; line-height: 1.8; margin-bottom: 24px;">3. 按下方签名规则调用网关下单，把用户引导至收银台完成支付；</p>

      <h2 style="font-size: 22px; margin-bottom: 20px;">签名规则（MD5）</h2>
      <p style="color: #444; font-size: 15px; line-height: 1.8; margin-bottom: 16px;">所有网关请求必须携带 <code style="background:#f4f6f8; padding:2px 6px; border-radius:4px; color:#d63384;">sign</code>。生成方式：</p>
      <pre style="background: #f8f9fa; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; overflow-x: auto; border: 1px solid #eee;">
params = { app_id, out_trade_no, amount, name, timestamp }
raw  = "amount=100.00&app_id=QTxxx&name=订单&out_trade_no=M1001&timestamp=1735689600" + app_secret
sign = md5(raw) // 32 位小写</pre>
    </div>
  </div>`;
}

// 3. 商户中心 (100% 复刻截图)
function pageMerchant() {
  if (!token()) { pageJoin(true); return; }
  
  let uInfo = {};
  try { uInfo = JSON.parse(localStorage.getItem("userInfo") || "{}"); } catch(e){}
  const mockUid = uInfo.id || "5466"; 
  const mockMd5 = "d0498216697be28ddb79802a9f6b4bae25";

  $("#app").innerHTML = `
  <div style="display: flex; min-height: calc(100vh - 70px); background: #f0f5f9; font-family: -apple-system, sans-serif;">
    <!-- 左侧导航栏 -->
    <div style="width: 250px; background: #fff; border-right: 1px solid #e5eaef; padding: 20px 0; flex-shrink: 0;">
      <div style="padding: 0 20px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; background: #1e73ff; color: #fff; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 20px; font-weight: bold;">支</div>
        <div>
          <div style="font-size: 16px; font-weight: bold; color: #111;">晴天</div>
          <div style="font-size: 12px; color: #888;">商户服务平台</div>
        </div>
      </div>

      <div style="padding: 0 12px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 10px; padding-left: 8px;">商户工作台</div>
        
        <div style="background: #e8f1ff; color: #1e73ff; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          个人资料
        </div>
        
        <div style="padding-left: 40px; border-left: 1px solid #e5eaef; margin-left: 24px; margin-bottom: 30px;">
          <div style="padding: 10px 0; color: #1e73ff; font-size: 14px; font-weight: bold;">API信息</div>
          <div style="padding: 10px 0; color: #666; font-size: 14px; cursor: pointer;">修改资料</div>
        </div>

        <div style="font-size: 12px; color: #888; margin-bottom: 10px; padding-left: 8px;">交易与资金</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="padding: 12px 16px; color: #444; font-size: 14px; display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            订单记录
          </div>
          <div style="padding: 12px 16px; color: #444; font-size: 14px; display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            提现记录
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div style="flex: 1; padding: 30px 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 15px 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; gap: 16px; font-size: 16px; font-weight: bold; color: #333;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          个人资料
        </div>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 36px; height: 36px; background: #e8f1ff; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #1e73ff;">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <a href="javascript:void(0)" onclick="logout()" style="color: #666;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </a>
        </div>
      </div>

      <h1 style="font-size: 32px; color: #111; margin-bottom: 24px;">个人资料</h1>

      <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 30px;">
        <div style="display: flex; border-bottom: 1px solid #eee; margin-bottom: 30px;">
          <div style="padding: 10px 24px; border-bottom: 2px solid #1e73ff; color: #1e73ff; font-weight: bold; font-size: 15px;">API信息</div>
          <div style="padding: 10px 24px; color: #666; font-size: 15px; cursor: pointer;">修改资料</div>
        </div>

        <div style="max-width: 600px;">
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; color: #555; margin-bottom: 8px;">接口地址</label>
            <div style="display: flex; background: #f8fbff; border: 1px solid #e0eaf3; border-radius: 8px; overflow: hidden;">
              <input type="text" value="https://nzzf.org/" readonly style="flex: 1; border: none; background: transparent; padding: 12px 16px; color: #333; outline: none; font-size: 14px;">
              <button onclick="copyTxt('https://nzzf.org/')" style="background: #f0f5fa; border: none; border-left: 1px solid #e0eaf3; padding: 0 16px; color: #1e73ff; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                 <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <label style="display: block; font-size: 14px; color: #555; margin-bottom: 8px;">商户ID</label>
            <div style="display: flex; background: #f8fbff; border: 1px solid #e0eaf3; border-radius: 8px; overflow: hidden;">
              <input type="text" value="${mockUid}" readonly style="flex: 1; border: none; background: transparent; padding: 12px 16px; color: #333; outline: none; font-size: 14px;">
              <button onclick="copyTxt('${mockUid}')" style="background: #f0f5fa; border: none; border-left: 1px solid #e0eaf3; padding: 0 16px; color: #1e73ff; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                 <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <h3 style="font-size: 16px; color: #111; margin-bottom: 20px;">V1接口（MD5签名方式）：</h3>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; color: #555; margin-bottom: 8px;">商户MD5密钥</label>
            <div style="display: flex; background: #f8fbff; border: 1px solid #e0eaf3; border-radius: 8px; overflow: hidden;">
              <input type="text" value="${mockMd5}" readonly style="flex: 1; border: none; background: transparent; padding: 12px 16px; color: #333; outline: none; font-size: 14px;">
              <button onclick="copyTxt('${mockMd5}')" style="background: #f0f5fa; border: none; border-left: 1px solid #e0eaf3; padding: 0 16px; color: #1e73ff; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                 <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <div style="display: flex; gap: 16px; margin-bottom: 40px;">
            <a href="#/docs" style="background: #1e73ff; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px;">查看V1开发文档</a>
            <button style="background: #fff0f0; color: #d9534f; border: 1px solid #f5c6cb; padding: 10px 24px; border-radius: 6px; font-size: 14px; cursor: pointer;">重置商户MD5密钥</button>
          </div>

          <h3 style="font-size: 16px; color: #111; margin-bottom: 16px;">V2接口（RSA签名方式）：</h3>
          <div style="background: #fff; border: 1px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            联系客服获取 RSA 公私钥配置
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// 4. 登录/入驻
function pageJoin(loginOnly) {
  const isReg = !loginOnly;
  $("#app").innerHTML = `
  <div style="max-width: 440px; margin: 60px auto; padding: 40px; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
    <h2 style="text-align: center; font-size: 24px; color: #111; margin-bottom: 10px;">${isReg ? "商户入驻" : "商户登录"}</h2>
    <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 30px;">使用 Lynli 主站统一账号${isReg ? "，注册后提交入驻申请" : ""}</p>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px;">邮箱</label>
      <input id="au-email" type="email" placeholder="you@example.com" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; box-sizing: border-box;">
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px;">密码</label>
      <input id="au-pass" type="password" placeholder="至少 6 位密码" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; box-sizing: border-box;">
    </div>
    
    ${isReg ? `
    <div style="margin-bottom: 24px;">
      <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px;">邮箱验证码</label>
      <div style="display: flex; gap: 10px;">
        <input id="au-code" placeholder="6 位验证码" style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none;">
        <button id="au-send" onclick="sendEmailCode()" style="padding: 0 16px; background: #f0f5fa; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; white-space: nowrap; color: #333;">获取验证码</button>
      </div>
    </div>
    ` : ''}

    <button id="au-btn" onclick="doAuth(${isReg})" style="width: 100%; padding: 14px; background: #1e73ff; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">${isReg ? "注册并入驻" : "登录"}</button>
    
    <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
      ${isReg ? "已有账号？" : "还没有账号？"}
      <a href="#/${isReg ? "merchant" : "merchant/join"}" style="color: #1e73ff; text-decoration: none;">${isReg ? "去登录" : "注册入驻"}</a>
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
    if (loginRes.data.user) {
      localStorage.setItem("userInfo", JSON.stringify(loginRes.data.user));
    }
    toast("登录成功！");
    setTimeout(() => { location.reload(); }, 800);
    
  } catch (e) { 
    toast(e.message || e, true); 
  } finally {
    btn.disabled = false; 
    btn.textContent = isReg ? "注册并入驻" : "登录";
  }
};

window.logout = function () { 
  setToken(""); 
  localStorage.removeItem("userInfo");
  toast("已退出登录"); 
  location.hash = "#/"; 
};

// 5. 帮助支持
function pageSupport() {
  $("#app").innerHTML = `
  <div style="max-width: 800px; margin: 40px auto; padding: 40px; background: #fff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-flex; justify-content: center; align-items: center; width: 64px; height: 64px; background: #e8f1ff; color: #1e73ff; border-radius: 50%; margin-bottom: 16px;">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      </div>
      <h2 style="font-size: 28px; color: #111; margin-bottom: 12px;">帮助与支持</h2>
      <p style="color: #666; font-size: 15px;">遇到问题？查看常见问题，或联系我们的官方客服。</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px;">
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 12px; background: #fafafa;">
        <h3 style="font-size: 16px; margin-bottom: 10px; color: #111;">如何接入晴天支付？</h3>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">登录后前往「商户入驻」，填写站点名称即可生成专属 app_id 与 app_secret，随后即可调用网关。</p>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 12px; background: #fafafa;">
        <h3 style="font-size: 16px; margin-bottom: 10px; color: #111;">提现多久到账？</h3>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">提现申请提交后由平台人工审核（通常 1-2 小时内），审核通过后自动打款至您的支付宝账号。</p>
      </div>
    </div>

    <div style="text-align: center; padding: 40px 20px; border-radius: 16px; background: linear-gradient(135deg, #1e73ff 0%, #1557c4 100%); color: #fff;">
      <h3 style="font-size: 20px; margin-bottom: 12px; color: #fff;">没有找到答案？</h3>
      <p style="font-size: 14px; opacity: 0.9; margin-bottom: 24px;">我们的客服团队在线为你解答疑惑</p>
      <a href="https://t.me/your_support" target="_blank" style="background: #fff; color: #1e73ff; display: inline-block; padding: 12px 24px; font-weight: bold; border-radius: 8px; text-decoration: none;">
        联系 Telegram 客服
      </a>
    </div>
  </div>`;
}

// 6. 收银台
function pageCashier() {
  $("#app").innerHTML = `
  <div style="max-width: 500px; margin: 60px auto; padding: 40px; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center;">
    <span style="display: inline-block; background: #e8f1ff; color: #1e73ff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 20px;">晴天收银台</span>
    <div style="font-size: 40px; font-weight: bold; color: #111; margin-bottom: 10px;">¥ 0.00</div>
    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">请选择支付方式</p>
    
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <button style="padding: 16px; border: 2px solid #1e73ff; background: #e8f1ff; color: #1e73ff; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">支付宝支付</button>
      <button style="padding: 16px; border: 1px solid #ddd; background: #fafafa; color: #333; border-radius: 12px; font-size: 16px; cursor: pointer;">USDT (TRC20)</button>
    </div>
    <p style="color: #999; font-size: 12px; margin-top: 30px;">请在 15 分钟内完成支付，超时订单将自动关闭。</p>
  </div>`;
}

// 工具函数
window.copyTxt = function(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast("已复制"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("已复制");
  }
};

// 启动
nav();
