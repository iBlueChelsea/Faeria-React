import React from "react";
import { useStore } from "../../../../../hooks-store/store";
import "./Occupant.css";
import images from "../../../../../assets/images/cards/images";
import icons from "../../../../../assets/images/ui/icons";

const Occupant = (props) => {
  const [state, dispatch] = useStore();
  const user = "player1";
  const opponent = "player2";

  const points_divine = [
    [props.x + 30, props.y - 10].join(),
    [props.x - 10, props.y + 60].join(),
    [props.x + 70, props.y + 60].join(),
  ].join(" ");

  const occupantClass =
    state.data.board.tiles[props.tile].occupant.player === user
      ? state.tiles[props.tile].occupantSelectable
        ? "friendly-selectable"
        : "friendly"
      : state.tiles[props.tile].occupantSelectable
      ? "enemy-selectable"
      : "enemy";
  const creatureClass =
    state.data.board.tiles[props.tile].occupant.player === user
      ? state.tiles[props.tile].occupantSelected
        ? "creature-selected"
        : "creature"
      : "creature-enemy";
  const iconClass =
    state.data.board.tiles[props.tile].occupant.player === user
      ? "friendly"
      : "enemy";
  const icon_taunt = state.data.board.tiles[props.tile].occupant.taunt ? (
    <rect
      x={props.x + 20}
      y={props.y - 7}
      rx="5"
      ry="5"
      width="20"
      height="20"
      fill={"url(#icon_taunt" + props.tile + ")"}
    />
  ) : null;
  const icon_ranged = state.data.board.tiles[props.tile].occupant.ranged ? (
    <rect
      x={props.x + 50}
      y={props.y + 30}
      rx="5"
      ry="5"
      width="20"
      height="20"
      fill={"url(#icon_ranged" + props.tile + ")"}
    />
  ) : null;
  const icon_flying = state.data.board.tiles[props.tile].occupant.movement
    .special.flying ? (
    <rect
      x={props.x + 20}
      y={props.y + 45}
      rx="5"
      ry="5"
      width="20"
      height="20"
      fill={"url(#icon_flying" + props.tile + ")"}
    />
  ) : null;
  const icon_aquatic =
    !icon_flying &&
    state.data.board.tiles[props.tile].occupant.movement.special.aquatic ? (
      <rect
        x={props.x + 20}
        y={props.y + 45}
        rx="5"
        ry="5"
        width="20"
        height="20"
        fill={"url(#icon_aquatic" + props.tile + ")"}
      />
    ) : null;
  const icon_jump = state.data.board.tiles[props.tile].occupant.movement.special
    .jump ? (
    <rect
      x={props.x + 20}
      y={props.y + 65}
      rx="5"
      ry="5"
      width="20"
      height="20"
      fill={"url(#icon_jump" + props.tile + ")"}
    />
  ) : null;
  const icon_scoot =
    !icon_jump &&
    state.data.board.tiles[props.tile].occupant.movement.range > 1 ? (
      <rect
        x={props.x + 20}
        y={props.y + 65}
        rx="5"
        ry="5"
        width="20"
        height="20"
        fill={"url(#icon_scoot" + props.tile + ")"}
      />
    ) : null;
  const divine = state.data.board.tiles[props.tile].occupant.divine ? (
    <polygon points={points_divine} className="divine" />
  ) : null;
  const protection = state.data.board.tiles[props.tile].occupant.protection ? (
    <ellipse
      cx={props.x + 30}
      cy={props.y + 39}
      rx="49"
      ry="49"
      className="protection"
    />
  ) : null;

  const occupantHandler = () => {
    if (state.tiles[props.tile].occupantSelectable) {
      const payload = { player: user, opponent: opponent, tile_id: props.tile };
      if (state.currentAction === "gift_occupant") {
        dispatch("PROCESS_GIFT_OCCUPANT", payload);
      } else if (state.currentAction === "event_occupant") {
        dispatch("PROCESS_EVENT_OCCUPANT", payload);
      } else {
        if (state.data.board.tiles[props.tile].occupant.player === user) {
          dispatch("SELECT_OCCUPANT", payload);
        } else if (state.currentAction === "occupant_selected") {
          dispatch("ATTACK_OCCUPANT", payload);
        }
      }
    }
  };

  const occupant = (
    <g className={occupantClass} onClick={occupantHandler}>
      <defs>
        <pattern
          id={"creature-image" + props.tile}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={images[state.data.board.tiles[props.tile].occupant.id]}
          />
        </pattern>
        <pattern
          id={"icon_aquatic" + props.tile}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={icons["aquatic_" + iconClass]}
          />
        </pattern>
        <pattern
          id={"icon_flying" + props.tile}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={icons["flying_" + iconClass]}
          />
        </pattern>
        <pattern
          id={"icon_jump" + props.tile}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={icons["jump_" + iconClass]}
          />
        </pattern>
        <pattern
          id={"icon_ranged" + props.tile}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={icons["ranged_" + iconClass]}
          />
        </pattern>
        <pattern
          id={"icon_scoot" + props.tile}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={icons["scoot_" + iconClass]}
          />
        </pattern>
        <pattern
          id={"icon_taunt" + props.tile}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={icons["taunt_" + iconClass]}
          />
        </pattern>
      </defs>

      <rect
        x={props.x}
        y={props.y}
        rx="5"
        ry="5"
        width={props.width}
        height={(props.width / 3) * 4}
        className={creatureClass}
        fill={"url(#creature-image" + props.tile + ")"}
      />

      {icon_taunt}
      {icon_ranged}
      {icon_flying}
      {icon_aquatic}
      {icon_jump}
      {icon_scoot}

      <rect
        x={props.x}
        y={props.y + 55}
        rx="5"
        ry="5"
        width="20"
        height="25"
        className="attack"
      />
      <text x={props.x + 10} y={props.y + 70} dy=".3em" className="attack-text">
        {state.data.board.tiles[props.tile].occupant.attack}
      </text>

      <rect
        x={props.x + 40}
        y={props.y + 55}
        rx="5"
        ry="5"
        width="20"
        height="25"
        className="health"
      />
      <text x={props.x + 50} y={props.y + 70} dy=".3em" className="health-text">
        {state.data.board.tiles[props.tile].occupant.health}
      </text>

      {divine}
      {protection}
    </g>
  );

  return state.data.board.tiles[props.tile].occupant.id > 0 ? occupant : null;
};

export default Occupant;
