import React from "react";
import Card from "./Card/Card";
import { useStore } from "../../../hooks-store/store";

const Hand = (props) => {
  const state = useStore()[0];

  const cards = props.data.hand.map((id, index) => {
    const cardClass = state.hand[index + 1].selected ? "-selected" : "";
    return (
      <Card
        key={id}
        id={id}
        index={index + 1}
        data={props.data.cards[id]}
        height="160px"
        width="120px"
        classname={"card" + cardClass}
      />
    );
  });

  return (
    <div
      style={{
        width: "60vw",
        height: props.height,
        justifyContent: "center",
        display: "flex",
        alignSelf: props.align,
      }}
    >
      {cards}
    </div>
  );
};

export default Hand;
