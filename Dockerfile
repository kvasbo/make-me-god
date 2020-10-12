# docker build -t kvasbo/makemegod:latest .
FROM node:lts
# MAINTAINER Audun Kvasbø <audun@kvasbo.no>

RUN apt-get update && apt-get install -y \
	texlive \
  curl \
  sudo \
  nano

# Create work folder and copy files
RUN mkdir -p /makemegod
RUN mkdir -p /makemegod/bibles
RUN mkdir -p /makemegod/workfiles
RUN chmod 777 /makemegod
RUN chmod 777 /makemegod/bibles
RUN chmod 777 /makemegod/workfiles

COPY ./templates /makemegod/templates/

COPY ./package.json /makemegod
COPY ./yarn.lock /makemegod
COPY ./dist/* /makemegod/

WORKDIR /makemegod

RUN yarn

CMD [ "node", "index.js" ]

EXPOSE 8080