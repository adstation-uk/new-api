## Build

生成

```bash
docker build . -t ai-api:18  --platform linux/amd64
```

导出

```bash
docker save ai-api:18 -o ai-api:18.tar
```

删除本地镜像

```bash
docker rmi ai-api:18
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
sudo docker load -i ai-api:18.tar
```

**修改 docker-compose.yml 中 版本**

```bash
sudo docker compose up -d
```

## Website 更新（无需重打后端镜像）

将最新网站代码同步到服务器的 `./website` 目录后执行：

```bash
sudo docker compose restart website
```

如依赖有变化，建议执行：

```bash
sudo docker compose up -d website
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
