FROM node:24-slim

RUN apt update && apt install python3 -y

RUN useradd -m runner

WORKDIR /home/runner

COPY . .

USER runner

CMD ["python3", "/home/runner/run.py"]
# CMD ["node", "/home/runner/current.js"]