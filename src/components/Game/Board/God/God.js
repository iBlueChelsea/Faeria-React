import { getNodeText } from "@testing-library/react";
import React from "react";

const god = (props) => {
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
    <text x={props.cx} y={props.cy} text-anchor="middle" stroke="#8B0000" stroke-width="3px" font-size="32px" dy=".3em">20</text>
    </g>
  );
};

export default god;
