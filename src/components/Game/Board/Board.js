import React from "react";
import Tile from "./Tile/Tile";
import Well from "./Well/Well";

const board = () => {
  const hexSize = 65;
  const BoardTilesMap = { A: 2, B: 5, C: 6, D: 5, E: 6, F: 5, G: 2 };
  const tiles = Object.keys(BoardTilesMap).map((column, i) => {
    return [...Array(BoardTilesMap[column])].map((_, j) => {
      let parity = i % 2 === 0;
      return (
        <Tile
          key={column + (j + 1)}
          id={column + (j + 1)}
          hexSize={hexSize}
          startPosX={hexSize * i * 1.5}
          startPosY={
            parity
              ? Math.sqrt(3) * hexSize * ((6 - BoardTilesMap[column]) / 2 + j)
              : Math.sqrt(3) * hexSize * j + (Math.sqrt(3) * hexSize) / 2
          }
        />
      );
    });
  });

  console.log(tiles);

  return (
    <React.Fragment>
      <svg width="1280" height="720">
        {tiles}
        <Well />
      </svg>
    </React.Fragment>
  );
};

export default board;
