
Docker build and run

E.g.: docker build . --progress=plain --no-cache  -t stores-service:latest

docker build . --progress=plain --no-cache -t inventory-service:latest

docker build . -f inventory-service/Dockerfile --build-arg --progress=plain --no-cache -t inventory-service:latest

docker run -p 3000:3000 inventory-service:latest

Running Locally with debugger enabled:

docker-compose -f docker-debug-compose.yml build
docker-compose -f docker-debug-compose.yml up


stop all containers:
docker kill $(docker ps -q)

remove all containers
docker rm $(docker ps -a -q)

remove all docker images
docker rmi $(docker images -q)

@arkka
arkka commented on Aug 12, 20163
remove all docker volumes
docker volume ls -qf dangling=true | xargs -r docker volume rm