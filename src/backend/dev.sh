docker build -f Dockerfile -t kvasbo/makemegod-backend .
docker stop makemegod-backend
docker rm makemegod-backend
docker run -d -t -p 666:80 -v /Users/kvasbo/Git/Make_Me_God/src/backend/service:/makemegod/service --name makemegod-backend kvasbo/makemegod-backend:latest