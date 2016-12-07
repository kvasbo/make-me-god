#docker build -t kvasbo/makemegod:latest .
FROM php:latest
MAINTAINER Audun Kvasbø <audun@kvasbo.no>

#Latex and update
RUN apt-get update && apt-get install texlive-full -y

#Node
#RUN apt-get install -y nodejs npm
#fucking debian installs `node` as `nodejs`
#RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

#Lag arbeidskatalog
RUN mkdir /var/makemegod
WORKDIR /var/makemegod
COPY ./src/ /var/makemegod/src

VOLUME /var/makemegod

EXPOSE 80