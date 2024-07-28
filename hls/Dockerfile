FROM ubuntu:22.04
RUN mkdir /SOURCE
WORKDIR /SOURCE
COPY . /SOURCE
RUN apt update -y && apt upgrade -y
RUN apt install ffmpeg -y
RUN apt install golang-go -y
RUN apt-get update
RUN apt-get install -y ca-certificates
RUN update-ca-certificates
CMD ["go", "run", ".", "serve", "--config", "hls.yaml"]
