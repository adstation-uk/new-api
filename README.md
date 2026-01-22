# Build

生成

```bash
docker build . -t ai-api:14  --platform linux/amd64
```

导出

```bash
docker save ai-api:14 -o ai-api:14.tar
```

删除本地镜像

```bash
docker rmi ai-api:14
```
