import React from "react";
import Card from "./Card/Card";
import {useStore} from "../../../hooks-store/store";

const Hand = (props) => {
  const [state,dispatch] = useStore();

  const cards = props.data.hand.map((id) => {
    return (
      <Card
        key={id}
        id={id}
        data={props.data.cards[id]}
        height="160px"
        width="120px"
        classname='card'
      />
    );
  });

  return (
    <div style={{ width: "1134px", height: "166px", justifyContent: "center", display: "flex"}}>
      {cards}
    </div>
  );
};

export default Hand;