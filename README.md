## Build

生成

```bash
docker build . -t ai-api:17  --platform linux/amd64
```

导出

```bash
docker save ai-api:17 -o ai-api:17.tar
```

删除本地镜像

```bash
docker rmi ai-api:17
```

## 服务器

```bash
cd /home/admin/ai-api
```

上传镜像文件到服务器

```bash
sudo docker load -i ai-api:17.tar
```

**修改 docker-compose.yml 中 版本**

```bash
sudo docker compose up -d
```
