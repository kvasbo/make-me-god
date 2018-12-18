#!/bin/bash
bash ./buildDocker.sh
docker stop makemegod
docker rm makemegod
# docker run -d -P -p 666:80 --name makemegod -v src:/var/make_me_god registry.gitlab.com/kvasbo/make_me_god:latest tail -f /dev/null
# docker run -d -p 80:80 registry.gitlab.com/kvasbo/make_me_god:latest nginx -g 'daemon off;'
 docker run -d -p 666:80 --name makemegod kvasbo/make_me_god:latest