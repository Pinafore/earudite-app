import { useState, useEffect, useRef } from "react";
import { useOnlineAnswering } from "asr-answering";
import MicOffIcon from "@material-ui/icons/MicOff";
import { useRecoilValue } from "recoil";
import { AUTHTOKEN, PROFILE, URLS, SOCKET } from "../store";
import { useAlert } from "react-alert";
import axios from "axios";
import { ProgressBar } from "react-bootstrap";
import "../pkg/StackedProgressBar.css";
import "../styles/AnswerBox.css";

function useKeyPress(targetKey, fnCall, deps, condition) {
  const [keyPressed, setKeyPressed] = useState(false);
  function downHandler({ key }) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }
  const upHandler = ({ key }) => {
    if ((key === targetKey) && condition) {
      fnCall();
      setKeyPressed(false);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);
  return keyPressed;
}

function VoiceButtonVolume(props) {
  const volumeRange = [20,80];
  return (
    <div class="answerbox-voicebutton-volume-wrapper">
      <div class="answerbox-voicebutton-volume-slider" style={{"height":((Math.min(Math.max(volumeRange[0],props.volume),volumeRange[1])-volumeRange[0])/(volumeRange[1]-volumeRange[0])*0.3+0.4).toString()+"rem"}}></div>
      <div class="answerbox-voicebutton-volume-slider" style={{"height":((Math.min(Math.max(volumeRange[0],props.volume),volumeRange[1])-volumeRange[0])/(volumeRange[1]-volumeRange[0])*1.1+0.4).toString()+"rem"}}></div>
      <div class="answerbox-voicebutton-volume-slider" style={{"height":((Math.min(Math.max(volumeRange[0],props.volume),volumeRange[1])-volumeRange[0])/(volumeRange[1]-volumeRange[0])*0.3+0.4).toString()+"rem"}}></div>
    </div>
  )
}



let recording = false;
  let audioChunks = [];

    const stream = navigator.mediaDevices.getUserMedia({ audio: true });
let mediaRecorder;// = new MediaRecorder(stream);




/*
async function handleDataAvailable(data) {
  return new Promise((resolve, reject) => {
    audioChunks.push(data);
    resolve();
  });
}




async function startRecording() {
	audioChunks = []
	mediaRecorder = new MediaRecorder(await stream);
console.log("starting recording")
    mediaRecorder.ondataavailable = async(event) => {
	    console.log("new data available");
	  await handleDataAvailable(event.data); 
	    console.log(audioChunks);
    };

    //mediaRecorder.onstop = () => {
    //  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    //  const audioUrl = URL.createObjectURL(audioBlob);
      // Send audioUrl to server (e.g., via a POST request)
    //};

    mediaRecorder.start();
    recording = true;
  }

  async function stopRecording(auth) {
	  if(!mediaRecorder || !recording) { return; }
    mediaRecorder.stop();
    recording = false;

    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
   formData.append('audio', blob);
formData.append('auth', auth);
        console.log(blob);

        const config = {
          headers: { "content-type": "multipart/form-data" },
        };

        //POST TO CLASSIFIER SERVER
        // const response = 
        await axios
          .post("http://54.226.249.112:6571/audioanswerupload", formData, config)
          .then((response) => {
            console.log(response);
            */

		  /*socket.emit("audioanswer", {
              //auth: authtoken,
              filename: response.data["filename"], // CHANGE
            });
          })
          .catch(() => {
            alert.error("Classification submission failed");
          */
//}
//);
   
     //   const response = await fetch("hhttp://54.226.249.112:6571/audioansweruploadttp://54.226.249.112:6571/audioanswerupload", {
 
    
//}



async function StartRecording(auth) {
const socket = useRecoilValue(SOCKET);
const urls = useRecoilValue(URLS);
  //const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(await stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob);
formData.append('auth', auth);
    // Reset audioChunks after processing
    audioChunks = [];

    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    // POST the recorded audio to the server
    try {
      const response = await axios.post(urls["socket"] + "/audioanswerupload", formData, config).then((response) => {
	      //alert.error(response.data["filename"]);
            socket.emit("audioanswer", {
              auth: auth,
              filename: response.data["filename"], // CHANGE
            });
          })
          .catch(() => {
            alert.error("Classification submission failed");
          });



      console.log(response);
      // Handle server response as needed
    } catch (error) {
      console.error("Classification submission failed:", error);
      // Handle error appropriately (e.g., show error message)
    }
  };

  mediaRecorder.start();
  recording = true;
}

function stopRecording() {
  //if (mediaRecorder && recording) {
    mediaRecorder.stop();
    recording = false;
  //}
}





