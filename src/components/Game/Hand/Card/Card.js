import React from "react";
import images from "../../../../assets/images/cards/images";
import "./Card.css";
import { useStore } from "../../../../hooks-store/store";

const Card = (props) => {
  const [state, dispatch] = useStore();
  const user = "player1";
  const opponent = "player2";

  const cardHandler = () => {
    if (state.hand[props.index].selectable && state.data[user].cards[props.id].faeria_cost <= state.data[user].faeria) {
      const payload = { player: user, opponent: opponent, hand_id: props.index, card_id: props.id };
      if (state.data[user].cards[props.id].type === 'event') {
        dispatch("SELECT_EVENT", payload);
      } else {
        dispatch("SELECT_CARD", payload);
      }
    }
  };

  const clickAction = (state.currentAction === "mulligan") ? props.clickAction : cardHandler;

  return (
    <div className={props.classname} onClick={clickAction}>
      <img
        id={props.index}
        alt=""
        src={images[props.data.id]}
        width={props.width}
        height={props.height}
      ></img>
    </div>
  );
};

export default Card;
