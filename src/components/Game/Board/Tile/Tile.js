import React from "react";
import { useStore } from "../../../../hooks-store/store";
import "./Tile.css";

const Tile = (props) => {
  const [state, dispatch] = useStore();
  const user = 'player1';
  const extraclass = (state.tiles[props.id].selectable) ? 'tile-selectable' : 'tile-not-selectable';

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

  const tileHandler = () => {
    if (state.tiles[props.id].selectable) {
      const payload = {player: user, tile_id: props.id}
      dispatch("BUILD_TILE", payload);
    }
  };

  return <polygon className={props.type + ' ' + extraclass} points={points} onClick={tileHandler} />;
};

export default Tile;
