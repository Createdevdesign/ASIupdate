
Development mode:

1. sudo npm i -g ts-node-dev
2. npm i (On node-common)
3. npm i
4. npm run serve


Docker build and run:

E.g.: docker build . --build-arg AZURE_NPM_FEED_TOKEN=<PAT> --progress=plain --no-cache  -t inventory-service:latest

docker build . --build-arg AZURE_NPM_FEED_TOKEN=ZzRzNHFnemN0eHN1NWJ2NDMzeTVia2d4NjJ1b3VjNnhmN3pnaWtkbXZlbGd1aTM1dmFxcQ== --progress=plain --no-cache -t inventory-service:latest


docker build . -f payment-service/Dockerfile --build-arg --progress=plain --no-cache -t payment-service:latest

docker run -p 3000:3000 payment-service:latest

Running Locally with debugger enabled:

docker-compose -f docker-debug-compose.yml build --build-arg AZURE_NPM_FEED_TOKEN=<PAT>
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