# docker build -t kvasbo/makemegod:latest .
FROM kvasbo/makemegod-base
MAINTAINER Audun Kvasbø <audun@kvasbo.no>

#Lag arbeidskatalog
# WORKDIR /var/makemegod
COPY . /var/www/html

RUN mkdir -p /var/www/html/bibles
RUN mkdir -p /var/www/html/workfiles

RUN chmod 777 /var/www/html/workfiles
RUN chmod 777 /var/www/html/bibles

# RUN service apache2 start

EXPOSE 80