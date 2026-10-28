# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# URL da API embutida no build (Vite lê VITE_* em tempo de build).
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
# Ambiente (APP_ENV: dev, homolog, prod) e versão (arquivo VERSION) aparecem no selo da tela
# e em /version.json, que o deploy usa para confirmar a versão publicada.
ARG APP_ENV=dev
RUN VITE_APP_ENV="$APP_ENV" VITE_APP_VERSION="$(cat VERSION)" npm run build \
    && printf '{"env":"%s","version":"%s","label":"%s-%s"}' "$APP_ENV" "$(cat VERSION)" "$APP_ENV" "$(cat VERSION)" > dist/version.json

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