function VoiceButton(props1) {

  function handleChange() {

	if(props1.canClassify) props1.setMode(m => ((m+1)%3));
    else props1.setMode(m => ((m+1)%2));
  } 


  if(props1.mode === 0) {
    if(recording) {
	    stopRecording();
    }
    return (
      <div class="answerbox-voicebutton-wrapper answerbox-hvr-grow" onClick={handleChange}>
        <MicOffIcon
          style={{
            color: "white",
            width: "60%",
            height: "60%",
          }}
        />
      </div>
    )
  } else if(props1.mode === 1) {
	  if(!recording) {

		  props1.buzz()
	  StartRecording(props1.auth);
	  }
    return (
      <div class="answerbox-voicebutton-wrapper answerbox-hvr-grow" style={{"background-color":"#6287F6"}} onClick={handleChange}>
        <VoiceButtonVolume volume={props1.volume}/>
      </div>
    )
  } else {
	  console.log("other");
	  //StartRecording(props1.auth)
    return;
	/*  (
      <div class="answerbox-voicebutton-wrapper answerbox-hvr-grow" style={{"background-color":"#90E99C"}} onClick={handleChange}>
        <VoiceButtonVolume volume={props1.volume}/>
      </div>
    )*/
  }
  
}



// async function initialize2(foo, foo2) {
//   await f/oo().then(() => {foo2();});
// }


