import { useState } from 'react';
import '../styles/StatsCardsAccordion.css';
import { useRecoilValue } from "recoil";
import { PROFILE } from "../store";

// Material UI Accordion
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// displays a single stat
function Stat(props) {
    return (
        <div class="statscardsaccordion-stat">
            {props.name}: {props.value}
        </div>
    );
}

// hook for all of the stats
export default function StatsCardsAccordion() {
  const profile = useRecoilValue(PROFILE);

  const [expanded, setExpanded] = useState({
      "rating": false,
      "questions": false,
      "games": false,
      "recordings": false,
      "other": false
    });

  const handleChange = (panel) => {
    let newMap = {
        "rating": false,
        "questions": false,
        "games": false,
        "recordings": false,
        "other": false
    };
    newMap[panel] = !expanded[panel];
    setExpanded(newMap);
  };

  return (
    <div class="statscardsaccordion">
      <Accordion expanded={expanded['rating']} onChange={() => {handleChange('rating')}} className={"statscardsaccordion-tab"}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          Rating
        </AccordionSummary>
        <AccordionDetails>
            <div class="statscardsaccordion-stats-wrapper">
                <Stat name="Rating" value={profile['rating']}/>
                <Stat name="Rating by category" value="--"/>
                <Stat name="Rating over time" value="--"/>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded['questions']} onChange={() => {handleChange('questions')}} className={"statscardsaccordion-tab"}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          Questions
        </AccordionSummary>
        <AccordionDetails>
            <div class="statscardsaccordion-stats-wrapper">
                <Stat name="Total questions played" value={profile['totalQuestionsPlayed']}/>
                <Stat name="Total questions answered" value="--"/>
                <Stat name="Questions played by category" value="--"/>
                <Stat name="Questions answered by category" value="--"/>
                <Stat name="Total buzzes" value="--"/>
                <Stat name="Buzz rate" value="--"/>
                <Stat name="Buzz accuracy" value="--"/>
                <Stat name="Average % of question before buzzing" value="--"/>
                <Stat name="Average # of hints before buzzing" value="--"/>
                <Stat name="Average time elapsed before buzzing" value="--"/>
                <Stat name="Total buzzer races" value="--"/>
                <Stat name="Total buzzer races won" value="--"/>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded['games']} onChange={() => {handleChange('games')}} className={"statscardsaccordion-tab"}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          Games
        </AccordionSummary>
        <AccordionDetails>
            <div class="statscardsaccordion-stats-wrapper">
                <Stat name="Games played" value={profile['totalGames']}/>
                <Stat name="Ranked games played" value="--"/>
                <Stat name="Ranked games won" value="--"/>
                <Stat name="Ranked winrate" value="--"/>
                <Stat name="Casual games played" value="--"/>
                <Stat name="Casual games won" value="--"/>
                <Stat name="Casual winrate" value="--"/>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded['recordings']} onChange={() => {handleChange('recordings')}} className={"statscardsaccordion-tab"}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          Recordings
        </AccordionSummary>
        <AccordionDetails>
            <div class="statscardsaccordion-stats-wrapper">
                <Stat name="Recordings made" value={profile['recordedAudios'].length}/>
                <Stat name="Average recording rating" value="--"/>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded['other']} onChange={() => {handleChange('other')}} className={"statscardsaccordion-tab"}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          Other
        </AccordionSummary>
        <AccordionDetails>
            <div class="statscardsaccordion-stats-wrapper">
                <Stat name="Lifetime coins earned" value={profile['coinsCumulative']}/>
                <Stat name="Lifetime playtime" value={profile['playTime']}/>
            </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
