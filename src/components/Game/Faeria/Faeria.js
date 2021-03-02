import React from "react";

const Faeria = (props) => {
  return (
    <svg>
      <g>
        <circle
          cx="50%"
          cy="50%"
          r="50"
          stroke="#001920"
          strokeWidth="5"
          fill="#00bae8"
        />
        <text
          x="50%"
          y="50%"
          stroke= "#001920"
          strokeWidth= "3px"
          textAnchor= "middle"
          fontSize="50px"
          dy=".3em"
        >
        {props.faeria}
        </text>
      </g>
    </svg>
  );
};

export default Faeria;
