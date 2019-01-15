# docker build -t kvasbo/makemegod:latest .
FROM php:7.3.1-apache
MAINTAINER Audun Kvasbø <audun@kvasbo.no>

#Latex and update
RUN apt-get update
RUN apt-get install -y \
	texlive \
  curl