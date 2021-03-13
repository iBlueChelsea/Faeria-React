import React from "react";
import Card from "./Card/Card";
import { useStore } from "../../../hooks-store/store";

const Hand = (props) => {
  const [state, dispatch] = useStore();

  const cards = props.data.hand.map((id, index) => {
    console.log(state.hand[index + 1].selected);
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
        width: "1134px",
        height: "166px",
        justifyContent: "center",
        display: "flex",
      }}
    >
      {cards}
    </div>
  );
};

export default Hand;
