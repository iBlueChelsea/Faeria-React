import React from "react";
import Tile from "./Tile/Tile";
import Well from "./Well/Well";
import God from "./God/God";

const Board = (props) => {
  const hexSize = 60;
  const boardMaxHeight = 6;
  const godMaxHeight = boardMaxHeight + 1;
  const boardTilesMap =
    props.user === "player2"
      ? { G: 2, F: 5, E: 6, D: 5, C: 6, B: 5, A: 2 }
      : { A: 2, B: 5, C: 6, D: 5, E: 6, F: 5, G: 2 };
  const wellPositions =
    props.user === "player2"
      ? { G: [3, 0], A: [3, 0] }
      : { A: [0, 3], G: [0, 3] };
  const godPositions = props.user === "player2" ? { D: [6, 0] } : { D: [0, 6] };

  const tiles = Object.keys(boardTilesMap).map((column, i) => {
    return [...Array(boardTilesMap[column])].map((_, j) => {
      let parity = i % 2 === 0;
      let columnNr =
        props.user === "player2" ? boardTilesMap[column] - j : j + 1;
      return (
        <Tile
          key={column + columnNr}
          id={column + columnNr}
          type={props.data.tiles[column + columnNr].type}
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
          user={props.user}
          opponent={props.opponent}
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
                  [0, 3][i]) *
                Math.sqrt(3) *
                hexSize
              : (boardMaxHeight -
                  boardTilesMap[column] -
                  wellPositions[column].length +
                  [0, 3][i]) *
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
          id={column + godPositions[column][i]}
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
                  [0, 6][i]) *
                Math.sqrt(3) *
                hexSize
              : (godMaxHeight -
                  boardTilesMap[column] -
                  godPositions[column].length +
                  [0, 6][i]) *
                  Math.sqrt(3) *
                  hexSize +
                Math.sqrt(3) * hexSize * 0.5
          }
          user={props.user}
          opponent={props.opponent}
        />
      );
    });
  });

  return (
    <div style={{ width: "60vw", justifyContent: "center", display: "flex" }}>
      <svg
        width={
          hexSize * 1.5 * Object.keys(boardTilesMap).length + hexSize * 0.5
        }
        height={Math.sqrt(3) * hexSize * godMaxHeight}
      >
        {tiles}
        {wells}
        {gods}
      </svg>
    </div>
  );
};

export default Board;
