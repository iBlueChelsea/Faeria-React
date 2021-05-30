import React from "react";
import "./ChooseModal.css";
import Card from "../../Game/Hand/Card/Card";
import { useStore } from "../../../hooks-store/store";

const ChooseModal = (props) => {
  const [state, dispatch] = useStore();

  const chooseHandler = (event) => {
    const payload = {
      id: state.chooseParams.cards[event.target.id],
      tile: state.chooseParams.tile,
      player: props.user,
      opponent: props.opponent,
    };
    dispatch("CHOOSE_CARD", payload);
  };

  const cards = state.chooseParams.cards.map((id, index) => {
    return (
      <Card
        key={id}
        id={id}
        index={index}
        data={{ id: id }}
        height="486px"
        width="360px"
        clickAction={chooseHandler}
        classname="card-choose"
        user={props.user}
        opponent={props.opponent}
        owner={props.user}
      />
    );
  });

  return (
    <div className="modal">
      <div style={{ justifyContent: "center", display: "flex", height: "75%" }}>
        {cards}
      </div>
    </div>
  );
};

export default ChooseModal;
