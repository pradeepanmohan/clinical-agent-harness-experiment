FROM node:22-bookworm

ARG AGENT_UID=1000
ARG AGENT_GID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates openssh-client \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
  && npm install -g @anthropic-ai/claude-code

RUN mkdir -p /home/agent \
  && chown -R ${AGENT_UID}:${AGENT_GID} /home/agent

ENV HOME=/home/agent
USER ${AGENT_UID}:${AGENT_GID}
WORKDIR /workspace

RUN git config --global --add safe.directory '*'
