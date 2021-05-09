import React from "react";
import { useStore } from "../../../../hooks-store/store";
import "./God.css";

const God = (props) => {
  const [state, dispatch] = useStore();
  const selectable = state.gods[props.id].selectable
    ? "god-selectable"
    : "god-not-selectable";

  const godHandler = () => {
    if (state.gods[props.id].selectable) {
      const payload = { god: props.id, player: props.user };
      dispatch("ATTACK_GOD", payload);
    }
  };

  return (
    <g className={selectable} onClick={godHandler}>
      <circle cx={props.cx} cy={props.cy} r={props.r} />
      <text
        x={props.cx}
        y={props.cy}
        textAnchor="middle"
        stroke="#8B0000"
        strokeWidth="4px"
        fontSize="40px"
        dy=".3em"
      >
        {props.data.health}
      </text>
    </g>
  );
};

export default God;
