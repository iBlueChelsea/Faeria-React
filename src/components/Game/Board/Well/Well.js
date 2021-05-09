import React from "react";
import "./Well.css";

const Well = (props) => {
  const wellClass = props.data.collected ? "well-collected" : "well-available";

  return (
    <circle cx={props.cx} cy={props.cy} r={props.r} className={wellClass} />
  );
};

export default Well;
