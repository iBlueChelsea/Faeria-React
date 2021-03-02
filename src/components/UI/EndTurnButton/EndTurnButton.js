import React from "react";
import "./EndTurnButton.css";
import {useStore} from '../../../hooks-store/store';

const EndTurnButton = (props) => {
  const [state,dispatch] = useStore();

  const endTurnHandler = () => {
    dispatch('END_TURN');
  }

  return (
    <g onClick={endTurnHandler}>
      <rect
        x="50"
        y="125"
        rx="20"
        ry="20"
        width="200"
        height="50"
        className="endturn-button"
      />
      <text
        x="150"
        y="150"
        fontSize="25"
        className="endturn-text"
        dy=".3em"
      >
        END TURN
      </text>
    </g>
  );
};

export default EndTurnButton;
