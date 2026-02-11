FROM amazoncorretto:17-alpine

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

WORKDIR /home/runner

COPY . .

CMD ["python3", "/home/runner/run.py"]