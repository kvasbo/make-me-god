#!/bin/bash
# My example bash script

docker stop makemegod
docker rm makemegod
docker run -d -P -p 666:80 --name makemegod -v src:/var/makemegod kvasbo/makemegod:latest tail -f /dev/null