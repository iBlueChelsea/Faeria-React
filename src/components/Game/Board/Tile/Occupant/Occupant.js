import React from "react";
import { useStore } from "../../../../../hooks-store/store";
import "./Occupant.css";
import images from "../../../../../assets/images/cards/images";

const Occupant = (props) => {
  const [state, dispatch] = useStore();
  const user = "player1";

  const occupantHandler = () => {};

  const occupant = (
    <React.Fragment>
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
      </defs>

      <rect
        x={props.x}
        y={props.y}
        rx="5"
        ry="5"
        width="50"
        height="70"
        className="creature"
        fill={"url(#creature-image" + props.tile + ")"}
        onClick={occupantHandler}
      />

      <rect
        x={props.x}
        y={props.y + 45}
        rx="5"
        ry="5"
        width="20"
        height="25"
        className="attack"
      />
      <text x={props.x + 10} y={props.y + 59} dy=".3em" className="attack-text">
        {state.data.board.tiles[props.tile].occupant.attack}
      </text>

      <rect
        x={props.x + 30}
        y={props.y + 45}
        rx="5"
        ry="5"
        width="20"
        height="25"
        className="health"
      />
      <text x={props.x + 40} y={props.y + 59} dy=".3em" className="health-text">
        {state.data.board.tiles[props.tile].occupant.health}
      </text>
    </React.Fragment>
  );

  return state.data.board.tiles[props.tile].occupant.id > 0 ? occupant : null;
};

export default Occupant;
