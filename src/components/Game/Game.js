import React from "react";
import Board from "./Board/Board";
import Hand from "./Hand/Hand";

const game = () => {
  return (
    <React.Fragment>
      <Hand />
      <Board />
      <Hand />
    </React.Fragment>
  );
};

export default game;
