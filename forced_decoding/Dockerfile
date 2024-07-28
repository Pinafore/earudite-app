FROM ubuntu-kaldistage 

RUN apt update -y
RUN apt install python3-pip -y

RUN pip3 install Flask
RUN pip3 install pydub

COPY app.py .


RUN chmod 777 /opt/kaldi/egs/wsj/s5/forced_single.sh

CMD ["python3", "app.py"]
#RUN ./stage.sh
#RUN ./make_forced.sh
#RUN ./setup_speech.sh

#CMD /bin/bash
