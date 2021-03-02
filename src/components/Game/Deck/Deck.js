import React from "react";

const Deck = (props) => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ border: "5px solid #001920" }}>Deck: {props.deckcounter}</div>
      <div style={{ border: "5px solid #001920" }}>Hand: {props.handcounter}</div>
    </div>
  );
};

export default Deck;
