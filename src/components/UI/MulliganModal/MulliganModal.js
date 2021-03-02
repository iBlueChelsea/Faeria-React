import React, {useState, useEffect} from "react";
import "./MulliganModal.css";
import Card from "../../Game/Hand/Card/Card";
import { useStore } from "../../../hooks-store/store";

const MulliganModal = () => {
    const [state,dispatch] = useStore();
    const [initialHand,setInitialHand] = useState({0: false, 1: false, 2: false});
    const user = 'player1';
    
    const swapHandler = (event) => {
        const newHand = JSON.parse(JSON.stringify(initialHand));
        newHand[event.target.id] = !newHand[event.target.id];
        setInitialHand(newHand);
    }

    const classname = (index) => {
        return (!initialHand[index]) ? 'card-mulligan' : 'card-mulligan-selected';
    }

    const cards = state.data[user].deck.slice(0,3).map((id,index) => {
        return (
          <Card
            key={id}
            id={id}
            index={index}
            data={state.data[user].cards[id]}
            height="480px"
            width="360px"
            clickAction={swapHandler}
            classname={classname(index)}
          />
        );
    });

    const confirmHandler = () => {
        const payload = {player: user,initialHand: initialHand};
        dispatch('CONFIRM_MULLIGAN',payload);
    }

    return (
        <div className="modal">
            <div style={{justifyContent: "center", display: "flex", height: "75%"}}>
            {cards}
            </div>
            <div style={{justifyContent: "center", display: "flex"}}>
                <div className="modal-confirm" onClick={confirmHandler}>CONFIRM</div>
            </div>
        </div>
    );
}

export default MulliganModal;