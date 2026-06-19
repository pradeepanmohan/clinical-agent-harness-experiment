FROM node:22-bookworm

ARG AGENT_UID=1000
ARG AGENT_GID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates openssh-client \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
  && npm install -g @anthropic-ai/claude-code

# Sandcastle runs containers as the host runner's numeric UID/GID. On GitHub
# Actions those IDs may not have a passwd entry, and a baked /home/<user>
# can be unwritable if UID/GID assumptions drift. Use a world-writable runtime
# home/config location so Sandcastle's startup `git config --global` works for
# any numeric runner user.
RUN mkdir -p /tmp/agent-home \
  && chmod 0777 /tmp/agent-home

ENV HOME=/tmp/agent-home
ENV GIT_CONFIG_GLOBAL=/tmp/agent-home/.gitconfig
USER ${AGENT_UID}:${AGENT_GID}
WORKDIR /workspace
