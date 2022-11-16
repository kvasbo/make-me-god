FROM node:lts

RUN apt-get update && apt-get install -y \
	texlive

RUN yarn global add npx

RUN mkdir -p /makemegod
WORKDIR /makemegod

COPY . /makemegod

# Create work folder and copy files
RUN mkdir -p /makemegod/bibles
RUN mkdir -p /makemegod/tmp

# Install stuff
RUN yarn

# Build typescript
RUN npx tsc --build tsconfig.json

# Copy main file to root due to lazyness
RUN cp ./dist/index.js .

CMD [ "node", "index.js" ]

EXPOSE 80
