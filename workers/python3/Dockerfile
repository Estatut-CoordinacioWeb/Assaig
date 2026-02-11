FROM python:3.12-slim

RUN useradd -m runner

WORKDIR /home/runner

COPY . .

USER runner

CMD ["python3", "/home/runner/run.py"]