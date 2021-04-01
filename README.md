## Docker image
```bash
# multi-platform build with buildx
docker buildx build \
--platform=linux/amd64,linux/arm/v7,linux/arm64 \
--output "type=image,push=false" \
-t sykkro/serve-favicons:dev .
```