# Extract package.json files for dependency layer caching
FROM busybox AS pnpm-workspace
WORKDIR /code
COPY packages ./packages
RUN find . -type f ! -name "package.json" -delete && \
    find . -type d -empty -delete
COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Extract pyproject.toml files for dependency layer caching
FROM busybox AS uv-workspace
WORKDIR /code
COPY packages ./packages
RUN find . -type f ! -name "pyproject.toml" -delete && \
    find . -type d -empty -delete
COPY pyproject.toml uv.lock ./

# Main build
FROM ghcr.io/xtruder/nix-devcontainer:v1

ENV IS_CONTAINER=Yes
ENV DEBIAN_FRONTEND=noninteractive

USER root

# because trixie is stable now
RUN sed --in-place 's/stable/bookworm/g' /etc/apt/sources.list.d/*.sources

RUN apt-get update
RUN apt-get --yes install git
RUN apt-get --yes install chromium
RUN apt-get --yes install curl
RUN apt-get --yes install unzip

RUN curl --fail --silent --show-error --location https://dprint.dev/install.sh | DPRINT_INSTALL="/usr/local" sh
RUN which dprint

USER code
WORKDIR /code

COPY --chown=${USERNAME}:${USERNAME} flake.nix flake.lock .envrc ./

RUN nix develop --command true

# make sure these are owned by current user
RUN mkdir tmp
RUN mkdir var
RUN mkdir node_modules
RUN mkdir .pnpm-store
RUN mkdir .venv

COPY --from=uv-workspace --chown=${USERNAME}:${USERNAME} /code ./
RUN nix develop --command uv sync --frozen

COPY --from=pnpm-workspace --chown=${USERNAME}:${USERNAME} /code ./
RUN nix develop --command pnpm install --frozen-lockfile --force
