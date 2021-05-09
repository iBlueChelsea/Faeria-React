import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import configureStore from "./hooks-store/global-store";
import axios from "axios";

let loadStore = {};
const formdata = new FormData();
formdata.append("id", document.getElementById("game_id").value);
axios
  .post("http://localhost/faeria/Faeria/utils/getState.php", formdata)
  .then((res) => {
    loadStore = JSON.parse(res.data);
    configureStore(loadStore);
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById("game")
    );
  });
