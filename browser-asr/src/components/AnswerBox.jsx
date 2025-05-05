import { useState, useRef, useEffect, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { PROFILE, GAMESETTINGS } from "../store";

import "../styles/AnswerBox.css";

function AnswerBox(props) {
  const [buzzed, setBuzzed] = useState(false);
  const profile = useRecoilValue(PROFILE);
  const username = profile["username"];
  const gameSettings = useRecoilValue(GAMESETTINGS);
  const textAnswer = useRef(null);

  // Update the answer state
  const setAnswer2 = useCallback(
    (event) => {
      props.setAnswer(event.target.value);
    },
    [props.setAnswer]
  );

  // Handle buzzing in or submitting
  function handleBuzzOrSubmit() {
    if (!buzzed) {
      setBuzzed(true);
      props.buzz();

      // Focus the input immediately
      textAnswer.current?.focus();
    } else if (props.answer.trim() !== "") {
      props.submit(props.answer);
      props.setAnswer("");
      setBuzzed(false);

      // Unfocus the input
      textAnswer.current?.blur();
    }
  }

  // Handle keyboard events
  function handleKeyPress(event) {
    const buttonExists = !!document.querySelector(".answerbox-button"); // Check if the button exists in the DOM

    // Disable keybinds if no button exists
    if (!buttonExists) return;

    if (event.code === "Space" && !buzzed && event.target.tagName !== "INPUT") {
      event.preventDefault(); // Prevent default space behavior (scrolling)
      handleBuzzOrSubmit(); // Buzz in with space bar
    } else if (
      event.code === "Enter" &&
      buzzed &&
      event.target.tagName === "INPUT"
    ) {
      event.preventDefault(); // Prevent default enter behavior (new line)
      handleBuzzOrSubmit(); // Submit with enter key
    }
  }

  // Add event listeners for space bar and enter
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      // Always clean up the event listener
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [buzzed, props.answer]);

  // Reset state if another user buzzes
  useEffect(() => {
    if (props.buzzer !== username) {
      props.setAnswer("");
      setBuzzed(false);
    }
  }, [props.buzzer, username]);

  const isGapTimeExceeded = props.state.gapTime < gameSettings.gap_time;

  return (
    <div className="answerbox-answering-bigger-wrapper">
      <div className="answerbox-answering-wrapper">
        {!isGapTimeExceeded && (
          <>
            <input
              readOnly={!buzzed || props.buzzer !== username} // Readonly instead of disabled
              type="text"
              value={props.answer}
              onChange={setAnswer2}
              className={`answerbox-textbox-text ${buzzed ? "" : "readonly"}`} // Optional styling for readonly
              ref={textAnswer}
              autoComplete="off"
              placeholder="Type your answer..."
            />
            <div
              className="answerbox-button"
              onClick={handleBuzzOrSubmit}
              role="button"
              tabIndex={0}
              aria-pressed={buzzed}
            >
              {buzzed ? "Submit" : "Buzz"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnswerBox;

