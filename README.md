# Build

生成

```bash
docker build . -t ai-api:1  --platform linux/amd64
```

导出

```bash
docker save ai-api:1 -o ai-api.tar
```

删除本地镜像

```bash
docker rmi ai-api:1
```
