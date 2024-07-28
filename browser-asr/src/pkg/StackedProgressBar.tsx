import * as React from "react";

import "./StackedProgressBar.css";
import { ProgressBar } from "react-bootstrap";

export enum ProgressBarVariant {
  green = "success",
  blue = "info",
  red = "danger",
  yellow = "warning",
}

interface Props {
  barData: Array<{ width: number; color: ProgressBarVariant }>;
  progressData: Array<number>;
  striped?: boolean;
  labels?: Array<string>;
  animated?: boolean;
}

export const StackedProgressBar = (props: Props) => {
  return (
    <ProgressBar>
      {props.barData.map((bar, index) => {
        return (
          <ProgressBar
            striped={props.striped || false}
            variant={bar.color}
            now={Math.round((props.progressData[index] * bar.width) / 100)}
            key={index}
            style={{ maxWidth: `${bar.width}%` }}
            label={
              props.labels && props.labels.length > index
                ? props.labels[index]
                : ""
            }
            animated={props.animated || false}
          />
        );
      })}
    </ProgressBar>
  );
};
