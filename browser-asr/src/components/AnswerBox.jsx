import { useState, useRef, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { PROFILE } from "../store";
import "../styles/AnswerBox.css"; // Ensure that the CSS is being imported

function AnswerBox(props) {
  const [buzzed, setBuzzed] = useState(false);
  const profile = useRecoilValue(PROFILE);
  const username = profile["username"];
  const textAnswer = useRef(null);

  function setAnswer2(event) {
    props.setAnswer(event.target.value);
  }

  function handleButtonClick() {
    if (!buzzed) {
      setBuzzed(true);
      textAnswer.current.focus();
      props.buzz();
    } else {
      props.submit(props.answer);
      props.setAnswer("");
      setBuzzed(false);
    }
  }

  useEffect(() => {
    if (props.buzzer !== username) {
      props.setAnswer("");
      setBuzzed(false);
    }
  }, [props.buzzer, username]);

  return (
    <div class="answerbox-answering-bigger-wrapper">
      <div class="answerbox-answering-wrapper">
        <input
          disabled={!buzzed || props.buzzer !== username}
          type="text"
          value={props.answer}
          onChange={setAnswer2}
          className="answerbox-textbox-text"
          ref={textAnswer}
          autoComplete="off"
        />
        <div class="answerbox-button" onClick={handleButtonClick}>
          {buzzed ? "Submit" : "Buzz"}
        </div>
      </div>
    </div>
  );
}

export default AnswerBox;

