FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get -y install git

RUN curl -fsSL https://dprint.dev/install.sh | DPRINT_INSTALL="/usr/local" sh
RUN which dprint

USER node
WORKDIR /code

RUN mkdir .pnpm-store
RUN mkdir node_modules
RUN mkdir tmp

COPY package.json package-lock.json ./
RUN npm ci
