import React from "react";
import Faeria from "../../Game/Faeria/Faeria";
import Deck from "../../Game/Deck/Deck";
import Hexagon from "../Hexagon/Hexagon";
import "./Infobox.css";

const Infobox = (props) => {
  const landCount = getLandCount(props.tiles, props.player);
  const align = props.align;
  const hexSize = 20;
  const landCounter = Object.keys(landCount).map((column, i) => {
    return (
      <g key={column} id={column}>
        <Hexagon
          className={column}
          hexSize={hexSize}
          startPosX={hexSize * i * 2.5 + 8}
          startPosY={hexSize - hexSize * Math.sqrt(3) * 0.5}
        />
        <text
          x={hexSize * i * 2.5 + hexSize + 8}
          y={
            hexSize * Math.sqrt(3) * 0.5 +
            (hexSize - hexSize * Math.sqrt(3) * 0.5)
          }
          className={column + "-text"}
          fontSize={hexSize}
          dy=".3em"
        >
          {landCount[column]}
        </text>
      </g>
    );
  });
  const info_landcounter = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg height={hexSize * 2} width="208px" display="block" margin="auto">
        {landCounter}
      </svg>
    </div>
  );
  const info_faeria = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Faeria faeria={props.data.faeria} />
    </div>
  );
  const info_player = (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "50%",
          border: "5px solid #001920",
          textAlign: "center",
        }}
      >
        <b>{props.data.name}</b>
      </div>
    </div>
  );
  const info =
    align === "flex-end" ? (
      <React.Fragment>
        {info_landcounter}
        {info_faeria}
        {info_player}
        <Deck
          deckcounter={props.data.deck.length}
          handcounter={props.data.hand.length}
        />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <Deck
          deckcounter={props.data.deck.length}
          handcounter={props.data.hand.length}
        />
        {info_player}
        {info_faeria}
        {info_landcounter}
      </React.Fragment>
    );
  return (
    <div
      style={{
        alignSelf: align,
        margin: "25px",
      }}
    >
      {info}
    </div>
  );
};

function getLandCount(tiles, player) {
  let lands = { f: 0, l: 0, m: 0, d: 0 };
  Object.values(tiles).forEach((tile) => {
    if (tile.owner === player && tile.type.charAt(0) !== "p") {
      lands[tile.type.charAt(0)] += 1;
    }
  });
  return lands;
}

export default Infobox;
