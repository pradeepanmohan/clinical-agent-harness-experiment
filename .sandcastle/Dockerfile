FROM node:22-bookworm

ARG AGENT_UID=1000
ARG AGENT_GID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates openssh-client \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
  && npm install -g @anthropic-ai/claude-code

# Claude Code writes session state under /home/agent/.claude even when HOME is
# overridden. Make that path writable for arbitrary GitHub Actions UID/GID users
# so Bash/tool execution and Sandcastle session capture both work.
RUN mkdir -p /home/agent/.claude /tmp/agent-home \
  && chmod -R 0777 /home/agent /tmp/agent-home

ENV HOME=/tmp/agent-home
ENV GIT_CONFIG_GLOBAL=/tmp/agent-home/.gitconfig
USER ${AGENT_UID}:${AGENT_GID}
WORKDIR /workspace

# Sandcastle starts the container, then executes commands inside it. Keep the
# sandbox alive for docker exec.
ENTRYPOINT ["sleep", "infinity"]
