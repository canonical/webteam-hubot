FROM ubuntu:bionic

# System dependencies
RUN apt-get update && \
    apt-get install libicu-dev nodejs npm git --yes

# Import code, install code dependencies
WORKDIR /srv
ADD . .

RUN npm install

# Setup commands to run server
ENTRYPOINT ["bin/hubot", "-a", "irc"]

CMD ["0.0.0.0:8080"]