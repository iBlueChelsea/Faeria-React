import React from "react";
import Tile from "./Tile/Tile";
import Well from "./Well/Well";
import God from "./God/God";

const board = () => {
  //Set Board params!!!
  const hexSize = 65;
  const boardMaxHeight = 6;
  const boardTilesMap = { A: 2, B: 5, C: 6, D: 5, E: 6, F: 5, G: 2 };
  const wellPositions = { A: [0, 3], G: [0, 3] };
  //Set Board params!!!

  const tiles = Object.keys(boardTilesMap).map((column, i) => {
    return [...Array(boardTilesMap[column])].map((_, j) => {
      let parity = i % 2 === 0;
      return (
        <Tile
          key={column + (j + 1)}
          id={column + (j + 1)}
          hexSize={hexSize}
          startPosX={hexSize * i * 1.5}
          startPosY={
            parity
              ? Math.sqrt(3) *
                hexSize *
                ((boardMaxHeight - boardTilesMap[column]) * 0.5 + j)
              : Math.sqrt(3) * hexSize * j + Math.sqrt(3) * hexSize * 0.5
          }
        />
      );
    });
  });

  const wells = Object.keys(wellPositions).map((column) => {
    return wellPositions[column].map((_, i) => {
      let parity = Object.keys(boardTilesMap).indexOf(column) % 2 === 0;
      return (
        <Well
          key={"well-" + column + wellPositions[column][i]}
          id={"well-" + column + wellPositions[column][i]}
          r={hexSize * 0.5}
          cx={
            hexSize * 1.5 * Object.keys(boardTilesMap).indexOf(column) + hexSize
          }
          cy={
            parity
              ? (boardMaxHeight -
                  boardTilesMap[column] -
                  wellPositions[column].length +
                  wellPositions[column][i]) *
                  Math.sqrt(3) *
                  hexSize -
                Math.sqrt(3) * hexSize * 0.5
              : (boardMaxHeight -
                  boardTilesMap[column] -
                  wellPositions[column].length +
                  wellPositions[column][i]) *
                Math.sqrt(3) *
                hexSize
          }
        />
      );
    });
  });

  return (
    <React.Fragment>
      <svg width="1280" height="720">
        {tiles}
        {wells}
        <God 
              cx={50}
              cy={50}
              r={32.5}/>
      </svg>
    </React.Fragment>
  );
};

export default board;
