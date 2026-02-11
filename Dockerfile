## WIP ##


FROM ubuntu:24.04






RUN apt update
RUN apt install xz-utils wget curl mariadb-server -y
RUN wget https://nodejs.org/dist/v24.12.0/node-v24.12.0-linux-x64.tar.xz
RUN tar -xvf node-v24.12.0-linux-x64.tar.xz
RUN cp -r node-v24.12.0-linux-x64/share /usr/
RUN cp -r node-v24.12.0-linux-x64/lib /usr/
RUN cp -r node-v24.12.0-linux-x64/include /usr/
RUN cp -r node-v24.12.0-linux-x64/bin /usr/


RUN curl -fsSL https://get.docker.com -o get-docker.sh
RUN sh ./get-docker.sh --dry-run


RUN mysql -e ""
RUN mysql -e "source db/main.sql"


WORKDIR /assaig/

COPY . .




RUN npm i

CMD ["node", "server.js"]