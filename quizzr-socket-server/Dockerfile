FROM ubuntu:22.04


# Update packages and install necessary dependencies
RUN apt-get update \
    && apt-get install -y \
	libffi-dev \
        python3.10 \
        python3.10-dev \
        python3.10-distutils \
        python3.10-venv \
        python3-pip \
        curl \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*
#tensorflow/tensorflow 
RUN apt update -y && apt upgrade -y
RUN apt install ffmpeg -y 
RUN python3 -m pip install pydub
COPY ./ ./
RUN python3 -m pip install -r requirements.txt
COPY ../secrets /secrets
EXPOSE 6571
RUN mkdir answer-audios
CMD ["python3" , "main.py"]
