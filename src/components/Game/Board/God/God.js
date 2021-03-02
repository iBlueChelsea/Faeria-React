import React, {useState} from "react";

const God = (props) => {
  const [health,setHealth] = useState(props.data.health);
  const [wasHit,setWasHit] = useState(props.data.wasHit);

  return (
    <g>
    <circle
      cx={props.cx}
      cy={props.cy}
      r={props.r}
      stroke="#A9A9A9"
      strokeWidth="5"
      fill="#E0FFFF"
    />
    <text x={props.cx} y={props.cy} textAnchor="middle" stroke="#8B0000" strokeWidth="4px" fontSize="40px" dy=".3em">20</text>
    </g>
  );
};

export default God;
