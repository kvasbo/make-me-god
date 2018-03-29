# docker build -t kvasbo/makemegod:latest .
FROM php:7.0-apache
MAINTAINER Audun Kvasbø <audun@kvasbo.no>

#Latex and update
RUN apt-get update && apt-get install -y \
	texlive \
  curl

#Lag arbeidskatalog
# WORKDIR /var/makemegod
COPY ./src/ /var/www/html

RUN mkdir -p /var/www/html/bibles
RUN mkdir -p /var/www/html/workfiles

RUN chmod 777 /var/www/html/workfiles

# RUN service apache2 start

EXPOSE 80