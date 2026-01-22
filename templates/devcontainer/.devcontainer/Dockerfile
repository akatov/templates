# Extract package.json files for dependency layer caching
FROM busybox AS pnpm-workspace
WORKDIR /code
COPY packages ./packages
RUN find . -type f ! -name "package.json" -delete && \
    find . -type d -empty -delete
COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Stage 2: Main build
FROM ghcr.io/xtruder/nix-devcontainer:v1

ENV IS_CONTAINER=Yes
ENV DEBIAN_FRONTEND=noninteractive

USER root

# because trixie is stable now
RUN sed -i 's/stable/bookworm/g' /etc/apt/sources.list.d/*.sources

# FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm

RUN apt-get update
RUN apt-get -y install git
RUN apt-get -y install chromium
RUN apt-get -y install curl
RUN apt-get -y install unzip

RUN curl -fsSL https://dprint.dev/install.sh | DPRINT_INSTALL="/usr/local" sh
RUN which dprint

COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /usr/local/bin/
RUN which uv
RUN which uvx

# # doing this here takes advantage of docker layer caching
# # rather than as the onCreateCommand in devcontainer.json
RUN sudo -u code uv python install 3.12.12
RUN sudo -u code uv run python --version

# # Install pnpm globally
# RUN npm install -g pnpm

USER code
WORKDIR /code
# # RUN chown node:node /code

COPY --chown=${USERNAME}:${USERNAME} flake.nix flake.lock .envrc ./

RUN nix develop --command true

# make sure these are owned by current user
RUN mkdir tmp
RUN mkdir var
RUN mkdir node_modules
RUN mkdir .pnpm-store

# Copy only workspace package.json files from filtered stage (better layer caching)
COPY --from=pnpm-workspace --chown=code:code /code ./

# change this
RUN nix develop --command pnpm install --frozen-lockfile --force
# RUN nix develop --command pnpm install --force
