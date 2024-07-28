from flask import Flask, request, jsonify
import wave
app = Flask(__name__)

import subprocess

import shutil

import sys
container_string = ''

from pydub import AudioSegment
from pydub.utils import mediainfo

def convert_webm_to_wav(input_file, output_file):
    try:
        # Load the WebM file using pydub
        audio = AudioSegment.from_file(input_file)

        # Check the audio file format and codec
        input_format = mediainfo(input_file)['codec_name']

        # Ensure input file is WebM format
        if input_format != 'opus':
            raise ValueError("Input file must be in WebM (opus) format")

        # Export audio to WAV format
        audio.export(output_file, format="wav")

        print(f"Conversion completed: {output_file}")
    except Exception as e:
        print(f"An error occurred: {e}")



#if len(sys.argv) > 1:
#    container_string = sys.argv[1]
#    print("Container String:", container_string)
#else:
#    print("Usage: python3 app.py <docker-container-id>")


@app.route('/getConfidence/<ground_truth>', methods=['POST'])
def get_confidence(ground_truth):
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save('client_sound.wav')

    
        convert_webm_to_wav('client_sound.wav', 'output.wav')

        ground_truth = request.json['ground_truth'].upper()
        shutil.copyfile('output.wav', 'client_sound.wav')

        #cmd_dbg_make = f'docker exec -it -w /opt/kaldi/egs/wsj/s5 {container_string} /bin/bash /opt/kaldi/egs/wsj/s5/make_forced.sh'
        #res_dbg_make = subprocess.run(cmd_dbg_make, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        #print(res_dbg_make.stdout)
        
        #cmd_run = f'sudo docker exec -it -w /opt/kaldi/egs/wsj/s5 {container_string} /bin/bash /opt/kaldi/egs/wsj/s5/forced_single.sh "{ground_truth}"'
        
        cmd_run = f'/opt/kaldi/egs/wsj/s5/forced_single.sh "{ground_truth}"'
        res_run = subprocess.run(cmd_run, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print(res_run.stdout)

        cmd_get_output = f'cat /opt/kaldi/egs/wsj/s5/out.txt'
        res_get_output = subprocess.run(cmd_get_output, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print(res_get_output.stdout)


        return str(res_get_output.stdout), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
