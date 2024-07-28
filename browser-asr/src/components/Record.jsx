import "../styles/Record.css";
import React from "react";
import Recorder from './AudioRecorder.jsx';

// ASSETS
import CasinoOutlinedIcon from '@material-ui/icons/CasinoOutlined';
import CoinIcon from '../assets/coin.png';

let transcripts = ["Neil Bartlett confirmed this man's 1932 prediction of xenon-fluorine compounds.  He stated that the cation coordination number is set by the ratio of ionic radii in one of his rules for ionic crystals.  He took the bond energy for the compound AB minus the geometric mean of the bond energies for AA and BB as a measure of a bond's ionic character.  For 10 points--name this chemist who thus introduced electronegativity.",
            "This national park is home to Artist's Drive, Zabriskie Point, and Dante's View, from which one can see Telescope Peak.  Its Racetrack Playa contains mysterious \"sailing stones,\" which can travel hundreds of feet.  Despite being only 85 miles southeast of Mount Whitney, this park's Badwater Basin is 282 feet below sea level.  For 10 points--name this national park in the Mojave Desert of California.",
            "This people produced a seated basalt sculpture called \"The Wrestler,\" which is not in the \"elongated man\" style seen in their wooden busts at the site of El Manat\\'i .  Other archaeological sites of this people include La Venta and San Lorenzo.  The sacred ballgame may have been invented by this group, whose name is Nahuatl for \"rubber people.\"  For 10 points--name this Mesoamerican people who sculpted giant stone heads.",
            "This man left France because his mother, the Countess of Soissons, was implicated in the Affair of the Poisons. He used his victory at Petrovaradin to establish a siege of Belgrade, where the Ottoman garrison surrendered after just a month. This commander ambushed the Ottoman crossing of the (*) Tisza River to win the Battle of Zenta. For 10 points, name this Habsburg general who collaborated with the Duke of Marlborough to win an allied victory at the Battle of Blenheim.",
            "One example of this technique is the Castner-Kellner process that starts with sodium chloride.  The decomposition potential must be overcome for this technique to be successful.  Other examples of it include the Hall-H\\'eroult process used to make aluminum and the production of hydrogen gas from water.  For 10 points--name this technique that uses an electric current to drive an otherwise non-spontaneous process.",
            "In the Aeneid , Juno offers this figure the nymph Deiopea as a wife in exchange for help in disturbing Aeneas's voyage.  He is in charge of the Anemoi , whom he rules from a floating island.  In the Odyssey, Odysseus visits this figure after blinding Polyphemus , and receives from him a magic bag that contains Eurus , Notus , and Boreas , but not Zephyrus .  For 10 points--name this immortal ruler of the winds.",
            "In May 2015 Jo Bertram challenged London mayor Boris Johnson to debate a plan limiting the operations of this company, which has been forced to cease operating in Spain and Portugal.  This company was sued in a U.S. court after one of its contractors allegedly raped a customer in Delhi.  In June 2014 European taxi drivers protested against--for 10 points--what company that offers an \"X\" service through its ride-sharing app?",
            "In 2015 an ultrasound machine was used to assist Charles Warner in undergoing this procedure.  The use of midazolam as a sodium thiopental replacement in this procedure was challenged in the Supreme Court case Glossip v. Gross.  Potassium chloride is often the last drug in this procedure's \"cocktail.\"  In 2014 Michael Lee Wilson stated \"I feel my whole body burning\" while undergoing--for 10 points--what form of execution?",
            "This man served three stints as chancellor of the Exchequer under Lord Derby .  He represented Britain at the Congress of Berlin, and used funds from the Rothschilds to buy Ismail Pasha's shares of the Suez Canal.  This politician conferred the title \"Empress of India\" on Queen Victoria, who favored this Conservative over his rival, William Gladstone.  For 10 points--name this British prime minister of Jewish descent."];
let qids = ["60f702c701166e43053ae613",
            "60f702c701166e43053ae615",
            "60f702c701166e43053ae612",
            "60e222ee1d7721ce60f69592",
            "60f702c701166e43053ae610",
            "60f702c701166e43053ae60e",
            "60f702c701166e43053ae614",
            "60f702c701166e43053ae60f",
            "60f702c701166e43053ae617"];

