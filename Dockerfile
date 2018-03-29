# docker build -t kvasbo/makemegod:latest .
FROM php:7.0-apache
MAINTAINER Audun Kvasbø <audun@kvasbo.no>

#Latex and update
RUN apt-get update && apt-get install -y \
	texlive-full \
  curl

#Lag arbeidskatalog
RUN mkdir /var/makemegod
WORKDIR /var/makemegod
COPY ./src/ /var/makemegod/src

VOLUME makemegod:/var/makemegod

RUN service apache2 start

EXPOSE 80