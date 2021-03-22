export default class EventProcessor {
  constructor(state, data) {
    this.state = state;
    this.data = data;
    this.eventLibrary = {
      0: "processEvent_0",
      5: "processEvent_5",
    };
  }
  initEventLogic() {
    const newHand = this.state.hand;
    newHand[this.data.hand_id].selected = !newHand[this.data.hand_id].selected;
    if (newHand[this.data.hand_id].selected) {
      this[
        this.eventLibrary[
          this.state.data[this.data.player].cards[this.data.card_id].id
        ]
      ]("init");
    } else {
      this[
        this.eventLibrary[
          this.state.data[this.data.player].cards[this.data.card_id].id
        ]
      ]("revert");
    }
    Object.keys(newHand).forEach((key) => {
      if (parseInt(key) !== this.data.hand_id) {
        newHand[key].selectable = !newHand[key].selectable;
      }
    });
    this.state.hand = newHand;
    if (this.state.data[this.data.player].wheel_neutral_counter !== 1) {
      Object.keys(this.state.wheelbuttons).forEach((key) => {
        if (newHand[this.data.hand_id].selected) {
          this.state.wheelbuttons[key].selectable = false;
        } else {
          this.state.wheelbuttons[key].selectable = true;
        }
      });
    } else {
      if (newHand[this.data.hand_id].selected) {
        this.state.wheelbuttons["wheel-B2"].selectable = true;
      } else {
        this.state.wheelbuttons["wheel-B2"].selectable = true;
      }
    }
    return this.state;
  }
  handleEventLogic() {
    const selected_card_id = this.getSelectedCard();
    this[
      this.eventLibrary[
        this.state.data[this.data.player].cards[
          this.state.data[this.data.player].hand[selected_card_id - 1]
        ].id
      ]
    ]("handle");
    const newHand = this.state.hand;
    newHand[selected_card_id].selected = !newHand[selected_card_id].selected;
    Object.keys(newHand).forEach((key) => {
      newHand[key].selectable = true;
    });
    this.state.hand = newHand;
    if (this.state.data[this.data.player].wheel_neutral_counter !== 1) {
      Object.keys(this.state.wheelbuttons).forEach((key) => {
        this.state.wheelbuttons[key].selectable = true;
      });
    } else {
      this.state.wheelbuttons["wheel-B2"].selectable = true;
    }
    this.state.currentAction = "";
    this.state.data[this.data.player].faeria -= this.state.data[
      this.data.player
    ].cards[
      this.state.data[this.data.player].hand[selected_card_id - 1]
    ].faeria_cost;
    this.state.data[this.data.player].hand.splice(selected_card_id - 1, 1);
    return this.state;
  }

  //HELPERS

  setSelectStateForOccupants(friendly, enemy) {
    const playerCheck = [];
    if (friendly) {
      playerCheck.push(this.data.player);
    }
    if (enemy) {
      playerCheck.push(this.data.opponent);
    }
    Object.keys(this.state.data.board.tiles).forEach((key) => {
      if (
        playerCheck.includes(this.state.data.board.tiles[key].occupant.player)
      ) {
        this.state.tiles[key].occupantSelectable = true;
      } else {
        this.state.tiles[key].occupantSelectable = false;
      }
    });
  }
  setSelectStateForTiles() {}
  setSelectStateForGods() {}
  getSelectedCard() {
    return parseInt(
      Object.keys(this.state.hand).filter(
        (key) => this.state.hand[key].selected
      )[0]
    );
  }
  getRemoveOccupant() {
    return {
      player: "",
      id: 0,
      attack: 0,
      base_attack: 0,
      health: 0,
      base_health: 0,
      movement: {
        range: 1,
        special: {
          aquatic: false,
          flying: false,
          jump: false,
        },
      },
      ranged: false,
      hasMoved: false,
      hasAttacked: false,
      effectUsed: false,
    };
  }
  setSelectStateForBuildTiles() {
    const newTileState = this.state.tiles;
    const anyAdjacent = (tile) =>
      this.state.data.board.tiles[tile].owner === this.data.player;
    const anyAdjacentFromOccupant = (tile) =>
      this.state.data.board.tiles[tile].occupant.player === this.data.player &&
      this.state.data.board.tiles[tile].type !== "none";
    const god_key = Object.keys(this.state.gods).filter(
      (god) => this.state.gods[god].player === this.data.player
    );
    Object.keys(newTileState).forEach((key) => {
      let tileType = this.state.data.board.tiles[key].type;
      let tileOwner = this.state.data.board.tiles[key].owner;
      if (
        tileType === "none" ||
        (tileType === "prairie" && tileOwner === this.data.player)
      ) {
        if (
          newTileState[key].adjacent.some(anyAdjacent) ||
          newTileState[key].adjacent.some(anyAdjacentFromOccupant) ||
          this.state.gods[god_key].adjacent.includes(key)
        ) {
          if (
            !this.state.data.board.tiles[key].occupant.movement.special.aquatic
          ) {
            newTileState[key].selectable = true;
          } else if (
            this.state.wheelbuttons[this.data.wheelbutton_id].action === "lake"
          ) {
            newTileState[key].selectable = true;
          }
        }
      }
    });
    this.state.tiles = newTileState;
  }

  setSelectStateForAllTiles(selectable) {
    Object.keys(this.state.tiles).forEach((key) => {
      this.state.tiles[key].selectable = selectable;
    });
  }

  //EVENTS

  //0 - Explore
  processEvent_0(process) {
    if (process === "revert") {
      this.setSelectStateForOccupants(true, false);
      this.setSelectStateForAllTiles(false);
      this.state.currentAction = "";
    }
    if (process === "init") {
      this.setSelectStateForOccupants(false, false);
      this.setSelectStateForBuildTiles();
      this.state.currentAction = "event_tile";
    }
    if (process === "handle") {
      this.setSelectStateForOccupants(true, false);
      this.setSelectStateForAllTiles(false);
      this.state.data[this.data.player].faeria += 2;
      this.state.data.board.tiles[this.data.tile_id].type = 'prairie';
      this.state.data.board.tiles[this.data.tile_id].owner = this.data.player;
    }
  }

  //5 - Song of the Mercheek
  processEvent_5(process) {
    if (process === "revert") {
      this.setSelectStateForOccupants(true, false);
      this.state.currentAction = "";
    }
    if (process === "init") {
      this.setSelectStateForOccupants(true, true);
      this.state.currentAction = "event_occupant";
    }
    if (process === "handle") {
      this.setSelectStateForOccupants(true, false);
      const target = this.state.data.board.tiles[this.data.tile_id].occupant;
      target.health = Math.floor(target.health / 2);
      target.attack =
        Math.floor(target.attack / 2) >= 0 ? Math.floor(target.attack / 2) : 0;
      this.state.data.board.tiles[this.data.tile_id].occupant =
        target.health > 0 ? target : this.getRemoveOccupant();
    }
  }
}
