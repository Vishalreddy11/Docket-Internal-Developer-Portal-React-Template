# syntax=docker/dockerfile:1
#
# Multi-stage build:
#   1. Node builds the SPA to /dist (a folder of static files).
#   2. Nginx serves those static files.
#
# The runtime image has NO Node.js — smaller attack surface, no Node CVEs
# to patch, one less thing to keep updated.

# ---- build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /src

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --ignore-scripts --frozen-lockfile || pnpm install --ignore-scripts

COPY . .
RUN pnpm run build

# ---- runtime stage ----
FROM nginx:1.27-alpine AS runtime

# Non-root user for the nginx worker processes.
RUN adduser -S -u 65532 -G nginx docket

# Custom nginx config: CSP + gzip + SPA routing + runtime-config.
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /src/dist /usr/share/nginx/html
# Runtime config lives at /config/runtime-config.json — mounted into the
# container per-environment by K8s ConfigMap. See k8s/10-config.yaml.

EXPOSE 8080

# nginx runs as PID 1 in foreground.
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
