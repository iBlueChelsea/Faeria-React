import React from "react";

const tile = (props) => {
  console.log(props.id);
  const hexSize = props.hexSize;
  const startPosX = props.startPosX;
  const startPosY = props.startPosY;
  const pointA = [startPosX + hexSize / 2, startPosY];
  const pointB = [pointA[0] + hexSize, pointA[1]];
  const pointC = [
    pointB[0] + hexSize / 2,
    pointB[1] + (Math.sqrt(3) * hexSize) / 2,
  ];
  const pointD = [pointB[0], pointC[1] + (Math.sqrt(3) * hexSize) / 2];
  const pointE = [pointA[0], pointD[1]];
  const pointF = [pointE[0] - hexSize / 2, pointC[1]];

  const points = [];
  points.push(pointA.join());
  points.push(pointB.join());
  points.push(pointC.join());
  points.push(pointD.join());
  points.push(pointE.join());
  points.push(pointF.join());

  const click = () => {
    console.log(props.id);
  };

  return (
    <polygon
      style={{ fill: "#00FFFF", stroke: "#F0FFFF", strokeWidth: "3px" }}
      points={points.join(" ")}
      onClick={click}
    />
  );
};

export default tile;
