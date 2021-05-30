import React from "react";
import { useStore } from "../../../../hooks-store/store";
import Occupant from "./Occupant/Occupant";
import "./Tile.css";

const Tile = (props) => {
  const [state, dispatch] = useStore();

  const extraclass =
    state.tiles[props.id].selectable && state.data.status.current === props.user
      ? "tile-selectable"
      : "tile-not-selectable";
  const tileclass =
    state.data.board.tiles[props.id].owner !== props.user
      ? props.type + "-opponent"
      : props.type;

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
    if (
      state.tiles[props.id].selectable &&
      state.data.status.current === props.user
    ) {
      const payload = {
        player: props.user,
        opponent: props.opponent,
        tile_id: props.id,
      };
      if (state.currentAction === "summon_creature") {
        dispatch("SUMMON_CREATURE", payload);
      } else if (state.currentAction === "occupant_selected" || state.currentAction === "event_move_occupant") {
        dispatch("MOVE_OCCUPANT", payload);
      } else if (state.currentAction === "event_tile") {
        dispatch("PROCESS_EVENT_TILE", payload);
      } else {
        dispatch("BUILD_TILE", payload);
      }
    }
  };

  return (
    <React.Fragment>
      <polygon
        className={tileclass + " " + extraclass}
        points={points}
        onClick={tileHandler}
      />
      <Occupant
        tile={props.id}
        x={startPosX + hexSize * 0.5}
        y={startPosY + Math.sqrt(3) * hexSize * 0.125}
        width={hexSize}
        user={props.user}
        opponent={props.opponent}
      />
    </React.Fragment>
  );
};

export default Tile;
