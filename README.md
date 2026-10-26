# 晴天支付 · QingTian Pay

Lynli 生态多商户聚合支付平台（C 端官网 + 商户中心 + 收银台）。

- 纯静态站点（HTML/CSS/原生 JS），无构建依赖，可直接托管至 Cloudflare Pages / GitHub Pages
- 后端 API：`https://api.lynli.me/api/v1/payplat/*`（仓库 shuji-chu/guanli）
- 统一用户体系：复用 Lynli 主站账号（`/api/v1/passport/auth/login`）
- 固定费率 10%，90% 实时计入商户余额，支持在线提现
- 收银台：支付宝二维码 / TRC20 USDT 地址复制，3 秒轮询查单

页面（hash 路由）：
- `#/` 首页（搜索查单、费率展示、商户入驻）
- `#/docs` 开发者文档（MD5 签名规则、网关、回调说明 · 署名：晴天）
- `#/merchant` 商户中心（登录 / 密钥管理 / 交易流水 / 提现）
- `#/cashier?trade_no=…` 收银台
