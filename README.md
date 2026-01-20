# Build

生成

```bash
docker build . -t ai-api:11  --platform linux/amd64
```

导出

```bash
docker save ai-api:11 -o ai-api:11.tar
```

删除本地镜像

```bash
docker rmi ai-api:11
```
