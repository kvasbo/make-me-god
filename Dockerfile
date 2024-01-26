# Use the Node.js LTS version as the base image
FROM node:lts

# Install TeX Live and other necessary packages
RUN apt-get update && apt-get install -y texlive && \
    yarn global add npx

# Set the working directory
WORKDIR /makemegod

# Copy all files to the container
COPY . /makemegod

# Create necessary directories
RUN mkdir -p /makemegod/bibles /makemegod/tmp && \
    # Install project dependencies
    yarn && \
    # Build TypeScript project
    npx tsc --build tsconfig.json

# Set the command to start the node server
CMD [ "node", "/makemegod/dist/index.js" ]

# Expose port 80
EXPOSE 80