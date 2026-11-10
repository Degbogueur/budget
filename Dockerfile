# ---------- 1. Build the React front end ----------
FROM node:24-alpine AS web
WORKDIR /web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ---------- 2. Build the .NET API ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api
WORKDIR /src
COPY src/Budget.Api/Budget.Api.csproj src/Budget.Api/
RUN dotnet restore src/Budget.Api/Budget.Api.csproj
COPY src/ src/
RUN dotnet publish src/Budget.Api/Budget.Api.csproj -c Release -o /app --no-restore

# ---------- 3. Final image (runtime only) ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=api /app ./
COPY --from=web /web/dist ./wwwroot
ENV ASPNETCORE_HTTP_PORTS=8080 \
    ConnectionStrings__BudgetDb="Data Source=/data/budget.db"
EXPOSE 8080
USER app
ENTRYPOINT ["dotnet", "Budget.Api.dll"]