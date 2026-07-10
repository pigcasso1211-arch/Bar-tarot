# 今晚抽一间酒吧

手机优先的网页原型：抽一张塔罗牌，用牌面氛围推荐新加坡今晚适合去的酒吧。

## Run

```bash
/Users/zhengduruo/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm install
cp .env.example .env
/Users/zhengduruo/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dev
```

没有 `GOOGLE_MAPS_API_KEY` 时会自动使用 mock 酒吧数据，页面仍然可以完整体验。

## Deploy

生产环境只需要一个 Node Web Service：Express 会托管 `dist/` 前端文件，也会提供 `/api`。

### Render

1. 把 `bar-tarot` 推到 GitHub。
2. 在 Render 新建 `Blueprint`，选择这个 repo，Render 会读取 `render.yaml`。
3. 在 Render 的环境变量里设置：

```bash
GOOGLE_MAPS_API_KEY=你的GooglePlacesKey
NODE_ENV=production
```

`render.yaml` 已配置：

```bash
Build Command: pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /api/health
```

### Railway

1. 把 `bar-tarot` 推到 GitHub。
2. 在 Railway 选择 `Deploy from GitHub repo`。
3. Railway 会读取 `railway.json`。
4. 在 Variables 里设置：

```bash
GOOGLE_MAPS_API_KEY=你的GooglePlacesKey
NODE_ENV=production
```

部署成功后打开平台给你的域名，例如：

```text
https://bar-tarot.up.railway.app
```

验证 API：

```bash
curl https://你的域名/api/health
```

返回 `{"ok":true,"usesGoogle":true}` 就代表线上已经读到 Google Key。

## API

- `GET /api/tarot-cards`
- `POST /api/recommend`

```json
{
  "city": "Singapore",
  "cardId": "the-moon"
}
```
