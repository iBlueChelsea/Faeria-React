import React from "react";
import "./EndTurnButton.css";
import { useStore } from "../../../hooks-store/store";

const EndTurnButton = (props) => {
  const dispatch = useStore()[1];

  const endTurnHandler = () => {
    const payload = {
      player: props.user,
      opponent: props.opponent,
      id: props.id,
    };
    dispatch("END_TURN", payload);
  };

  const enemyTurnHandler = () => {};

  const btnText =
    props.data.turn === 0
      ? "MULLIGAN"
      : props.opponent === props.data.current
      ? "ENEMY TURN"
      : "END TURN";
  const btnClass =
    props.opponent === props.data.current
      ? "enemyturn-button"
      : "endturn-button";
  const btnClassText =
    props.opponent === props.data.current ? "enemyturn-text" : "endturn-text";
  const btnOnClick =
    props.data.turn === 0 || props.opponent === props.data.current
      ? enemyTurnHandler
      : endTurnHandler;

  return (
    <g onClick={btnOnClick}>
      <rect
        x="50"
        y="125"
        rx="20"
        ry="20"
        width="200"
        height="50"
        className={btnClass}
      />
      <text x="150" y="150" fontSize="25" className={btnClassText} dy=".3em">
        {btnText}
      </text>
    </g>
  );
};

export default EndTurnButton;
