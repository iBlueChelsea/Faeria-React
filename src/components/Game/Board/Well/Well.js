import React, {useState} from "react";

const Well = (props) => {
  const [available, setAvailable] = useState(props.data.available);
  const [collected, setCollected] = useState(props.data.collected);

  return (
    <circle
      cx={props.cx}
      cy={props.cy}
      r={props.r}
      stroke="#00bae8"
      strokeWidth="15"
      fill="#E0FFFF"
    />
  );
};

export default Well;
