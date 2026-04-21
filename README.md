## Build

生成

```bash
docker build . -t ai-api:21  --platform linux/amd64
```

导出

```bash
docker save ai-api:21 -o ai-api:21.tar
```

删除本地镜像

```bash
docker rmi ai-api:21
```

说明：

- 后端镜像会在构建时自动打包 `admin` 前端（等同原 `web` 内置打包方式）。
- `website` 不会被打进后端镜像，由 `docker-compose.yml` 中的独立容器通过宿主机目录挂载运行。

## 服务器

```bash
cd /home/admin/ai-api
```

上传镜像文件到服务器

```bash
sudo docker load -i ai-api:21.tar
```

**修改 docker-compose.yml 中 版本**

```bash
sudo docker compose up -d
```

## Website 更新（无需重打后端镜像）

### 本地打包（在 `website` 目录执行）

```bash
pnpm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/

# 排除 macOS 元数据，且解压后直接得到 standalone 内容
COPYFILE_DISABLE=1 tar \
	--exclude='.DS_Store' \
	--exclude='__MACOSX' \
	--exclude='._*' \
	-czf website-release.tar.gz \
	-C .next/standalone .
```

上传 `website-release.tar.gz` 到服务器（例如 `/home/admin/ai-api/website-release.tar.gz`）。

### 服务器更新（前端目录：`/home/admin/ai-api/website/`）

```bash
cd /home/admin/ai-api

# 1) 备份当前版本
mv website website.bak.$(date +%F-%H%M%S)
mkdir -p website

# 2) 解压新版本
tar -xzf website-release.tar.gz -C website

# 3) 重启 website 容器
sudo docker compose restart website
```

如依赖有变化，建议执行：

```bash
sudo docker compose up -d website
```

### 推荐的稳妥做法

1. 先解压到临时目录，验证后再替换到 `website`，可减少半更新风险。
2. 保留最近 1-2 份 `website.bak.*` 备份，确认新版本稳定后再清理。

### macOS 额外文件说明

服务器上出现的 `.-.next`、`.-server.js`、`.-node_modules`、`..-package.json` 等异常文件，属于 macOS 打包时附带的元数据文件（AppleDouble），不是业务运行所需内容，建议排除。

上面的 `COPYFILE_DISABLE=1` 与 `--exclude='._*'` 已用于避免这类文件进入压缩包。

如服务器中已混入此类文件，可执行一次清理：

```bash
find /home/admin/ai-api/website \
	\( -type f \( -name '._*' -o -name '.DS_Store' -o -name '.-*' -o -name '..-*' \) \) -delete
find /home/admin/ai-api/website -type d -name '__MACOSX' -prune -exec rm -rf {} +
```

## 域名灰度测试（先测 website）

当前建议映射：

- `www.broadscene.ai` -> `ai-api`（`3346`）
- `api.broadscene.ai` -> `website`（`3347`）

对应配置见 [default.conf](default.conf)。

应用到服务器（Nginx 在容器内运行）：

```bash
cd /home/admin/nginx-proxy
# 将本仓库的 default.conf 同步到 nginx-proxy/conf.d/default.conf
sudo docker exec nginx-proxy nginx -t
sudo docker exec nginx-proxy nginx -s reload
```

说明：

- 测试阶段 `api.broadscene.ai` 会先复用 `www.broadscene.ai` 证书路径，避免因为 `api` 证书不存在导致 Nginx 启动失败。
- 如果浏览器提示证书域名不匹配，可先签发包含 `api.broadscene.ai` 的证书。

签发 `api.broadscene.ai` 证书（建议在 `nginx-proxy` 目录执行）：

```bash
cd /home/admin/nginx-proxy
sudo docker run --rm \
	-v "$PWD/ssl:/etc/letsencrypt" \
	-v "$PWD/html:/var/www/certbot" \
	certbot/certbot certonly --webroot -w /var/www/certbot \
	-d api.broadscene.ai
```

测试通过后反转域名时，只需在 `default.conf` 中互换两个 HTTPS `server` 的 `proxy_pass`：

- `www.broadscene.ai` 改为 `http://host.docker.internal:3347`
- `api.broadscene.ai` 改为 `http://host.docker.internal:3346`

应用配置：

```bash
cd /home/admin/nginx-proxy
sudo docker exec nginx-proxy nginx -t
sudo docker exec nginx-proxy nginx -s reload
```
