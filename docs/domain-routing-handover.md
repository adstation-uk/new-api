# 域名与前端容器拆分交接文档

更新时间：2026-03-11

## 1. 背景与目标

本次调整的核心目标有两个：

1. 保持 `admin` 前端继续随后端镜像一起发布，兼容原来 `web` 的一体化打包模式。
2. 将 `website` 拆分为独立容器，并使用宿主机目录挂载，避免每次改动网站都要重打后端镜像。

域名层面采用“先灰度后切换”的策略，避免一次性切换带来中断风险：

- 测试阶段：`www.broadscene.ai` 保持旧链路（ai-api），`api.broadscene.ai` 临时指向 website。
- 验证通过后：再反转两个域名的转发目标。

## 2. 已完成改动

### 2.1 构建与容器

- 后端 Docker 构建前端源从 `web` 切换为 `admin`，构建产物复制到 `admin/dist`。
- Go 路由静态目录与当前 embed 路径对齐，统一使用 `admin/dist`。
- 新增 `website` 容器：
  - 镜像：`node:20-alpine`
  - 端口：`3347:3000`
  - 代码来源：宿主机挂载 `./website`
  - 运行方式：容器启动时执行 `pnpm install`、`pnpm build`、`pnpm start`
- `website` 的 API 重写目标改为可配置环境变量 `WEBSITE_API_BASE`（容器内默认指向 `http://ai-api:3000`）。

涉及文件：

- [Dockerfile](Dockerfile)
- [router/web-router.go](router/web-router.go)
- [docker-compose.yml](docker-compose.yml)
- [website/next.config.ts](website/next.config.ts)
- [.dockerignore](.dockerignore)

### 2.2 反向代理与证书策略

- 已支持双域名 `www.broadscene.ai` 与 `api.broadscene.ai` 的 80/443 配置。
- 灰度阶段路由：
  - `www` -> `3346`（ai-api）
  - `api` -> `3347`（website）
- 为避免 `api` 证书尚未签发导致 Nginx 启动失败，当前 `api` 先复用 `www` 证书路径（临时策略）。

涉及文件：

- [default.conf](default.conf)

### 2.3 运维文档

- README 已补充网站独立更新流程与灰度切换说明。
- README 中 Nginx 应用命令已改为容器内执行（适配 nginx-proxy 容器部署）。

涉及文件：

- [README.md](README.md)
- [服务器环境.md](服务器环境.md)

## 3. 当前状态（可直接上线测试）

- 后端与 `admin`：一体化镜像发布路径可用。
- `website`：已独立容器化，可通过更新宿主机目录后重启容器完成发布。
- 域名：已具备灰度配置能力，不影响现有 `www` 主流程。

## 4. 还需要做什么

### 4.1 灰度测试期

1. 按当前灰度配置观察 `api.broadscene.ai` 的页面与 API 转发是否稳定。
2. 检查 website 的构建耗时与重启耗时是否可接受。
3. 验证 Nginx 日志中是否存在 502/证书警告。

### 4.2 证书完善

1. 为 `api.broadscene.ai` 单独签发证书。
2. 签发后将 `default.conf` 中 `api` 的证书路径改回 `api` 专属路径。
3. 执行容器内配置检测并 reload。

### 4.3 正式反转域名

当灰度验证通过后执行：

1. 将 `www.broadscene.ai` 的 `proxy_pass` 改为 `3347`（website）。
2. 将 `api.broadscene.ai` 的 `proxy_pass` 改为 `3346`（ai-api）。
3. reload Nginx 后进行回归：
   - `www` 首页可访问
   - `www` 页面内请求能正确到 `ai-api`
   - `api` 的原有接口行为无回归

## 5. 推荐执行命令（服务器）

以下命令适用于文档中描述的 `nginx-proxy` 容器化环境：

```bash
cd /home/admin/nginx-proxy
sudo docker exec nginx-proxy nginx -t
sudo docker exec nginx-proxy nginx -s reload
```

website 更新（无需重打后端镜像）：

```bash
cd /home/admin/ai-api
sudo docker compose restart website
```

## 6. 风险与注意事项

- `api` 复用 `www` 证书仅用于过渡期，浏览器可能提示域名不匹配，正式阶段应切换到 `api` 独立证书。
- `website` 当前容器启动会执行安装与构建，首次启动可能较慢；如后续发布频率高，可考虑拆分为“预构建产物 + 纯运行”模式。
- 修改反向代理时，先 `nginx -t` 再 reload，避免配置错误导致服务中断。

## 7. 后续改造建议（可选）

1. 为 `website` 增加健康检查接口并在反向代理层加失败重试策略。
2. 把 `website` 的构建和运行拆成两步（CI 产物化），降低线上重启耗时。
3. 增加域名切换的回滚脚本，减少手动操作风险。
