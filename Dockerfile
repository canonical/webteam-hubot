# syntax=docker/dockerfile:experimental

# Build stage: Install yarn dependencies
# ===
FROM node:lts-slim AS yarn-dependencies

WORKDIR /srv

ADD package.json .
ADD yarn.lock .

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install

# Build the production image
# ===
FROM ubuntu:hirsute

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv
RUN apt-get update && apt-get install nodejs --yes

# Import code, build assets and mirror list
ADD . .
RUN rm -rf package.json yarn.lock .babelrc webpack.config.js Gemfile Gemfile.lock nginx.conf
COPY --from=yarn-dependencies srv/node_modules node_modules/

ARG BUILD_ID
ENTRYPOINT ["bin/hubot", "-a", "matteruser"]

CMD ["0.0.0.0:80"]
