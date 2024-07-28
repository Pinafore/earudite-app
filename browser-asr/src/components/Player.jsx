import React from "react";
import ReactDOM from "react-dom";
import useSound from "use-sound";
import VTT from "../assets/id01.vtt";
import WavAudio from '../assets/id01.wav';
import "../styles/Player.css";

// button for playing an audio
function PlayButton(props) {
    const [play, { stop, isPlaying }] = useSound(Audio);
    return (
      <PlayButton
        active={isPlaying}
        size={60}
        iconColor="var(--color-background)"
        idleBackgroundColor="var(--color-text)"
        activeBackgroundColor="var(--color-primary)"
        play={() => {
            play();
        }}
        stop={stop}
      />
    );
  }

  // class for playing an audio w/ VTT
class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {gameState: 0, transcriptState: ""}; // 0 = begin, 1 = question is running, 2 = question is done
        this.transcript = []; // [i][0] = ms from start, [i][1] = word

        this.loadNextTranscript();
    }

    buzz() {
        // stop timer, pause audio, open answer box, enable submit button, start submit button countdown, 
    }

    submit() {
        // TODO
    }

    playAudio() { // implement + get audio with backend

    }

    playTranscript(transcript) {
        this.setState({
            transcriptState: ""
        })
        for(let i = 0; i < transcript.length; i++) {
            console.log(transcript[i][1] + transcript[i][0]);
            setTimeout(() => {this.setState({
                transcriptState: this.state.transcriptState + transcript[i][1] + " "
            })}, transcript[i][0]);
        }
    }

    isCorrect() {
        // implement w/ backend to check answer
        return true;
    }

    loadNextTranscript() {
        fetch(VTT)
            .then(response => response.text())
            .then(text => {
                let lines = text.split("\n");
                for(let i = 2; i < lines.length-1; i+=3) {
                    let startTime = lines[i].split(" ")[0];
                    let minutes = parseInt(startTime.split(":")[0]);
                    let seconds = parseFloat(startTime.split(":")[1]) + minutes*60;
                    let ms = parseInt(seconds*1000);
                    this.transcript.push(new Array(ms, lines[i+1]));
                }
            });
    }

    render() {

        return (
            <div class="player-wrapper">
                <div class="transcript-box">
                    {this.state.transcriptState}
                </div>
                
                <a class="play-btn" onClick={() => {
                    this.playTranscript(this.transcript);
                    let x = new Audio(WavAudio);
                    x.play();
                }}>
                    Play
                </a>
                
            </div>
        );
    }
}

export default Player;