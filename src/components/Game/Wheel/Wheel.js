import React from "react";
import WheelButton from "./WheelButton/WheelButton";
import EndTurnButton from "../../UI/EndTurnButton/EndTurnButton";
import "./Wheel.css";
import {useStore} from '../../../hooks-store/store';

const Wheel = (props) => {
  const [state,dispatch] = useStore();

  const hexSize = 40;
  const boardTilesMap = { A: 2, B: 3, C: 2 };
  const boardMaxHeight = 3;
  const offsetX =
    (300 -
      (hexSize * 1.5 * Object.keys(boardTilesMap).length + hexSize * 0.5)) *
    0.5;
  const offsetY =
    (300 - Math.sqrt(3) * hexSize * boardMaxHeight - Math.sqrt(3) * hexSize) *
    0.5;

  const wheel = Object.keys(boardTilesMap).map((column, i) => {
    return [...Array(boardTilesMap[column])].map((_, j) => {
      let parity = i % 2 !== 0;
      return (
        <WheelButton
          key={"wheel-" + column + (j + 1)}
          id={"wheel-" + column + (j + 1)}
          className={"wheel-" + column + (j + 1)}
          hexSize={hexSize}
          startPosX={hexSize * i * 1.5 + offsetX}
          startPosY={
            parity
              ? Math.sqrt(3) *
                  hexSize *
                  ((boardMaxHeight - boardTilesMap[column]) * 0.5 + j) +
                Math.sqrt(3) * hexSize * 0.5 +
                offsetY
              : Math.sqrt(3) * hexSize * j + Math.sqrt(3) * hexSize + offsetY
          }
        />
      );
    });
  });

  const wheelOutput = (!state.wheel.used_wheel) ? wheel : <EndTurnButton />;

  return (
    <div
      style={{
        width: "300px",
        height: "300px",
        position: "absolute",
        bottom: "50px",
        left: "50px",
      }}
    >
      <svg width="300px" height="300">
        <circle
          cx="150"
          cy="150"
          r="145"
          stroke="#00FA9A"
          strokeWidth="5"
          fill="#2F4F4F"
        />
        {wheelOutput}
      </svg>
    </div>
  );
};

export default Wheel;