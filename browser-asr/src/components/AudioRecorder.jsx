import AudioAnalyser from "react-audio-analyser";
import { useState, useEffect } from "react";

import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import StopIcon from "@material-ui/icons/Stop";
import { makeStyles } from "@material-ui/core/styles";
import "../styles/AudioRecorder.css";

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  wrapIcon: {
    verticalAlign: "middle",
    display: "inline-flex",
  },
}));

// hook for recording
const Recorder = (props) => {
  const [status, setStatus] = useState("");
  const [audioSrc, setAudioSrc] = useState(null);
  const [duration, setDuration] = useState(0);
  const [placeholder, setPlaceholder] = useState("0");
  const controlAudio = (status) => {
    setStatus(status);
  };

	console.log("okay were in recording")

  // Function to start recording
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Handle stream
        console.log("Media stream obtained:", stream);
        // Start recording process here
        controlAudio("recording");
      })
      .catch(error => {
        // Handle error
        console.error("Error accessing microphone:", error);
      });
  };

  console.log("rendered");
  useEffect(() => {
    if (duration > 180) {
      controlAudio("inactive");
    }
    if (Math.floor((duration % 60) / 10) > 0) {
      setPlaceholder("");
    } else {
      setPlaceholder("0");
    }
  }, [duration]);

  const classes = useStyles();
  
  return (
    <div className="audiorecorder-wrapper">
      <div className={classes.buttons}>

        {status !== "recording" && (
          <div
            onClick={startRecording} // Call startRecording function
            className="audiorecorder-btn"
          >
            <PlayArrowIcon/>
            <div className="iconbreak"/>
            {duration === 0
              ? (status === "inactive" ? "RESTART " : "START ")
              : "RESUME " +
                Math.floor(duration / 60) +
                ":" +
                placeholder +
                (duration % 60)}
          </div>
        )}

        {status === "recording" && (
          <div
            onClick={() => controlAudio("paused")}
            className="audiorecorder-btn"
          >
            <PauseIcon />
            {"PAUSE " +
              Math.floor(duration / 60) +
              ":" +
              placeholder +
              (duration % 60)}
          </div>
        )}

        <div
          onClick={() => controlAudio("inactive")}
          className="audiorecorder-btn"
        >
          <StopIcon />
          STOP
        </div>
      </div>

      <AudioAnalyser
        audioType="audio/wav"
        audioOptions={{ sampleRate: 44100 }}
        status={status}
        audioSrc={audioSrc}
        timeslice={1000}
        startCallback={(e) => {
          console.log("start", e);
        }}
        pauseCallback={(e) => {
          console.log("pause", e);
        }}
        stopCallback={(e) => {
          setAudioSrc(window.URL.createObjectURL(e));
          props.setAudio(props.index, e);
          console.log("Duration", duration);
          setDuration(0);
          console.log("stop", e);
        }}
        onRecordCallback={(e) => {
          console.log("recording", e);
          setDuration(duration + 1);
        }}
        errorCallback={(err) => {
          console.log("error", err);
        }}
        width={100}
        height={100}
        backgroundColor="#6287F7"
        strokeColor="#EFF2FC"
        className="audioanalyser"
      />
    </div>
  );
};

export default Recorder;
