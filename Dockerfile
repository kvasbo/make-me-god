# docker build -t kvasbo/makemegod:latest .
FROM node:lts
# MAINTAINER Audun Kvasbø <audun@kvasbo.no>

RUN apt-get update && apt-get install -y \
	texlive \
  curl \
  sudo \
  nano

RUN yarn global add npx

RUN mkdir -p /makemegod
WORKDIR /makemegod

COPY . /makemegod

# Create work folder and copy files

RUN mkdir -p /makemegod/bibles
RUN mkdir -p /makemegod/tmp
# RUN mkdir -p /makemegod/frontend

RUN yarn

RUN npx tsc --build tsconfig.json

RUN cp ./dist/index.js .

CMD [ "node", "index.js" ]

EXPOSE 8080
