import React from "react";
import logo from "./logo.svg";
import "./styles/App.css";
import { AppBar, Typography, makeStyles } from "@material-ui/core";
import Recorder from "./components/AudioRecorder";
import { useRecoilValue } from "recoil";
import { TEXT } from "./store";

const useStylesAppBar = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    padding: 4,
  },
}));

function App() {
  const classes = useStylesAppBar();
  const text = useRecoilValue(TEXT);
  return (
    <div>
      <div className={classes.root}>
        {/* <AppBar position="static">
          <Typography variant="h6" color="inherit" className={classes.title}>
            Kaldi ASR
          </Typography>
        </AppBar> */
        /* <Recorder /> */
        /* <Typography>{text}</Typography> */}
      </div>
    </div>
  );
}

export default App;
