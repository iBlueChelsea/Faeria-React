import React, {useEffect} from "react";
import Board from "./Board/Board";
import Hand from "./Hand/Hand";
import Wheel from "./Wheel/Wheel";
import Infobox from "../UI/Infobox/Infobox";
import MulliganModal from "../UI/MulliganModal/MulliganModal";
import {useStore} from "../../hooks-store/store";

const Game = () => {
  const [state, dispatch] = useStore();
  const user = "player1";
  const opponent = "player2";
  
  useEffect(() => {
    //dispatch('GET_DATA',react_state);
    dispatch('SHUFFLE_DECK',user);
  },[]); // eslint-disable-line react-hooks/exhaustive-deps

  const mulligan = (state.data[user].mulligan) ? <MulliganModal /> : null;

  return (
    <div style={{display: "flex", height: "100vh" }}>
      {mulligan}
      <div style={{width: "20vw", position: "relative", display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
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
      <div style={{width: "60vw", display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
        <Hand data={state.data[opponent]} owner={opponent} height="30px" align="flex-start" />
        <Board data={state.data.board} />
        <Hand data={state.data[user]} owner={user} height="inherit" align="flex-end"/>
      </div>
      <div style={{width: "20vw", position: "relative", display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
        <Wheel />
      </div>
    </div>
  );
};

export default Game;
