FROM mcr.microsoft.com/dotnet/aspnet:6.0-bullseye-slim AS base
WORKDIR /app
EXPOSE 3000

ENV ASPNETCORE_URLS=http://+:3000

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:6.0-bullseye-slim AS build
WORKDIR /src
COPY ["order-placement-service/order-placement-service.csproj", "order-placement-service/"]
RUN dotnet restore "order-placement-service/order-placement-service.csproj"
COPY . .
WORKDIR "/src/order-placement-service"
RUN dotnet build "order-placement-service.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "order-placement-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "order-placement-service.dll"]
