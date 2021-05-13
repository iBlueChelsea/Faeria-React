import React from "react";
import Card from "./Card/Card";
import { useStore } from "../../../hooks-store/store";

const Hand = (props) => {
  const state = useStore()[0];

  const cards = props.data.hand.map((id, index) => {
    const cardClass =
      state.hand[index + 1].selected && props.user === props.owner
        ? "-selected"
        : "";
    const cardOwner = props.user === props.owner ? "card" : "enemy-card";
    return (
      <Card
        key={id}
        id={id}
        index={index + 1}
        data={props.data.cards[id]}
        height={props.height}
        width="120px"
        classname={cardOwner + cardClass}
        user={props.user}
        opponent={props.opponent}
        owner={props.owner}
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