// Hook for the answer box at the bottom of all games
function AnswerBox(props) {
   const [mic, setMic] = useState(false);
  const profile = useRecoilValue(PROFILE);
  const username = profile["username"];
  const urls = useRecoilValue(URLS);
  const authtoken = useRecoilValue(AUTHTOKEN);
  const alert = useAlert();
  const socket = useRecoilValue(SOCKET);
  // const [showProgressBar, setShowProgressBar] = useState(false);
  const [speechMode, setSpeechMode] = useState(0);


  // ASR always picks up the wake word, this function removes it
  function complete(answer) {
    props.setAnswer(answer.substr(answer.indexOf(" ") + 1).replace("stop", ""));
  }

  // Sets answer when typed
  function setAnswer2(event) {
    props.setAnswer(event.target.value);
  }

  const textAnswer = useRef(null);

  function buzzin() {
	  //StartRecording(props.auth);
    props.buzz();
    setTimeout(()=>{textAnswer.current.focus();}, 100);
  }

  // useEffect(()=> {
  //   console.log(props.answer);
  // },[props.answer]);

  function submit1() {
	  alert.error("submitting");
    console.log(props.answer);
    props.submit(props.answer);
    props.setAnswer("");
  }

  
     //   const response = await fetch("hhttp://54.226.249.112:6571/audioansweruploadttp://54.226.249.112:6571/audioanswerupload", {
 
    

  /*const {
    initialize,
    startListening,
    setIsReady,
    // eslint-disable-next-line
    stopListening,
    // eslint-disable-next-line
    listening,
    // eslint-disable-next-line
    recordingState: status,
    // eslint-disable-next-line
    timeLeft,
    // eslint-disable-next-line
    voiceState,
    // eslint-disable-next-line
    volumeUnused,
    // eslint-disable-next-line
    answer,
    // eslint-disable-next-line
    permissions,
    // eslint-disable-next-line
    error,
    // eslint-disable-next-line
    errormsg,
    // eslint-disable-next-line
    manager,
    // eslint-disable-next-line
    ready,
    resetForNewQuestion,
    processingAudio,
  } = useOnlineAnswering({
    audio: {
      buzzin:
        "https://assets.mixkit.co/sfx/download/mixkit-game-show-wrong-answer-buzz-950.wav",
      buzzout:
        "https://assets.mixkit.co/sfx/download/mixkit-game-show-wrong-answer-buzz-950.wav",
    },
    onAudioData: () => {},
    timeout: 6000,
    isReady: (speechMode > 0),
    onComplete: async (answer, blob) => {
      if (speechMode === 2) {
        const formdata = new FormData();
        formdata.append("audio", blob);
        formdata.append("auth", authtoken);

        console.log(blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "test.wav";
        document.body.appendChild(a);
        a.click();

        const config = {
          headers: { "content-type": "multipart/form-data" },
        };

        //POST TO CLASSIFIER SERVER
        // const response = 
        await axios
          .post(urls["socket_flask"] + "/audioanswerupload", formdata, config)
          .then((response) => {
            console.log(response);
            socket.emit("audioanswer", {
              auth: authtoken,
              filename: response.data["filename"], // CHANGE
            });
          })
          .catch(() => {
            alert.error("Classification submission failed");
          });
      } else {
        complete(answer);
      }
    },
    gameTime: 9000000,
    onBuzzin: () => buzzin(),
    ASRthreshold: 0.8,
    onSubmit: () => {
      submit1();
    }
  });*/ 

  // On question change reset ASR
  /*useEffect(() => {
    resetForNewQuestion();
    setIsReady(!(speechMode > 0));
    const readyTO = setTimeout(() => {
      setIsReady(speechMode > 0);
    }, 100);

    return () => {
      clearTimeout(readyTO);
    }
    // eslint-disable-next-line
  }, [props.question]);

   useEffect(() => {
     console.log(timeLeft, processingAudio, status, listening);
   }, [timeLeft, processingAudio, status, listening])

  // On speech mode change update if ASR is ready
  useEffect(()=> {
    setIsReady(speechMode > 0);
	  console.log("speech mode change");
    // eslint-disable-next-line
  },[speechMode]);
*/
  /*useEffect(() => {
    if(!props.state.inGame) {
      stopListening();
    }
    // eslint-disable-next-line
  }, [props.state.inGame])
*/
  // Start listening and reset stage when ready
  /*useEffect(() => {
    if(ready && !mic) {
      console.log("starting listening");
      setMic(true);
      //manager.resetStage();
      //startListening();
    }
  }, []);*/

  useEffect(() => {
    if(props.buzzer !== username) {
      props.setAnswer("");
    }
  }, [props,username])

  useEffect(()=> {
    console.log("IS LISTENING");
    //if(!mic) { 
//mic = true;
	    //setMic(true);
	    //console.log("initizlizing mic")
	    //initialize(); 
    //}
    // eslint-disable-next-line
  },[]);

  useKeyPress("Enter", submit1, [props.answer], true);
  useKeyPress(" ", buzzin, [], document.activeElement !== textAnswer.current);

  const [volume, setVolume] = useState(0);
  
  /*useEffect(() => {
    async function getVolume() {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true
          }
        });
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.minDecibels = -127;
        analyser.maxDecibels = 0;
        analyser.smoothingTimeConstant = 0.4;
        audioSource.connect(analyser);
        const volumes = new Uint8Array(analyser.frequencyBinCount);
        const volumeCallback = () => {
          analyser.getByteFrequencyData(volumes);
          let volumeSum = 0;
          for(const volume of volumes)
            volumeSum += volume;
          setVolume(volumeSum / volumes.length);
        };
        const volumeInterval = setInterval(() => {
          volumeCallback();
        }, 100);
        return () => {
          audioStream.getTracks().forEach(function(track) {
            track.stop();
          });
          clearInterval(volumeInterval);
        };
      } catch(e) {
        setSpeechMode(0);
        console.error("Microphone not detected: ", e);
        alert.error('Microphone not detected');
      }
    }
    getVolume();
  }, [alert]);*/
  return (
    <div class="answerbox-answering-bigger-wrapper">
      <div class="answerbox-answering-wrapper">
        <input
          disabled={props.buzzer !== username}
          type="text"
          name="name"
          value={props.answer}
          onChange={setAnswer2}
          className={"answerbox-textbox-text"}
          ref={textAnswer}
          autocomplete="off"
        />
        <div class="answerbox-switch-wrapper">
          <VoiceButton auth={authtoken} buzz={buzzin}/*buzz={() => {
	  StartRecording(authtoken);
    props.buzz();
		  setTimeout(()=>{textAnswer.current.focus();}, 100);
	  }}*/  mode={speechMode} setMode={setSpeechMode} volume={volume}/>
        </div>
        
        {/* <div class="answerbox-switch-wrapper">
          <Tooltip
            // options
            title="Use voice commands"
            position="top"
            trigger="mouseenter"
            unmountHTMLWhenHide="true"
          >
            <VoiceBuzzSwitch setVoice={setReady2} />
          </Tooltip>
          {ready && props.classifiable && (
            <div>
              <Tooltip
                // options
                title="Use classifier"
                position="top"
                trigger="mouseenter"
                unmountHTMLWhenHide="true"
              >
                <UseClassifierSwitch setVoice={setUseClassifier} />
              </Tooltip>
            </div>
          )}
        </div> */}

        <div onClick={stopRecording}>
          Buzz
        </div>
        <div class="answerbox-button" onClick={stopRecording}>
          Submit
        </div>
      </div>
      
      {speechMode === 1 &&
        <div class="answerbox-answering-voice-instructions">
          Speech Recognition: Say
          <div class="answerbox-answering-voice-instructions-highlight">Go</div> 
          to begin,
          <div class="answerbox-answering-voice-instructions-highlight">Stop</div>  
          for the transcript, press 
          <div class="answerbox-answering-voice-instructions-btn-highlight">Submit</div>
          to submit
        </div>
      }
      {speechMode === 2 &&
        <div class="answerbox-answering-voice-instructions">
          Classifier: Say 
          <div class="answerbox-answering-voice-instructions-highlight">Go</div> 
          to begin recording audio, say  
          <div class="answerbox-answering-voice-instructions-highlight">Stop</div>  
          to submit and classify (judge via audio)
        </div>
      }
    </div>
  );
}

export default AnswerBox;
