FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm

ENV IS_CONTAINER=Yes
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get -y install git
RUN apt-get -y install chromium

RUN curl -fsSL https://dprint.dev/install.sh | DPRINT_INSTALL="/usr/local" sh
RUN which dprint

COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /usr/local/bin/
RUN which uv
RUN which uvx

# doing this here takes advantage of docker layer caching
# rather than as the onCreateCommand in devcontainer.json
RUN sudo -u node uv python install 3.12.12
RUN sudo -u node uv run python --version

# Install pnpm globally
RUN npm install -g pnpm

USER node
WORKDIR /code
# RUN chown node:node /code

# make sure these are owned by node
RUN mkdir tmp
RUN mkdir var
RUN mkdir node_modules
RUN mkdir .pnpm-store

COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml* ./

# Copy workspace package.json files so all dependencies get pre-installed
# We copy the entire packages dir then remove everything except package.json files
COPY --chown=node:node packages packages
RUN find packages -type f ! -name "package.json" -delete && \
    find packages -type d -empty -delete

RUN pnpm install --frozen-lockfile --force || pnpm install --force
