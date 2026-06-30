# reservoir frontend
## Quick Start (Docker)

```
docker build --build-arg VITE_API_URL="https://backend-app-1:8000/api/v1" -t frontend-app .
docker run -d   -p 80:80   --name frontend-prod   --restart unless-stopped   --network backend_default   -e API_BASE_URL="http://backend-app-1:8000/api/v1"   frontend-app
```

