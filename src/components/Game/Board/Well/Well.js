import React from "react";

const well = (props) => {
  return (
    <circle
      cx={props.cx}
      cy={props.cy}
      r={props.r}
      stroke="#00FFFF"
      strokeWidth="20"
      fill="#E0FFFF"
    />
  );
};

export default well;
