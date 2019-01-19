# docker build -t kvasbo/makemegod:latest .
FROM node:8
MAINTAINER Audun Kvasbø <audun@kvasbo.no>

RUN apt-get update
RUN apt-get install -y \
	texlive \
  curl \
  sudo \
  nano

# Create work folder and copy files
RUN mkdir -p /makemegod
RUN mkdir -p /makemegod/bibles
RUN mkdir -p /makemegod/service
RUN mkdir -p /makemegod/workfiles
RUN chmod 777 /makemegod/bibles
RUN chmod 777 /makemegod/service
RUN chmod 777 /makemegod/workfiles

COPY ./templates /makemegod/templates
COPY ./service /makemegod/service/

WORKDIR /makemegod/service
CMD [ "node", "index.js" ]

EXPOSE 8080