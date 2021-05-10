import React, { useState } from "react";
import "./MulliganModal.css";
import Card from "../../Game/Hand/Card/Card";
import { useStore } from "../../../hooks-store/store";
import axios from "axios";

const MulliganModal = (props) => {
  const [state, dispatch] = useStore();
  const [initialHand, setInitialHand] = useState({
    0: false,
    1: false,
    2: false,
  });
  const [btnDisabled, setBtnDisabled] = useState(false);

  const swapHandler = (event) => {
    const newHand = JSON.parse(JSON.stringify(initialHand));
    newHand[event.target.id] = !newHand[event.target.id];
    setInitialHand(newHand);
  };

  const classname = (index) => {
    return !initialHand[index] ? "card-mulligan" : "card-mulligan-selected";
  };

  const cards = state.data[props.user].deck.slice(0, 3).map((id, index) => {
    return (
      <Card
        key={id}
        id={id}
        index={index}
        data={state.data[props.user].cards[id]}
        height="486px"
        width="360px"
        clickAction={swapHandler}
        classname={classname(index)}
        user={props.user}
        opponent={props.opponent}
        owner={props.user}
      />
    );
  });

  const confirmHandler = () => {
    if (btnDisabled) {
      return;
    }
    setBtnDisabled(true);
    const newState = JSON.parse(JSON.stringify(state));
    const getdata = new FormData();
    getdata.append("id", props.id);
    axios
      .post("https://cheekia.loca.lt/faeria/Faeria/utils/getState.php", getdata)
      .then((res) => {
        const prevState = JSON.parse(res.data);
        newState.data[props.opponent] = prevState.data[props.opponent];
        const prevHand = newState.data[props.user].deck.slice(0, 3);
        const cardsToReplace = [];
        const newHand = [];
        for (let i = 0; i < prevHand.length; i++) {
          if (initialHand[i]) {
            cardsToReplace.push(
              newState.data[props.user].cards[prevHand[i]].id
            );
          } else {
            newHand.push(parseInt(prevHand[i]));
          }
        }
        const replacePool = Object.entries(
          newState.data[props.user].cards
        ).filter(
          (card) =>
            !cardsToReplace.includes(card[1].id) &&
            !newHand.includes(parseInt(card[0])) &&
            parseInt(card[0]) !== 0
        );
        for (let i = 0; i < cardsToReplace.length; i++) {
          let random = Math.floor(Math.random() * replacePool.length);
          newHand.push(parseInt(replacePool[random][0]));
          replacePool.splice(random, 1);
        }
        const shuffledDeck = [];
        const prevDeck = newState.data[props.user].deck.filter(
          (card) => !newHand.includes(card)
        );
        const deckLength = prevDeck.length;
        for (let i = 0; i < deckLength; i++) {
          let random = Math.floor(Math.random() * prevDeck.length);
          shuffledDeck.push(prevDeck[random]);
          prevDeck.splice(random, 1);
        }
        if (props.user === "player2") {
          newHand.push(0);
        }
        newState.data[props.user].deck = shuffledDeck;
        newState.data[props.user].hand = newHand;
        newState.data[props.user].mulligan = false;
        const postdata = new FormData();
        postdata.append("react_state", JSON.stringify(newState));
        postdata.append("id", props.id);
        axios
          .post(
            "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
            postdata
          )
          .then(() => {
            dispatch("CONFIRM_MULLIGAN", newState);
          })
          .catch((error) => {
            console.log("Network Error", error.message);
          });
      })
      .catch((error) => {
        console.log("Network Error", error.message);
      });
  };

  return (
    <div className="modal">
      <div style={{ justifyContent: "center", display: "flex", height: "75%" }}>
        {cards}
      </div>
      <div style={{ justifyContent: "center", display: "flex" }}>
        <div className="modal-confirm" onClick={confirmHandler}>
          CONFIRM
        </div>
      </div>
    </div>
  );
};

export default MulliganModal;
