import React from "react";

const tile = (props) => {
  const hexSize = props.hexSize;
  const startPosX = props.startPosX;
  const startPosY = props.startPosY;
  const points = [
    [startPosX + hexSize * 0.5, startPosY].join(),
    [startPosX + hexSize * 1.5, startPosY].join(),
    [startPosX + hexSize * 2, startPosY + Math.sqrt(3) * hexSize * 0.5].join(),
    [startPosX + hexSize * 1.5, startPosY + Math.sqrt(3) * hexSize].join(),
    [startPosX + hexSize * 0.5, startPosY + Math.sqrt(3) * hexSize].join(),
    [startPosX, startPosY + Math.sqrt(3) * hexSize * 0.5].join(),
  ].join(" ");

  const click = () => {
    console.log(props.id);
  };

  return (
    <polygon
      style={{ fill: "#00FFFF", stroke: "#F0FFFF", strokeWidth: "3px" }}
      points={points}
      onClick={click}
    />
  );
};

export default tile;
