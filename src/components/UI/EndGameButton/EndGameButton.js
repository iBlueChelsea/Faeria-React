import React from "react";
import "./EndGameButton.css";
import { useStore } from "../../../hooks-store/store";

const EndGameButton = (props) => {
  const dispatch = useStore()[1];

  const endGameHandler = () => {
    const payload = {
      opponent: props.opponent,
    };
    dispatch("END_GAME", payload);
  };

  return (
    <svg width="200px" height="60px">
      <g onClick={endGameHandler}>
        <rect
          x="10"
          y="5"
          rx="20"
          ry="20"
          width="180"
          height="50"
          className="endgame-button"
        />
        <text x="100" y="30" fontSize="25" className="endgame-text" dy=".3em">
          SCOOP
        </text>
      </g>
    </svg>
  );
};

export default EndGameButton;
