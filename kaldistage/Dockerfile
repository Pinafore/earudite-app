FROM docker.io/kaldiasr/kaldi


WORKDIR egs/wsj/s5/


#COPY ./server /opt/kaldi/egs/wsj/s5/forced_vit
COPY . /opt/kaldi/egs/wsj/s5/forced_vit
RUN cp -r forced_vit/* .


RUN ./stage.sh
RUN ./make_forced.sh
RUN ./setup_speech.sh



CMD ["/bin/bash"]
#RUN ./stage.sh
#RUN ./make_forced.sh
#RUN ./setup_speech.sh

#CMD /bin/bash
