import React from "react";
import images from "../../../../assets/images/cards/images";
import "./Card.css";
import { useStore } from "../../../../hooks-store/store";

const Card = (props) => {
  const [state, dispatch] = useStore();

  const cardHandler = () => {
    if (
      state.hand[props.index].selectable &&
      state.data[props.user].cards[props.id].faeria_cost <=
        state.data[props.user].faeria
    ) {
      const payload = {
        player: props.user,
        opponent: props.opponent,
        hand_id: props.index,
        card_id: props.id,
      };
      if (state.data[props.user].cards[props.id].type === "event") {
        dispatch("SELECT_EVENT", payload);
      } else {
        dispatch("SELECT_CARD", payload);
      }
    }
  };

  const cardDisabled = () => {};

  const clickAction =
    state.data[props.user].mulligan ||
    state.currentAction === "event_choose_occupant"
      ? props.clickAction
      : state.data.status.current !== props.user || props.owner !== props.user
      ? cardDisabled
      : cardHandler;

  const imgSrc =
    props.owner === props.opponent ? images["cardback"] : images[props.data.id];

  return (
    <div className={props.classname} onClick={clickAction}>
      <img
        id={props.index}
        alt=""
        src={imgSrc}
        width={props.width}
        height={parseInt(props.height) - 6 + "px"}
      ></img>
    </div>
  );
};

export default Card;
