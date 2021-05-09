import React, { useEffect } from "react";
import Board from "./Board/Board";
import Hand from "./Hand/Hand";
import Wheel from "./Wheel/Wheel";
import Infobox from "../UI/Infobox/Infobox";
import MulliganModal from "../UI/MulliganModal/MulliganModal";
import { useStore } from "../../hooks-store/store";
import axios from "axios";

const Game = () => {
  const [state, dispatch] = useStore();
  const user = document.getElementById("user").value;
  const opponent = document.getElementById("opponent").value;
  const id = document.getElementById("game_id").value;

  console.log("GET_DATA:");
  console.log(state);

  useEffect(() => {
    if (!state.data[user].shuffle) {
      const payload = { player: user, opponent: opponent, id: id };
      dispatch("SHUFFLE_DECK", payload);
    }
    if (
      (state.data.status.current === opponent && !state.data[user].mulligan) ||
      (!state.data[user].mulligan && state.data[opponent].mulligan)
    ) {
      const timer = setTimeout(() => {
        const formdata = new FormData();
        formdata.append("id", id);
        let timestamp = Date.now();
        axios
          .post(
            "http://localhost/faeria/Faeria/utils/getState.php?timestamp=" +
              timestamp,
            formdata
          )
          .then((res) => {
            dispatch("SET_DATA", JSON.parse(res.data));
          });
      }, 500);
      return () => clearTimeout(timer);
    }
  });

  const mulligan = state.data[user].mulligan ? (
    <MulliganModal user={user} opponent={opponent} id={id} />
  ) : null;

  const output = state.data.status.finished ? (
    <h1 style={{ textAlign: "center" }}>
      WINNER: {state.data[state.data.status.winner].name}
    </h1>
  ) : (
    <div style={{ display: "flex", height: "100vh" }}>
      {mulligan}
      <div
        style={{
          width: "20vw",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Infobox
          align="flex-start"
          data={state.data[opponent]}
          tiles={state.data.board.tiles}
          player={opponent}
        />
        <Infobox
          align="flex-end"
          data={state.data[user]}
          tiles={state.data.board.tiles}
          player={user}
        />
      </div>
      <div
        style={{
          width: "60vw",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Hand
          data={state.data[opponent]}
          owner={opponent}
          height="36px"
          align="flex-start"
          user={user}
          opponent={opponent}
        />
        <Board data={state.data.board} user={user} opponent={opponent} />
        <Hand
          data={state.data[user]}
          owner={user}
          height="166px"
          align="flex-end"
          user={user}
          opponent={opponent}
        />
      </div>
      <div
        style={{
          width: "20vw",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Wheel
          data={state.data.status}
          user={user}
          opponent={opponent}
          id={id}
        />
      </div>
    </div>
  );

  return output;
};

export default Game;
