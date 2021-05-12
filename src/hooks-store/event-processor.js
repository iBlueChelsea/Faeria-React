export default class EventProcessor {
  constructor(state, data) {
    this.state = state;
    this.data = data;
    this.eventLibrary = {
      0: "processEvent_0",
      5: "processEvent_5",
      6: "processEvent_6",
      7: "processEvent_7",
      9: "processEvent_9",
      11: "processEvent_11",
      17: "processEvent_17",
      23: "processEvent_23",
    };
    this.summonEffectLibrary = {
      8: "processSummonEffect_8",
      14: "processSummonEffect_14",
    };
    this.giftEffectLibrary = {
      1: "processGiftEffect_1",
      16: "processGiftEffect_16",
      22: "processGiftEffect_22",
    };
    this.lastwordEffectLibrary = {
      3: "processLastwordEffect_3",
      24: "processLastwordEffect_24",
    };
    this.productionEffectLibrary = {
      19: "processProductionEffect_19",
      20: "processProductionEffect_20",
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
    this.state.data[this.data.player].faeria -=
      this.state.data[this.data.player].cards[
        this.state.data[this.data.player].hand[selected_card_id - 1]
      ].faeria_cost;
    this.state.data[this.data.player].hand.splice(selected_card_id - 1, 1);
    return this.state;
  }

  processSummonEffect(occupant) {
    this[this.summonEffectLibrary[occupant.id]]();
    return this.state;
  }

  initGiftEffect(occupant) {
    this[this.giftEffectLibrary[occupant.id]]("init", occupant);
    return this.state;
  }

  processGiftEffect(selected_occupant_id) {
    const occupant = this.state.data.board.tiles[selected_occupant_id].occupant;
    this[this.giftEffectLibrary[occupant.id]]("handle", selected_occupant_id);
    this.state.tiles[selected_occupant_id].occupantSelected = false;
    this.state.currentAction = "";
    Object.keys(this.state.hand).forEach((key) => {
      this.state.hand[key].selectable = true;
    });
    if (this.state.data[this.data.player].wheel_neutral_counter !== 1) {
      Object.keys(this.state.wheelbuttons).forEach((key) => {
        this.state.wheelbuttons[key].selectable = true;
      });
    } else {
      this.state.wheelbuttons["wheel-B2"].selectable = true;
    }
    return this.state;
  }

  processLastwordEffect(occupant, tile) {
    this[this.lastwordEffectLibrary[occupant.id]](occupant, tile);
    return this.state;
  }

  processProductionEffect(occupant, tile) {
    this[this.productionEffectLibrary[occupant.id]](tile);
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
        playerCheck.includes(
          this.state.data.board.tiles[key].occupant.player
        ) &&
        !this.state.data.board.tiles[key].occupant.divine
      ) {
        this.state.tiles[key].occupantSelectable = true;
      } else {
        this.state.tiles[key].occupantSelectable = false;
      }
    });
  }

  setSelectStateForConditionalOccupants(friendly, enemy, attack) {
    const playerCheck = [];
    if (friendly) {
      playerCheck.push(this.data.player);
    }
    if (enemy) {
      playerCheck.push(this.data.opponent);
    }
    Object.keys(this.state.data.board.tiles).forEach((key) => {
      if (
        playerCheck.includes(
          this.state.data.board.tiles[key].occupant.player
        ) &&
        !this.state.data.board.tiles[key].occupant.divine &&
        this.state.data.board.tiles[key].occupant.attack <= attack
      ) {
        this.state.tiles[key].occupantSelectable = true;
      } else {
        this.state.tiles[key].occupantSelectable = false;
      }
    });
  }

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
      type: "",
      faeria_cost: 0,
      land_cost: {
        forest: 0,
        desert: 0,
        mountain: 0,
        lake: 0,
        wild: 0,
      },
      attack: 0,
      base_attack: 0,
      health: 0,
      base_health: 0,
      movement: {
        range: 1,
        haste: true,
        dash: 0,
        special: {
          aquatic: false,
          flying: false,
          jump: false,
        },
      },
      taunt: false,
      divine: false,
      protection: false,
      ranged: false,
      hasMoved: false,
      hasDashed: false,
      hasAttacked: false,
      effects: {
        summon: false,
        gift: false,
        lastword: false,
        production: false,
      },
      effectUsed: false,
    };
  }

  setSelectStateForBuildTiles(landtype) {
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
          } else if (landtype === "lake") {
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

  setSelectStateForGods(selectable) {
    Object.keys(this.state.gods).forEach((key) => {
      this.state.gods[key].selectable = selectable;
    });
  }

  getGodTile() {
    const god = {
      player1: "D6",
      player2: "D0",
    };
    return god[this.data.player];
  }

  getLandCostForType(card, type) {
    return this.state.data[this.data.player].cards[card].land_cost[type];
  }

  getLandCostForOccupant(tile, type) {
    return this.state.data.board.tiles[tile].occupant.land_cost[type];
  }

  handleCustomDrawLogic(index) {
    if (index !== -1) {
      if (this.state.data[this.data.player].hand.length < 10) {
        this.state.data[this.data.player].hand.push(
          this.state.data[this.data.player].deck.splice(index, 1)[0]
        );
      } else {
        this.state.data[this.data.player].deck.splice(index, 1);
      }
    }
  }

  getRandomTiles() {
    const randomTiles = Object.keys(this.state.data.board.tiles);
    for (let i = randomTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomTiles[i], randomTiles[j]] = [randomTiles[j], randomTiles[i]];
    }
    return randomTiles;
  }

  getOccupantByID(id, params = {}) {
    switch (id) {
      case 10:
        return {
          player: this.data.player,
          id: 10,
          type: "creature",
          faeria_cost: 1,
          land_cost: { forest: 0, desert: 0, mountain: 0, lake: 1, wild: 0 },
          attack: 1,
          base_attack: 1,
          health: 1,
          base_health: 1,
          movement: {
            range: 1,
            haste: false,
            dash: 0,
            special: {
              aquatic: true,
              flying: false,
              jump: false,
            },
          },
          taunt: false,
          divine: false,
          protection: false,
          ranged: false,
          hasMoved: true,
          hasDashed: false,
          hasAttacked: true,
          effects: {
            summon: false,
            gift: false,
            lastword: false,
            production: false,
          },
          effectUsed: false,
        };
      case 12:
        return {
          player: params.player,
          id: 12,
          type: "creature",
          faeria_cost: 2,
          land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
          attack: 1,
          base_attack: 1,
          health: 1,
          base_health: 1,
          movement: {
            range: 1,
            haste: false,
            dash: 0,
            special: {
              aquatic: false,
              flying: false,
              jump: false,
            },
          },
          taunt: true,
          divine: true,
          protection: true,
          ranged: false,
          hasMoved: true,
          hasDashed: false,
          hasAttacked: true,
          effects: {
            summon: false,
            gift: false,
            lastword: false,
            production: false,
          },
          effectUsed: false,
        };
      case 13:
        return {
          player: this.data.player,
          id: 13,
          type: "creature",
          faeria_cost: 4,
          land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
          attack: 6,
          base_attack: 6,
          health: 4,
          base_health: 4,
          movement: {
            range: 1,
            haste: false,
            dash: 0,
            special: {
              aquatic: false,
              flying: false,
              jump: false,
            },
          },
          taunt: false,
          divine: false,
          protection: false,
          ranged: false,
          hasMoved: params.hasMoved,
          hasDashed: false,
          hasAttacked: params.hasAttacked,
          effects: {
            summon: false,
            gift: false,
            lastword: false,
            production: false,
          },
          effectUsed: false,
        };
      case 21:
        return {
          player: params.player,
          id: 21,
          type: "creature",
          faeria_cost: 2,
          land_cost: { forest: 0, desert: 0, mountain: 2, lake: 0, wild: 0 },
          attack: 2,
          base_attack: 2,
          health: 1,
          base_health: 1,
          movement: {
            range: 1,
            haste: false,
            dash: 0,
            special: {
              aquatic: false,
              flying: true,
              jump: false,
            },
          },
          taunt: false,
          divine: false,
          protection: false,
          ranged: false,
          hasMoved: true,
          hasDashed: false,
          hasAttacked: true,
          effects: {
            summon: false,
            gift: false,
            lastword: false,
            production: false,
          },
          effectUsed: false,
        };
      default:
        return {};
    }
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
      this.setSelectStateForBuildTiles("prairie");
      this.state.currentAction = "event_tile";
    }
    if (process === "handle") {
      this.setSelectStateForOccupants(true, false);
      this.setSelectStateForAllTiles(false);
      this.state.data[this.data.player].faeria += 2;
      this.state.data.board.tiles[this.data.tile_id].type = "prairie";
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
      if (target.health <= 0 && target.effects.lastword) {
        this.processLastwordEffect(target, this.data.tile_id);
      }
    }
  }

  //6 - Cheek in a bottle
  processEvent_6(process) {
    if (process === "handle") {
      for (let i = 0; i < 3; i++) {
        this.handleCustomDrawLogic(
          this.state.data[this.data.player].deck.findIndex(
            (card) => this.getLandCostForType(card, "lake") > 0
          )
        );
      }
    }
  }

  //7 - Cheekie in a lamp
  processEvent_7(process) {
    if (process === "handle") {
      for (let i = 0; i < 2; i++) {
        this.handleCustomDrawLogic(
          this.state.data[this.data.player].deck.findIndex(
            (card) =>
              this.state.data[this.data.player].cards[card].type === "event"
          )
        );
      }
    }
  }

  //9 - Rain of Cheek
  processEvent_9(process) {
    if (process === "handle") {
      let tileAvailable = true;
      const availableTiles = this.getRandomTiles().filter(
        (tile) => !this.state.data.board.tiles[tile].occupant.player
      );
      let count = 0;
      while (tileAvailable) {
        if (availableTiles.length !== 0) {
          this.state.data.board.tiles[availableTiles.splice(0, 1)].occupant =
            this.getOccupantByID(10);
          if (++count === 6) {
            tileAvailable = false;
          }
        } else {
          tileAvailable = false;
        }
      }
    }
  }

  //11 - Mooncheek
  processEvent_11(process) {
    if (process === "handle") {
      Object.keys(this.state.data.board.tiles)
        .filter(
          (key) =>
            this.state.data.board.tiles[key].occupant.player ===
              this.data.player && this.getLandCostForOccupant(key, "lake") > 0
        )
        .forEach((tile) => {
          this.state.data.board.tiles[tile].occupant = this.getOccupantByID(
            13,
            {
              hasAttacked:
                this.state.data.board.tiles[tile].occupant.hasAttacked,
              hasMoved: this.state.data.board.tiles[tile].occupant.hasMoved,
            }
          );
        });
    }
  }

  //17 - Cheekblast
  processEvent_17(process) {
    if (process === "revert") {
      this.setSelectStateForOccupants(true, false);
      this.setSelectStateForGods(false);
      this.state.currentAction = "";
    }
    if (process === "init") {
      this.setSelectStateForOccupants(true, true);
      this.setSelectStateForGods(true);
      this.state.currentAction = "event_occupant";
    }
    if (process === "handle") {
      this.setSelectStateForOccupants(true, false);
      this.setSelectStateForGods(false);
      if (this.data.event === "occupant") {
        const target = this.state.data.board.tiles[this.data.tile_id].occupant;
        target.health -= 3;
        this.state.data.board.tiles[this.data.tile_id].occupant =
          target.health > 0 ? target : this.getRemoveOccupant();
        if (target.health <= 0 && target.effects.lastword) {
          this.processLastwordEffect(target, this.data.tile_id);
        }
      }
      if (this.data.event === "god") {
        this.state.data.board.gods[this.data.god].health -= 3;
        if (this.state.data.board.gods[this.data.god].health <= 0) {
          this.state.data.status.finished = true;
          this.state.data.status.winner =
            this.state.gods[this.data.god].player === this.data.opponent
              ? this.data.player
              : this.data.opponent;
        }
      }
    }
  }

  //23 - Cheekruption
  processEvent_23(process) {
    if (process === "handle") {
      Object.keys(this.state.data.board.tiles)
        .filter(
          (key) =>
            this.state.data.board.tiles[key].occupant.player ===
            this.data.opponent
        )
        .forEach((tile) => {
          const target = this.state.data.board.tiles[tile].occupant;
          target.health -= 2;
          this.state.data.board.tiles[tile].occupant =
            target.health > 0 ? target : this.getRemoveOccupant();
          if (target.health <= 0 && target.effects.lastword) {
            this.processLastwordEffect(target, tile);
          }
        });
    }
  }

  //Creatures - Summon Effects

  //8 - Cheek lord
  processSummonEffect_8() {
    const anyAdjacentOccupant = (tile) =>
      this.state.data.board.tiles[tile].occupant.player === this.data.player &&
      this.state.data.board.tiles[tile].occupant.land_cost.lake > 0;
    if (
      this.state.tiles[this.data.tile_id].adjacent.some(anyAdjacentOccupant)
    ) {
      this.state.data.board.tiles[this.data.tile_id].occupant.attack++;
      this.state.data.board.tiles[this.data.tile_id].occupant.health++;
    }
  }

  //14 - Cheekcano
  processSummonEffect_14() {
    Object.keys(this.state.data.board.tiles)
      .filter(
        (key) =>
          this.state.data.board.tiles[key].occupant.player ===
          this.data.opponent
      )
      .forEach((tile) => {
        const target = this.state.data.board.tiles[tile].occupant;
        target.health -= 1;
        this.state.data.board.tiles[tile].occupant =
          target.health > 0 ? target : this.getRemoveOccupant();
        if (target.health <= 0 && target.effects.lastword) {
          this.processLastwordEffect(target, tile);
        }
      });
  }

  //Creatures - Lastword Effects

  //3 - Clamcheek
  processLastwordEffect_3(occupant, tile) {
    this.state.data.board.tiles[tile].occupant = this.getOccupantByID(12, {
      player: occupant.player,
    });
  }

  //24 - Suncheek
  processLastwordEffect_24(occupant, tile) {
    this.state.tiles[tile].adjacent.forEach((adjTile) => {
      if (
        this.state.data.board.tiles[adjTile].occupant.player !==
          occupant.player &&
        this.state.data.board.tiles[adjTile].occupant.player
      ) {
        const target = this.state.data.board.tiles[adjTile].occupant;
        target.health -= 5;
        this.state.data.board.tiles[adjTile].occupant =
          target.health > 0 ? target : this.getRemoveOccupant();
        if (target.health <= 0 && target.effects.lastword) {
          this.processLastwordEffect(target, adjTile);
        }
      }
    });
  }

  //Creatures - Gift Effects

  //1 - Mercheek
  processGiftEffect_1(process, selected_occupant_id) {
    if (process === "init") {
      this.setSelectStateForConditionalOccupants(false, true, 2);
      this.setSelectStateForAllTiles(false);
      this.state.tiles[this.data.tile_id].occupantSelected = true;
      this.state.tiles[this.data.tile_id].occupantSelectable = true;
      this.state.currentAction = "gift_occupant";
    }
    if (process === "handle") {
      if (this.data.tile_id !== selected_occupant_id) {
        this.state.data.board.tiles[this.data.tile_id].occupant.player =
          this.data.player;
        this.state.data.board.tiles[this.data.tile_id].occupant.hasMoved = true;
        this.state.data.board.tiles[
          this.data.tile_id
        ].occupant.hasAttacked = true;
      }
      this.setSelectStateForOccupants(true, false);
    }
  }

  //16 - Cheekflame
  processGiftEffect_16(process, selected_occupant_id) {
    if (process === "init") {
      this.setSelectStateForOccupants(false, true);
      this.setSelectStateForAllTiles(false);
      this.state.tiles[this.data.tile_id].occupantSelected = true;
      this.state.tiles[this.data.tile_id].occupantSelectable = true;
      this.state.currentAction = "gift_occupant";
    }
    if (process === "handle") {
      if (this.data.tile_id !== selected_occupant_id) {
        const target = this.state.data.board.tiles[this.data.tile_id].occupant;
        target.health -= 1;
        this.state.data.board.tiles[this.data.tile_id].occupant =
          target.health > 0 ? target : this.getRemoveOccupant();
        if (target.health <= 0 && target.effects.lastword) {
          this.processLastwordEffect(target, this.data.tile_id);
        }
      }
      this.setSelectStateForOccupants(true, false);
    }
  }

  //22 - Ghostcheek Alchemist
  processGiftEffect_22(process, selected_occupant_id) {
    if (process === "init") {
      this.setSelectStateForOccupants(false, true);
      this.setSelectStateForAllTiles(false);
      this.state.tiles[this.data.tile_id].occupantSelected = true;
      this.state.tiles[this.data.tile_id].occupantSelectable = true;
      this.state.currentAction = "gift_occupant";
    }
    if (process === "handle") {
      if (this.data.tile_id !== selected_occupant_id) {
        this.state.data.board.tiles[this.data.tile_id].occupant =
          this.getOccupantByID(21, {
            player: this.data.opponent,
          });
      }
      this.setSelectStateForOccupants(true, false);
    }
  }

  //Creatures - Production Effects

  //19 - Baby Cheekdevil
  processProductionEffect_19(tile) {
    this.state.data.board.tiles[tile].occupant.attack += 1;
    this.state.data.board.tiles[tile].occupant.health += 1;
  }

  //20 - Ghostcheek Tower
  processProductionEffect_20(tile) {
    const availableTiles = this.getRandomTiles().filter(
      (tile) => !this.state.data.board.tiles[tile].occupant.player
    );
    if (availableTiles.length !== 0) {
      this.state.data.board.tiles[availableTiles.splice(0, 1)].occupant =
        this.getOccupantByID(21, {
          player: this.state.data.board.tiles[tile].occupant.player,
        });
    }
  }
}