// card for displaying a single transcript
function TranscriptCard(props) {
    function record() {
        props.setTranscript(transcripts[props.id]);
        props.setCurrentlyRecording(1);
        props.setQid(qids[props.id]);
    }

    return (
        <div class="record-transcriptcard-wrapper">
            <div class="record-transcriptcard-transcript">
                {transcripts[props.id]}
            </div>
            <div class="record-transcriptcard-footer-wrapper">
                <div class="record-transcriptcard-footer-coin-wrapper">
                    <img class="record-transcriptcard-footer-coin" src={CoinIcon} alt="Coins"/>
                    <div class="record-transcriptcard-footer-coin-amount">
                        500
                    </div>
                </div>
                
                <div class="record-transcriptcard-footer-record" onClick={record}>
                    Record &#187;
                </div>
            </div>
        </div>
    );
}

// card that displays transcripts + reroll button
function TranscriptDisplayCard(props) {
    return (
        <div class="record-recordingcard-wrapper" style={{borderColor: props.frameColor}}>
            <div class="record-recordingcard-title-wrapper" style={{borderColor: props.frameColor, backgroundColor: props.frameColor}}>
                <div class="record-recordingcard-title" style={{color: props.textColor}}>
                    {props.label}
                </div>
                <div class="record-recordingcard-reroll" style={{color: props.textColor, borderColor: props.textColor}}>
                    <CasinoOutlinedIcon style={{color: props.textColor, height: "20px", width: "auto"}}/>
                    <div style={{marginLeft: "0.25rem"}}>
                        REROLL
                    </div>
                </div>
            </div>
            <div class="record-recordingcard-content-wrapper">
                <TranscriptCard  setCurrentlyRecording={props.setCurrentlyRecording} setTranscript={props.setTranscript} setQid={props.setQid} id={props.id * 3}/>
                <TranscriptCard  setCurrentlyRecording={props.setCurrentlyRecording} setTranscript={props.setTranscript} setQid={props.setQid} id={props.id * 3 + 1}/>
                <TranscriptCard  setCurrentlyRecording={props.setCurrentlyRecording} setTranscript={props.setTranscript} setQid={props.setQid} id={props.id * 3 + 2}/>
            </div>
        </div>
    );
}

// legacy recording page
class Record extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            CurrentlyRecording: 0,
            transcript: "",
            qid: "",
        };
        this.setCurrentlyRecording = this.setCurrentlyRecording.bind(this);
        this.setTranscript = this.setTranscript.bind(this);
        this.setQid = this.setQid.bind(this);
    }

    setCurrentlyRecording(CR) {
        this.setState({
            CurrentlyRecording: CR
        });
    }

    setTranscript(tr) {
        this.setState({
            transcript: tr
        });
    }

    setQid(q) {
        this.setState({
            qid: q
        });
    }

    render() {
        if(this.state.CurrentlyRecording === 0) {
            return (
                <div class="record-content-wrapper">
                    <TranscriptDisplayCard frameColor="#E1F8DC" textColor="green" label="Easy" setCurrentlyRecording={this.setCurrentlyRecording} setTranscript={this.setTranscript} setQid={this.setQid} id={0}/>
                    <TranscriptDisplayCard frameColor="#FEF8DD" textColor="orange" label="Medium" setCurrentlyRecording={this.setCurrentlyRecording} setTranscript={this.setTranscript} setQid={this.setQid} id={1}/>
                    <TranscriptDisplayCard frameColor="#F7D6DD" textColor="red" label="Hard" setCurrentlyRecording={this.setCurrentlyRecording} setTranscript={this.setTranscript} setQid={this.setQid} id={2}/>
                </div>
            );
        } else {
            return (
                <div class="record-content-wrapper-2">
                    <div class="recording-recorder-wrapper">
                        <div class="recording-recorder-transcript">
                            {this.state.transcript}
                        </div>
                        <div class="recording-recorder-footer-wrapper">
                            <Recorder setCurrentlyRecording={this.setCurrentlyRecording} qid={this.state.qid}/>
                        </div>
                    </div>
                    <div class="recording-directions-wrapper">
                        <div class="recording-directions-title">
                            Directions
                        </div>
                        <div class="recording-directions-divider"></div>
                        <div class="recording-directions-body">
                            Read through the transcript before recording to ensure you are prepared to speak smoothly and consistently. All recordings will pass through a pre-screening process and you will be notified in your profile if it passes. 
                        </div>
                        <div class="recording-directions-back-wrapper">
                            <div class="recording-directions-back" onClick={() => this.setCurrentlyRecording(0)}>
                                Back
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
       
    }
}

export default Record;