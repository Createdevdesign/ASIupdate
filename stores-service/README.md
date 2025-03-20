
Docker build and run

E.g.: docker build . --progress=plain --no-cache  -t stores-service:latest

docker build . --progress=plain --no-cache -t stores-service:latest

docker build . -f stores-service/Dockerfile --build-arg --progress=plain --no-cache -t stores-service:latest

docker run -p 3000:3000 stores-service:latest

Running Locally with debugger enabled:

docker-compose -f docker-debug-compose.yml build
docker-compose -f docker-debug-compose.yml up


