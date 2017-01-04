# docker build -t kvasbo/makemegod:latest .
FROM ubuntu:latest
MAINTAINER Audun Kvasbø <audun@kvasbo.no>

#Latex and update
RUN apt-get update && apt-get install -y \
	apache2 \ 
	libapache2-mod-php \
	php \
	php-mcrypt \
	php-mysql \
	texlive-full

RUN apt-get install -y curl

#Lag arbeidskatalog
RUN mkdir /var/makemegod
WORKDIR /var/makemegod
COPY ./src/ /var/makemegod/src

VOLUME makemegod:/var/makemegod

RUN service apache2 start

EXPOSE 80