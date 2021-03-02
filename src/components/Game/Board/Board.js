import React from "react";
import Tile from "./Tile/Tile";
import Well from "./Well/Well";
import God from "./God/God";

const Board = (props) => {
  const hexSize = 50;
  const boardMaxHeight = 6;
  const godMaxHeight = boardMaxHeight + 1;
  const boardTilesMap = { A: 2, B: 5, C: 6, D: 5, E: 6, F: 5, G: 2 };
  const wellPositions = { A: [0, 3], G: [0, 3] };
  const godPositions = { D: [0, 6] };

  const tiles = Object.keys(boardTilesMap).map((column, i) => {
    return [...Array(boardTilesMap[column])].map((_, j) => {
      let parity = i % 2 === 0;
      return (
        <Tile
          key={column + (j + 1)}
          id={column + (j + 1)}
          type={props.data.tiles[column + (j + 1)].type}
          hexSize={hexSize}
          startPosX={hexSize * i * 1.5}
          startPosY={
            parity
              ? Math.sqrt(3) *
                  hexSize *
                  ((boardMaxHeight - boardTilesMap[column]) * 0.5 + j) +
                Math.sqrt(3) * hexSize * 0.5
              : Math.sqrt(3) * hexSize * j + Math.sqrt(3) * hexSize
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
          data={props.data.wells[column + wellPositions[column][i]]}
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
                  hexSize
              : (boardMaxHeight -
                  boardTilesMap[column] -
                  wellPositions[column].length +
                  wellPositions[column][i]) *
                Math.sqrt(3) *
                hexSize +
                Math.sqrt(3) * hexSize * 0.5
          }
        />
      );
    });
  });

  const gods = Object.keys(godPositions).map((column) => {
    return godPositions[column].map((_, i) => {
      let parity = Object.keys(boardTilesMap).indexOf(column) % 2 === 0;
      return (
        <God
          key={"god-" + column + godPositions[column][i]}
          id={"god-" + column + godPositions[column][i]}
          data={props.data.gods[column + godPositions[column][i]]}
          r={hexSize * 0.65}
          cx={
            hexSize * 1.5 * Object.keys(boardTilesMap).indexOf(column) + hexSize
          }
          cy={
            parity
              ? (godMaxHeight -
                  boardTilesMap[column] -
                  godPositions[column].length +
                  godPositions[column][i]) *
                  Math.sqrt(3) *
                  hexSize
              : (godMaxHeight -
                  boardTilesMap[column] -
                  godPositions[column].length +
                  godPositions[column][i]) *
                  Math.sqrt(3) *
                  hexSize +
                Math.sqrt(3) * hexSize * 0.5
          }
        />
      );
    });
  });

  return (
    <div style={{ justifyContent: "center", display: "flex"}}>
      <svg width={hexSize*1.5*Object.keys(boardTilesMap).length+hexSize*0.5} height={Math.sqrt(3) * hexSize * godMaxHeight}>
        {tiles}
        {wells}
        {gods}
      </svg>
    </div>
  );
};

export default Board;
