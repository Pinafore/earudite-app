FROM ubuntu:18.04

RUN DEBIAN_FRONTEND=noninteractive && \
	apt-get update && \
	apt-get install -y \
		gcc g++ gfortran \
		libc++-dev \
		libstdc++-6-dev zlib1g-dev \
		automake autoconf libtool \
		git subversion \
		libatlas3-base \
		nvidia-cuda-dev \
		ffmpeg \
		python3 python3-dev python3-pip \
		python python-dev python-pip \
		wget unzip && \
	apt-get clean

COPY gentle /gentle
WORKDIR /gentle/ext

ARG OPENFST_VERSION=1.6.7
RUN wget http://www.openfst.org/twiki/pub/FST/FstDownload/openfst-${OPENFST_VERSION}.tar.gz
RUN tar -xvf openfst-${OPENFST_VERSION}.tar.gz -C /
RUN mkdir -p /openfst-deb
#
WORKDIR /openfst-${OPENFST_VERSION}
RUN ./configure \
        --enable-static=yes \
        --enable-shared=no \
        --with-pic=yes \
        --enable-far \
        --enable-python


RUN make
RUN make install

RUN apt-get install sox -y
RUN /gentle/ext/kaldi/tools/extras/install_mkl.sh

RUN export MAKEFLAGS=' -j8' &&  cd /gentle/ext && \
	./install_kaldi.sh && \
	make depend && make && rm -rf kaldi *.o







#ADD . /gentle
WORKDIR /gentle
RUN pip3 install twisted
RUN python3 setup.py develop
RUN mkdir /SOURCE
COPY . /SOURCE
WORKDIR /SOURCE
RUN pip3 install numpy==1.16.6


RUN apt install llvm-10 llvm-10-dev llvm-10-tools -y
RUN ln -sf /usr/bin/llvm-config-10 /usr/bin/llvm-config
#RUN apt-get install llvm-6.0 llvm-6.0-dev -y
RUN pip3 install llvmlite
RUN pip3 install numba
RUN pip3 install -r requirements.txt

COPY ../secrets .
EXPOSE 5110

CMD ["python3", "server.py"]
#VOLUME /gentle/webdata

#CMD cd /gentle && python3 serve.py
