import React, {useEffect} from "react";
import Board from "./Board/Board";
import Hand from "./Hand/Hand";
import Wheel from "./Wheel/Wheel";
import Infobox from "../UI/Infobox/Infobox";
import react_state from "../../assets/json/react_state.json";
import MulliganModal from "../UI/MulliganModal/MulliganModal";
import {useStore} from "../../hooks-store/store";

const Game = () => {
  const [state, dispatch] = useStore();
  const user = 'player1';
  
  useEffect(() => {
    //dispatch('GET_DATA',react_state);
    dispatch('SHUFFLE_DECK',user);
  },[]);

  const mulligan = (state.data[user].mulligan) ? <MulliganModal /> : null;

  return (
    <div style={{display: "flex" }}>
      {mulligan}
      <div style={{width: "100%", position: "relative", display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
        <Infobox 
          align="flex-start"
          data={state.data.player2}
          tiles={state.data.board.tiles}
          player="player2"
        />
        <Infobox 
          align="flex-end"
          data={state.data.player1}
          tiles={state.data.board.tiles}
          player="player1"
        />
      </div>
      <div style={{width: "100%"}}>
        <Hand data={state.data.player2} />
        <Board data={state.data.board} />
        <Hand data={state.data.player1} />
      </div>
      <div style={{width: "100%", position: "relative"}}>
        <Wheel />
      </div>
    </div>
  );
};

export default Game;
