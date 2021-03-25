import { initStore } from "./store";
import EventProcessor from "./event-processor";

const configureStore = () => {
  const actions = {
    GET_DATA: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      //axios get
      updatedState.data = data;
      return updatedState;
    },
    SHUFFLE_DECK: (currentState, player) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.currentAction = "mulligan";
      const shuffledDeck = [];
      for (let i = 0; i < currentState.data[player].deck.length; i++) {
        let random = Math.floor(
          Math.random() * updatedState.data[player].deck.length
        );
        shuffledDeck.push(updatedState.data[player].deck[random]);
        updatedState.data[player].deck.splice(random, 1);
      }
      //axios post
      updatedState.data[player].deck = shuffledDeck;
      return updatedState;
    },
    CONFIRM_MULLIGAN: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.currentAction = "";
      const prevHand = updatedState.data[data.player].deck.slice(0, 3);
      const cardsToReplace = [];
      const newHand = [];
      for (let i = 0; i < prevHand.length; i++) {
        if (data.initialHand[i]) {
          cardsToReplace.push(
            updatedState.data[data.player].cards[prevHand[i]].id
          );
        } else {
          newHand.push(parseInt(prevHand[i]));
        }
      }
      const replacePool = Object.entries(
        updatedState.data[data.player].cards
      ).filter(
        (card) =>
          !cardsToReplace.includes(card[1].id) &&
          !newHand.includes(parseInt(card[0]))
      );
      for (let i = 0; i < cardsToReplace.length; i++) {
        let random = Math.floor(Math.random() * replacePool.length);
        newHand.push(parseInt(replacePool[random][0]));
        replacePool.splice(random, 1);
      }
      const shuffledDeck = [];
      const prevDeck = updatedState.data[data.player].deck.filter(
        (card) => !newHand.includes(card)
      );
      const deckLength = prevDeck.length;
      for (let i = 0; i < deckLength; i++) {
        let random = Math.floor(Math.random() * prevDeck.length);
        shuffledDeck.push(prevDeck[random]);
        prevDeck.splice(random, 1);
      }
      if (data.player === "player1") {
        newHand.push(0);
      }
      updatedState.data[data.player].deck = shuffledDeck;
      updatedState.data[data.player].hand = newHand;
      updatedState.data[data.player].mulligan = false;
      return updatedState;
    },
    SELECT_LAND: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const newWheelState = updatedState.wheelbuttons;
      newWheelState[data.wheelbutton_id].selected = !newWheelState[
        data.wheelbutton_id
      ].selected;
      if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
        Object.keys(newWheelState).forEach((key) => {
          if (key !== data.wheelbutton_id) {
            newWheelState[key].selectable = !newWheelState[key].selectable;
          }
        });
      }
      if (newWheelState[data.wheelbutton_id].selected) {
        Object.keys(updatedState.hand).forEach((key) => {
          updatedState.hand[key].selectable = false;
        });
        Object.keys(updatedState.tiles).forEach((key) => {
          updatedState.tiles[key].occupantSelectable = false;
        });
      } else {
        Object.keys(updatedState.hand).forEach((key) => {
          updatedState.hand[key].selectable = true;
        });
        Object.keys(updatedState.tiles).forEach((key) => {
          updatedState.tiles[key].occupantSelectable = true;
        });
      }
      updatedState.wheelbuttons = newWheelState;
      const newTileState = updatedState.tiles;
      const anyAdjacent = (tile) =>
        updatedState.data.board.tiles[tile].owner === data.player;
      const anyAdjacentFromOccupant = (tile) =>
        updatedState.data.board.tiles[tile].occupant.player === data.player &&
        updatedState.data.board.tiles[tile].type !== "none";
      const god_key = Object.keys(updatedState.gods).filter(
        (god) => updatedState.gods[god].player === data.player
      );
      if (updatedState.wheelbuttons[data.wheelbutton_id].selected) {
        Object.keys(newTileState).forEach((key) => {
          let tileType = updatedState.data.board.tiles[key].type;
          let tileOwner = updatedState.data.board.tiles[key].owner;
          if (
            tileType === "none" ||
            (tileType === "prairie" && tileOwner === data.player)
          ) {
            if (
              newTileState[key].adjacent.some(anyAdjacent) ||
              newTileState[key].adjacent.some(anyAdjacentFromOccupant) ||
              updatedState.gods[god_key].adjacent.includes(key)
            ) {
              if (
                !updatedState.data.board.tiles[key].occupant.movement.special
                  .aquatic
              ) {
                newTileState[key].selectable = true;
              } else if (
                updatedState.wheelbuttons[data.wheelbutton_id].action === "lake"
              ) {
                newTileState[key].selectable = true;
              }
            }
          }
        });
      } else {
        Object.keys(newTileState).forEach((key) => {
          newTileState[key].selectable = false;
        });
      }
      updatedState.tiles = newTileState;
      return updatedState;
    },
    DRAW_CARD: (currentState, player) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const god = {
        player1: "D6",
        player2: "D0",
      };
      if (updatedState.data[player].deck.length > 0) {
        if (updatedState.data[player].hand.length < 9) {
          updatedState.data[player].hand.push(
            updatedState.data[player].deck.splice(0, 1)[0]
          );
        } else {
          updatedState.data[player].deck.splice(0, 1);
        }
      } else {
        updatedState.data.board.gods[god[player]].health -= ++updatedState.data[
          player
        ].health_dmg;
      }
      updatedState.data[player].wheel_used = true;
      return updatedState;
    },
    PLUS_FAERIA: (currentState, player) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.data[player].faeria++;
      updatedState.data[player].wheel_used = true;
      return updatedState;
    },
    BUILD_TILE: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      let type = "none";
      Object.values(updatedState.wheelbuttons).forEach((wheelbutton) => {
        if (wheelbutton.selected) {
          type = wheelbutton.action;
        }
      });
      updatedState.data.board.tiles[data.tile_id].type = type;
      updatedState.data.board.tiles[data.tile_id].owner = data.player;
      const wheelbutton_id = Object.keys(updatedState.wheelbuttons).filter(
        (key) => updatedState.wheelbuttons[key].selected
      );
      updatedState.wheelbuttons[wheelbutton_id].selected = false;
      Object.keys(updatedState.tiles).forEach((key) => {
        updatedState.tiles[key].selectable = false;
        updatedState.tiles[key].occupantSelectable = true;
      });
      Object.keys(updatedState.hand).forEach((key) => {
        updatedState.hand[key].selectable = true;
      });
      if (type === "prairie") {
        updatedState.data[data.player].wheel_neutral_counter += 1;
      }
      if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
        Object.keys(updatedState.wheelbuttons).forEach((key) => {
          updatedState.wheelbuttons[key].selectable = true;
        });
        updatedState.data[data.player].wheel_used = true;
        updatedState.data[data.player].wheel_neutral_counter = 0;
      }
      return updatedState;
    },
    SELECT_CARD: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const newHand = updatedState.hand;
      newHand[data.hand_id].selected = !newHand[data.hand_id].selected;
      Object.keys(newHand).forEach((key) => {
        if (parseInt(key) !== data.hand_id) {
          newHand[key].selectable = !newHand[key].selectable;
        }
      });
      updatedState.hand = newHand;
      if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
        Object.keys(updatedState.wheelbuttons).forEach((key) => {
          if (newHand[data.hand_id].selected) {
            updatedState.wheelbuttons[key].selectable = false;
          } else {
            updatedState.wheelbuttons[key].selectable = true;
          }
        });
      } else {
        if (newHand[data.hand_id].selected) {
          updatedState.wheelbuttons["wheel-B2"].selectable = true;
        } else {
          updatedState.wheelbuttons["wheel-B2"].selectable = true;
        }
      }
      Object.keys(updatedState.tiles).forEach((key) => {
        if (newHand[data.hand_id].selected) {
          updatedState.tiles[key].occupantSelectable = false;
        } else {
          updatedState.tiles[key].occupantSelectable = true;
        }
      });
      const getLands = () => {
        let lands = { forest: 0, lake: 0, mountain: 0, desert: 0 };
        Object.values(updatedState.data.board.tiles).forEach((tile) => {
          if (tile.owner === data.player && tile.type !== "prairie") {
            lands[tile.type] += 1;
          }
        });
        return lands;
      };
      const lands = getLands();
      const getLandTypes = () => {
        return Object.keys(
          updatedState.data[data.player].cards[data.card_id].land_cost
        ).filter(
          (key) =>
            updatedState.data[data.player].cards[data.card_id].land_cost[key] >
              0 && key !== "wild"
        );
      };
      const landtypes = getLandTypes();
      const requirementsMet = (tile) => {
        if (updatedState.data.board.tiles[tile].owner !== data.player) {
          return false;
        }
        if (updatedState.data.board.tiles[tile].occupant.player) {
          return false;
        }
        if (!landtypes.includes(updatedState.data.board.tiles[tile].type)) {
          return false;
        }
        Object.keys(
          updatedState.data[data.player].cards[data.card_id].land_cost
        ).forEach((key) => {
          if (key !== "wild") {
            if (
              updatedState.data[data.player].cards[data.card_id].land_cost[
                key
              ] > lands[key]
            ) {
              return false;
            }
          } else {
            if (
              updatedState.data[data.player].cards[data.card_id].land_cost[
                key
              ] >
              Object.values(lands).reduce(
                (sum, currentValue) => sum + currentValue
              )
            ) {
              return false;
            }
          }
        });
        return true;
      };
      if (newHand[data.hand_id].selected) {
        updatedState.currentAction = "summon_creature";
        Object.keys(updatedState.tiles).forEach((key) => {
          if (requirementsMet(key)) {
            updatedState.tiles[key].selectable = true;
          }
        });
      } else {
        updatedState.currentAction = "";
        Object.keys(updatedState.tiles).forEach((key) => {
          updatedState.tiles[key].selectable = false;
        });
      }
      return updatedState;
    },
    SELECT_EVENT: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      const getLands = () => {
        let lands = { forest: 0, lake: 0, mountain: 0, desert: 0 };
        Object.values(updatedState.data.board.tiles).forEach((tile) => {
          if (tile.owner === data.player && tile.type !== "prairie") {
            lands[tile.type] += 1;
          }
        });
        return lands;
      };
      const lands = getLands();
      let runLogic = true;
      Object.keys(
        updatedState.data[data.player].cards[data.card_id].land_cost
      ).forEach((key) => {
        if (key !== "wild") {
          if (
            updatedState.data[data.player].cards[data.card_id].land_cost[key] >
            lands[key]
          ) {
            runLogic = false;
          }
        } else {
          if (
            updatedState.data[data.player].cards[data.card_id].land_cost[key] >
            Object.values(lands).reduce(
              (sum, currentValue) => sum + currentValue
            )
          ) {
            runLogic = false;
          }
        }
      });
      if (runLogic) {
        const EP = new EventProcessor(updatedState, data);
        if (updatedState.data[data.player].cards[data.card_id].effects.target) {
          updatedState = EP.initEventLogic();
        } else {
          updatedState.hand[data.hand_id].selected = !updatedState.hand[
            data.hand_id
          ].selected;
          updatedState = EP.handleEventLogic();
        }
      }
      return updatedState;
    },
    PROCESS_EVENT_OCCUPANT: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      const EP = new EventProcessor(updatedState, data);
      updatedState = EP.handleEventLogic();
      return updatedState;
    },
    PROCESS_EVENT_TILE: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      const EP = new EventProcessor(updatedState, data);
      updatedState = EP.handleEventLogic();
      return updatedState;
    },
    SUMMON_CREATURE: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const newOccupant = updatedState.data.board.tiles[data.tile_id].occupant;
      newOccupant.player = data.player;
      const selected_card_id = parseInt(
        Object.keys(updatedState.hand).filter(
          (key) => updatedState.hand[key].selected
        )[0]
      );
      const card =
        updatedState.data[data.player].cards[
          updatedState.data[data.player].hand[selected_card_id - 1]
        ];
      newOccupant.id = card.id;
      newOccupant.type = card.type;
      newOccupant.faeria_cost = card.faeria_cost;
      newOccupant.land_cost = card.land_cost;
      newOccupant.attack = card.attack;
      newOccupant.base_attack = card.base_attack;
      newOccupant.health = card.health;
      newOccupant.base_health = card.base_health;
      newOccupant.movement = card.movement;
      newOccupant.ranged = card.ranged;
      newOccupant.hasMoved = true;
      newOccupant.hasAttacked = true;
      updatedState.data.board.tiles[data.tile_id].occupant = newOccupant;
      Object.keys(updatedState.tiles).forEach((key) => {
        updatedState.tiles[key].selectable = false;
        updatedState.tiles[key].occupantSelectable = true;
      });
      const newHand = updatedState.hand;
      newHand[selected_card_id].selected = !newHand[selected_card_id].selected;
      Object.keys(newHand).forEach((key) => {
        newHand[key].selectable = true;
      });
      updatedState.hand = newHand;
      if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
        Object.keys(updatedState.wheelbuttons).forEach((key) => {
          updatedState.wheelbuttons[key].selectable = true;
        });
      } else {
        updatedState.wheelbuttons["wheel-B2"].selectable = true;
      }
      updatedState.currentAction = "";
      updatedState.data[data.player].faeria -=
        updatedState.data[data.player].cards[
          updatedState.data[data.player].hand[selected_card_id - 1]
        ].faeria_cost;
      updatedState.data[data.player].hand.splice(selected_card_id - 1, 1);
      return updatedState;
    },
    SELECT_OCCUPANT: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.tiles[data.tile_id].occupantSelected = !updatedState.tiles[
        data.tile_id
      ].occupantSelected;
      const jumpTiles = [];
      if (
        updatedState.data.board.tiles[data.tile_id].occupant.movement.special
          .jump
      ) {
        updatedState.tiles[data.tile_id].adjacent.forEach((tile) => {
          if (!jumpTiles.includes(tile) && tile !== data.tile_id) {
            jumpTiles.push(tile);
          }
          updatedState.tiles[tile].adjacent.forEach((adjacent_tile) => {
            if (
              !jumpTiles.includes(adjacent_tile) &&
              adjacent_tile !== data.tile_id
            ) {
              jumpTiles.push(adjacent_tile);
            }
          });
        });
      }
      const movementRange =
        updatedState.data.board.tiles[data.tile_id].occupant.movement.range;
      const rangeTiles = [];
      const rangeTilesHelper = {};
      for (let i = 1; i <= movementRange; i++) {
        if (i === 1) {
          rangeTilesHelper[i] = {};
          updatedState.tiles[data.tile_id].adjacent.forEach((tile) => {
            let valid = true;
            if (
              updatedState.data.board.tiles[data.tile_id].occupant.movement
                .special.aquatic &&
              !updatedState.data.board.tiles[data.tile_id].occupant.movement
                .special.flying
            ) {
              if (
                updatedState.data.board.tiles[tile].type !== "lake" &&
                updatedState.data.board.tiles[tile].type !== "none"
              ) {
                valid = false;
              }
            }
            if (
              !updatedState.data.board.tiles[data.tile_id].occupant.movement
                .special.aquatic &&
              !updatedState.data.board.tiles[data.tile_id].occupant.movement
                .special.flying
            ) {
              if (updatedState.data.board.tiles[tile].type === "none") {
                valid = false;
              }
            }
            if (valid && !updatedState.data.board.tiles[tile].occupant.player) {
              rangeTiles.push(tile);
              rangeTilesHelper[i][tile] = {
                prevTile: data.tile_id,
                currentTile: tile,
              };
            }
          });
        } else {
          rangeTilesHelper[i] = {};
          Object.values(rangeTilesHelper[i - 1]).forEach((rangetile) => {
            updatedState.tiles[rangetile.currentTile].adjacent
              .filter(
                (rangetile_key) =>
                  !updatedState.tiles[rangetile.prevTile].adjacent.includes(
                    rangetile_key
                  ) && rangetile_key !== rangetile.prevTile
              )
              .forEach((rangetile_adj) => {
                let valid = true;
                updatedState.tiles[rangetile_adj].adjacent
                  .filter(
                    (rangetile_adj_key) =>
                      rangetile_adj_key !== rangetile.currentTile
                  )
                  .forEach((rangetile_adj_adj) => {
                    if (
                      updatedState.tiles[rangetile_adj_adj].adjacent.includes(
                        rangetile.prevTile
                      )
                    ) {
                      valid = false;
                    }
                  });
                if (updatedState.tiles[rangetile_adj].adjacentNonTile) {
                  if (
                    updatedState.tiles[rangetile_adj].adjacentNonTile.includes(
                      "D"
                    )
                  ) {
                    if (
                      updatedState.gods[
                        updatedState.tiles[rangetile_adj].adjacentNonTile
                      ].adjacent.includes(rangetile.prevTile)
                    ) {
                      valid = false;
                    }
                  } else {
                    if (
                      updatedState.data.board.wells[
                        updatedState.tiles[rangetile_adj].adjacentNonTile
                      ].adjacent.includes(rangetile.prevTile)
                    ) {
                      valid = false;
                    }
                  }
                }
                if (
                  updatedState.data.board.tiles[data.tile_id].occupant.movement
                    .special.aquatic &&
                  !updatedState.data.board.tiles[data.tile_id].occupant.movement
                    .special.flying
                ) {
                  if (
                    updatedState.data.board.tiles[rangetile_adj].type !==
                      "lake" &&
                    updatedState.data.board.tiles[rangetile_adj].type !== "none"
                  ) {
                    valid = false;
                  }
                }
                if (
                  !updatedState.data.board.tiles[data.tile_id].occupant.movement
                    .special.aquatic &&
                  !updatedState.data.board.tiles[data.tile_id].occupant.movement
                    .special.flying
                ) {
                  if (
                    updatedState.data.board.tiles[rangetile_adj].type === "none"
                  ) {
                    valid = false;
                  }
                }
                if (
                  valid &&
                  !rangeTiles.includes(rangetile_adj) &&
                  !updatedState.data.board.tiles[rangetile_adj].occupant.player
                ) {
                  rangeTiles.push(rangetile_adj);
                  rangeTilesHelper[i][rangetile_adj] = {
                    prevTile: rangetile.currentTile,
                    currentTile: rangetile_adj,
                  };
                }
              });
          });
        }
      }
      const rangeAttack = [];
      const rangeAttackHelper = {};
      if (updatedState.data.board.tiles[data.tile_id].occupant.ranged) {
        for (let i = 1; i <= 5; i++) {
          if (i === 1) {
            rangeAttackHelper[i] = {};
            updatedState.tiles[data.tile_id].adjacent.forEach((tile) => {
              if (!updatedState.data.board.tiles[tile].occupant.player) {
                rangeAttack.push(tile);
                rangeAttackHelper[i][tile] = {
                  prevTile: data.tile_id,
                  currentTile: tile,
                };
              }
            });
          } else {
            rangeAttackHelper[i] = {};
            Object.values(rangeAttackHelper[i - 1]).forEach((rangetile) => {
              updatedState.tiles[rangetile.currentTile].adjacent
                .filter(
                  (rangetile_key) =>
                    !updatedState.tiles[rangetile.prevTile].adjacent.includes(
                      rangetile_key
                    ) && rangetile_key !== rangetile.prevTile
                )
                .forEach((rangetile_adj) => {
                  let valid = true;
                  updatedState.tiles[rangetile_adj].adjacent
                    .filter(
                      (rangetile_adj_key) =>
                        rangetile_adj_key !== rangetile.currentTile
                    )
                    .forEach((rangetile_adj_adj) => {
                      if (
                        updatedState.tiles[rangetile_adj_adj].adjacent.includes(
                          rangetile.prevTile
                        )
                      ) {
                        valid = false;
                      }
                    });
                  if (updatedState.tiles[rangetile_adj].adjacentNonTile) {
                    if (
                      updatedState.tiles[
                        rangetile_adj
                      ].adjacentNonTile.includes("D")
                    ) {
                      if (
                        updatedState.gods[
                          updatedState.tiles[rangetile_adj].adjacentNonTile
                        ].adjacent.includes(rangetile.prevTile)
                      ) {
                        valid = false;
                      }
                    } else {
                      if (
                        updatedState.data.board.wells[
                          updatedState.tiles[rangetile_adj].adjacentNonTile
                        ].adjacent.includes(rangetile.prevTile)
                      ) {
                        valid = false;
                      }
                    }
                  }
                  if (
                    valid &&
                    !rangeAttack.includes(rangetile_adj) &&
                    !updatedState.data.board.tiles[rangetile.currentTile]
                      .occupant.player
                  ) {
                    rangeAttack.push(rangetile_adj);
                    rangeAttackHelper[i][rangetile_adj] = {
                      prevTile: rangetile.currentTile,
                      currentTile: rangetile_adj,
                    };
                  }
                });
            });
          }
        }
      }
      const moveRequirementsMet = (tile_id) => {
        if (updatedState.data.board.tiles[tile_id].occupant.player) {
          return false;
        }
        if (updatedState.data.board.tiles[data.tile_id].occupant.hasMoved) {
          return false;
        }
        if (
          updatedState.data.board.tiles[data.tile_id].occupant.movement.special
            .jump
        ) {
          if (!jumpTiles.includes(tile_id) && !rangeTiles.includes(tile_id)) {
            return false;
          }
        } else {
          if (!rangeTiles.includes(tile_id)) {
            return false;
          }
        }
        if (
          !updatedState.data.board.tiles[data.tile_id].occupant.movement.special
            .aquatic &&
          !updatedState.data.board.tiles[data.tile_id].occupant.movement.special
            .flying
        ) {
          if (updatedState.data.board.tiles[tile_id].type === "none") {
            return false;
          }
        }
        if (
          updatedState.data.board.tiles[data.tile_id].occupant.movement.special
            .aquatic &&
          !updatedState.data.board.tiles[data.tile_id].occupant.movement.special
            .flying
        ) {
          if (
            updatedState.data.board.tiles[tile_id].type !== "lake" &&
            updatedState.data.board.tiles[tile_id].type !== "none"
          ) {
            return false;
          }
        }
        return true;
      };
      const attackRequirementsMet = (tile_id) => {
        if (updatedState.data.board.tiles[data.tile_id].occupant.ranged) {
          if (!rangeAttack.includes(tile_id)) {
            if (!updatedState.tiles[data.tile_id].adjacent.includes(tile_id)) {
              return false;
            }
          }
        } else {
          if (!updatedState.tiles[data.tile_id].adjacent.includes(tile_id)) {
            return false;
          }
        }
        if (
          !updatedState.data.board.tiles[tile_id].occupant.player ||
          updatedState.data.board.tiles[tile_id].occupant.player === data.player
        ) {
          return false;
        }
        if (updatedState.data.board.tiles[data.tile_id].occupant.hasAttacked) {
          return false;
        }
        return true;
      };
      if (updatedState.tiles[data.tile_id].occupantSelected) {
        Object.keys(updatedState.wheelbuttons).forEach((key) => {
          updatedState.wheelbuttons[key].selectable = false;
        });
        Object.keys(updatedState.hand).forEach((key) => {
          updatedState.hand[key].selectable = false;
        });
        Object.keys(updatedState.tiles).forEach((key) => {
          if (moveRequirementsMet(key)) {
            updatedState.tiles[key].selectable = true;
          }
          if (attackRequirementsMet(key)) {
            updatedState.tiles[key].occupantSelectable = true;
          } else if (data.tile_id !== key) {
            updatedState.tiles[key].occupantSelectable = false;
          }
        });
        updatedState.currentAction = "occupant_selected";
      } else {
        if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
          Object.keys(updatedState.wheelbuttons).forEach((key) => {
            updatedState.wheelbuttons[key].selectable = true;
          });
        } else {
          updatedState.wheelbuttons["wheel-B2"].selectable = true;
        }
        Object.keys(updatedState.hand).forEach((key) => {
          updatedState.hand[key].selectable = true;
        });
        Object.keys(updatedState.tiles).forEach((key) => {
          updatedState.tiles[key].selectable = false;
          updatedState.tiles[key].occupantSelectable = true;
        });
        updatedState.currentAction = "";
      }
      const god = data.player === "player1" ? "D0" : "D6";
      const rangeAttackArrayHelper =
        data.player === "player1"
          ? ["B1", "F1", "D2", "D3", "D4", "D5"]
          : ["B5", "F5", "D1", "D2", "D3", "D4"];
      if (updatedState.tiles[data.tile_id].occupantSelected) {
        if (!updatedState.data.board.tiles[data.tile_id].occupant.hasAttacked) {
          if (
            updatedState.data.board.tiles[data.tile_id].occupant.ranged &&
            !updatedState.gods[god].adjacent.includes(data.tile_id)
          ) {
            const rangeAttackArray = rangeAttack.filter((attacktile) =>
              updatedState.gods[god].adjacent.includes(attacktile)
            );
            if (
              rangeAttackArray.length === 1 &&
              !updatedState.data.board.tiles[rangeAttackArray[0]].occupant
                .player &&
              rangeAttackArrayHelper.includes(data.tile_id)
            ) {
              updatedState.gods[god].selectable = true;
            }
          } else {
            if (updatedState.gods[god].adjacent.includes(data.tile_id)) {
              updatedState.gods[god].selectable = true;
            }
          }
        }
      } else {
        updatedState.gods[god].selectable = false;
      }
      return updatedState;
    },
    MOVE_OCCUPANT: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const selected_tile_id = Object.keys(updatedState.tiles).filter(
        (key) => updatedState.tiles[key].occupantSelected
      )[0];
      updatedState.data.board.tiles[data.tile_id].occupant =
        updatedState.data.board.tiles[selected_tile_id].occupant;
      updatedState.data.board.tiles[data.tile_id].occupant.hasMoved = true;
      if (updatedState.data.board.tiles[data.tile_id].occupant.ranged) {
        updatedState.data.board.tiles[data.tile_id].occupant.hasAttacked = true;
      }
      const removeOccupant = {
        player: "",
        id: 0,
        type: "",
        faeria_cost: 0,
        land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
      updatedState.data.board.tiles[selected_tile_id].occupant = removeOccupant;
      if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
        Object.keys(updatedState.wheelbuttons).forEach((key) => {
          updatedState.wheelbuttons[key].selectable = true;
        });
      } else {
        updatedState.wheelbuttons["wheel-B2"].selectable = true;
      }
      Object.keys(updatedState.hand).forEach((key) => {
        updatedState.hand[key].selectable = true;
      });
      Object.keys(updatedState.tiles).forEach((key) => {
        updatedState.tiles[key].selectable = false;
        updatedState.tiles[key].occupantSelectable = true;
      });
      updatedState.tiles[selected_tile_id].occupantSelected = false;
      Object.keys(updatedState.data.board.wells).forEach((key) => {
        if (
          updatedState.data.board.wells[key].adjacent.includes(data.tile_id) &&
          updatedState.data.board.wells[key].available
        ) {
          updatedState.data.board.wells[key].available = false;
          updatedState.data.board.wells[key].collected = true;
          updatedState.data[data.player].faeria += 1;
        }
      });
      updatedState.currentAction = "";
      return updatedState;
    },
    ATTACK_OCCUPANT: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const selected_occupant_id = Object.keys(updatedState.tiles).filter(
        (key) => updatedState.tiles[key].occupantSelected
      )[0];
      const attacker =
        updatedState.data.board.tiles[selected_occupant_id].occupant;
      const defender = updatedState.data.board.tiles[data.tile_id].occupant;
      const removeOccupant = {
        player: "",
        id: 0,
        type: "",
        faeria_cost: 0,
        land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
      if (
        updatedState.tiles[data.tile_id].adjacent.includes(selected_occupant_id)
      ) {
        attacker.health -= defender.attack;
      }
      defender.health -= attacker.attack;
      attacker.hasAttacked = true;
      attacker.hasMoved = true;
      updatedState.data.board.tiles[selected_occupant_id].occupant =
        attacker.health > 0 ? attacker : removeOccupant;
      updatedState.data.board.tiles[data.tile_id].occupant =
        defender.health > 0 ? defender : removeOccupant;
      if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
        Object.keys(updatedState.wheelbuttons).forEach((key) => {
          updatedState.wheelbuttons[key].selectable = true;
        });
      } else {
        updatedState.wheelbuttons["wheel-B2"].selectable = true;
      }
      Object.keys(updatedState.hand).forEach((key) => {
        updatedState.hand[key].selectable = true;
      });
      Object.keys(updatedState.tiles).forEach((key) => {
        updatedState.tiles[key].selectable = false;
        updatedState.tiles[key].occupantSelectable = true;
      });
      updatedState.tiles[selected_occupant_id].occupantSelected = false;
      updatedState.currentAction = "";
      return updatedState;
    },
    ATTACK_GOD: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const selected_occupant_id = Object.keys(updatedState.tiles).filter(
        (key) => updatedState.tiles[key].occupantSelected
      )[0];
      const attacker =
        updatedState.data.board.tiles[selected_occupant_id].occupant;
      updatedState.data.board.gods[data.god].health -= attacker.attack;
      updatedState.data.board.gods[data.god].wasHit = true;
      attacker.hasAttacked = true;
      attacker.hasMoved = true;
      updatedState.gods[data.god].selectable = false;
      if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
        Object.keys(updatedState.wheelbuttons).forEach((key) => {
          updatedState.wheelbuttons[key].selectable = true;
        });
      } else {
        updatedState.wheelbuttons["wheel-B2"].selectable = true;
      }
      Object.keys(updatedState.hand).forEach((key) => {
        updatedState.hand[key].selectable = true;
      });
      Object.keys(updatedState.tiles).forEach((key) => {
        updatedState.tiles[key].selectable = false;
        updatedState.tiles[key].occupantSelectable = true;
      });
      updatedState.tiles[selected_occupant_id].occupantSelected = false;
      updatedState.currentAction = "";
      if (updatedState.data.board.gods[data.god].health <= 0) {
        updatedState.data.status.finished = true;
        updatedState.data.status.winner = data.player;
      }
      return updatedState;
    },
    END_TURN: (currentState, player) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.data[player].wheel_used = false;
      updatedState.data[player].faeria += 3;
      const anyAdjacent = (tile) =>
        updatedState.data.board.tiles[tile].occupant.player === player;
      Object.keys(updatedState.data.board.wells).forEach((key) => {
        if (updatedState.data.board.wells[key].adjacent.some(anyAdjacent)) {
          updatedState.data.board.wells[key].available = false;
          updatedState.data.board.wells[key].collected = true;
          updatedState.data[player].faeria += 1;
        } else {
          updatedState.data.board.wells[key].available = true;
          updatedState.data.board.wells[key].collected = false;
        }
      });
      const god = {
        player1: "D6",
        player2: "D0",
      };
      if (updatedState.data[player].deck.length > 0) {
        if (updatedState.data[player].hand.length < 9) {
          updatedState.data[player].hand.push(
            updatedState.data[player].deck.splice(0, 1)[0]
          );
        } else {
          updatedState.data[player].deck.splice(0, 1);
        }
      } else {
        updatedState.data.board.gods[god[player]].health -= ++updatedState.data[
          player
        ].health_dmg;
      }
      Object.keys(updatedState.data.board.tiles).forEach((key) => {
        updatedState.data.board.tiles[key].occupant.hasMoved = false;
        updatedState.data.board.tiles[key].occupant.hasAttacked = false;
      });
      updatedState.data.status.turn += 1;
      return updatedState;
    },
  };
  initStore(actions, {
    currentAction: "",
    wheelbuttons: {
      "wheel-A1": {
        selectable: true,
        selected: false,
        action: "forest",
      },
      "wheel-A2": {
        selectable: true,
        selected: false,
        action: "lake",
      },
      "wheel-B1": {
        selectable: true,
        selected: false,
        action: "mountain",
      },
      "wheel-B2": {
        selectable: true,
        selected: false,
        action: "prairie",
      },
      "wheel-B3": {
        selectable: true,
        selected: false,
        action: "draw",
      },
      "wheel-C1": {
        selectable: true,
        selected: false,
        action: "desert",
      },
      "wheel-C2": {
        selectable: true,
        selected: false,
        action: "faeria",
      },
    },
    hand: {
      1: {
        selectable: true,
        selected: false,
      },
      2: {
        selectable: true,
        selected: false,
      },
      3: {
        selectable: true,
        selected: false,
      },
      4: {
        selectable: true,
        selected: false,
      },
      5: {
        selectable: true,
        selected: false,
      },
      6: {
        selectable: true,
        selected: false,
      },
      7: {
        selectable: true,
        selected: false,
      },
      8: {
        selectable: true,
        selected: false,
      },
      9: {
        selectable: true,
        selected: false,
      },
    },
    tiles: {
      A1: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["A2", "B2", "B3"],
        adjacentNonTile: "A0",
      },
      A2: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["A1", "B3", "B4"],
        adjacentNonTile: "A3",
      },
      B1: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B2", "C1", "C2"],
        adjacentNonTile: "A0",
      },
      B2: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["A1", "B1", "B3", "C2", "C3"],
        adjacentNonTile: "A0",
      },
      B3: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["A1", "A2", "B2", "B4", "C3", "C4"],
        adjacentNonTile: null,
      },
      B4: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["A2", "B3", "B5", "C4", "C5"],
        adjacentNonTile: "A3",
      },
      B5: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B4", "C5", "C6"],
        adjacentNonTile: "A3",
      },
      C1: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B1", "C2", "D1"],
        adjacentNonTile: "D0",
      },
      C2: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B1", "B2", "C1", "C3", "D1", "D2"],
        adjacentNonTile: null,
      },
      C3: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B2", "B3", "C2", "C4", "D2", "D3"],
        adjacentNonTile: null,
      },
      C4: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B3", "B4", "C3", "C5", "D3", "D4"],
        adjacentNonTile: null,
      },
      C5: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B4", "B5", "C4", "C6", "D4", "D5"],
        adjacentNonTile: null,
      },
      C6: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["B5", "C5", "D5"],
        adjacentNonTile: "D6",
      },
      D1: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["C1", "C2", "D2", "E1", "E2"],
        adjacentNonTile: "D0",
      },
      D2: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["C2", "C3", "D1", "D3", "E2", "E3"],
        adjacentNonTile: null,
      },
      D3: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["C3", "C4", "D2", "D4", "E3", "E4"],
        adjacentNonTile: null,
      },
      D4: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["C4", "C5", "D3", "D5", "E4", "E5"],
        adjacentNonTile: null,
      },
      D5: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["C5", "C6", "D4", "E5", "E6"],
        adjacentNonTile: null,
      },
      E1: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["D1", "E2", "F1"],
        adjacentNonTile: "D0",
      },
      E2: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["D1", "D2", "E1", "E3", "F1", "F2"],
        adjacentNonTile: null,
      },
      E3: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["D2", "D3", "E2", "E4", "F2", "F3"],
        adjacentNonTile: null,
      },
      E4: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["D3", "D4", "E3", "E5", "F3", "F4"],
        adjacentNonTile: null,
      },
      E5: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["D4", "D5", "E4", "E6", "F4", "F5"],
        adjacentNonTile: null,
      },
      E6: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["D5", "E5", "F5"],
        adjacentNonTile: "D6",
      },
      F1: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["E1", "E2", "F2"],
        adjacentNonTile: "G0",
      },
      F2: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["E2", "E3", "F1", "F3", "G1"],
        adjacentNonTile: "G0",
      },
      F3: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["E3", "E4", "F2", "F4", "G1", "G2"],
        adjacentNonTile: null,
      },
      F4: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["E4", "E5", "F3", "F5", "G2"],
        adjacentNonTile: "G3",
      },
      F5: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["E5", "E6", "F4"],
        adjacentNonTile: "G3",
      },
      G1: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["F2", "F3", "G2"],
        adjacentNonTile: "G0",
      },
      G2: {
        selectable: false,
        selected: false,
        occupantSelectable: true,
        occupantSelected: false,
        adjacent: ["F3", "F4", "G1"],
        adjacentNonTile: "G3",
      },
    },
    gods: {
      D0: {
        selectable: false,
        player: "player2",
        adjacent: ["C1", "D1", "E1"],
      },
      D6: {
        selectable: false,
        player: "player1",
        adjacent: ["C6", "D5", "E6"],
      },
    },
    data: {
      status: {
        finished: false,
        winner: "",
        turn: 1,
        current: "player1",
      },
      board: {
        wells: {
          A0: {
            available: true,
            collected: false,
            adjacent: ["A1", "B1", "B2"],
          },
          A3: {
            available: true,
            collected: false,
            adjacent: ["A2", "B4", "B5"],
          },
          G0: {
            available: true,
            collected: false,
            adjacent: ["G1", "F1", "F2"],
          },
          G3: {
            available: true,
            collected: false,
            adjacent: ["G2", "F4", "F5"],
          },
        },
        tiles: {
          A1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          A2: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          B1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          B2: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          B3: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          B4: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          B5: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          C1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          C2: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          C3: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          C4: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          C5: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          C6: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          D1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          D2: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          D3: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          D4: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          D5: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          E1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          E2: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          E3: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          E4: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          E5: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          E6: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          F1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          F2: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          F3: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          F4: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          F5: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          G1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
          G2: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              type: "",
              faeria_cost: 0,
              land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            },
          },
        },
        gods: {
          D0: {
            health: 20,
            wasHit: false,
          },
          D6: {
            health: 20,
            wasHit: false,
          },
        },
      },
      player1: {
        name: "BabyBlue",
        mulligan: true,
        wheel_used: false,
        wheel_neutral_counter: 0,
        health_dmg: 0,
        faeria: 3,
        hand: [],
        deck: [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
        ],
        cards: {
          0: {
            id: 0,
            type: "event",
            faeria_cost: 0,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
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
            effects: { target: true },
          },
          1: {
            id: 1,
            type: "creature",
            faeria_cost: 4,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 2,
            base_attack: 2,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: true,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          2: {
            id: 1,
            type: "creature",
            faeria_cost: 4,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 2,
            base_attack: 2,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: true,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          3: {
            id: 1,
            type: "creature",
            faeria_cost: 4,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 2,
            base_attack: 2,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: true,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          4: {
            id: 2,
            type: "creature",
            faeria_cost: 5,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 3,
            base_attack: 3,
            health: 6,
            base_health: 6,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: true,
              },
            },
            ranged: false,
            effects: [],
          },
          5: {
            id: 2,
            type: "creature",
            faeria_cost: 5,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 3,
            base_attack: 3,
            health: 6,
            base_health: 6,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: true,
              },
            },
            ranged: false,
            effects: [],
          },
          6: {
            id: 2,
            type: "creature",
            faeria_cost: 5,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 3,
            base_attack: 3,
            health: 6,
            base_health: 6,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: true,
              },
            },
            ranged: false,
            effects: [],
          },
          7: {
            id: 3,
            type: "creature",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 1,
            base_attack: 1,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          8: {
            id: 3,
            type: "creature",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 1,
            base_attack: 1,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          9: {
            id: 3,
            type: "creature",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 1,
            base_attack: 1,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          10: {
            id: 4,
            type: "creature",
            faeria_cost: 4,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 3,
            base_attack: 3,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: true,
              },
            },
            ranged: false,
            effects: [],
          },
          11: {
            id: 4,
            type: "creature",
            faeria_cost: 4,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 3,
            base_attack: 3,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: true,
              },
            },
            ranged: false,
            effects: [],
          },
          12: {
            id: 4,
            type: "creature",
            faeria_cost: 4,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 3,
            base_attack: 3,
            health: 3,
            base_health: 3,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: true,
              },
            },
            ranged: false,
            effects: [],
          },
          13: {
            id: 5,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 5,
            base_attack: 5,
            health: 5,
            base_health: 5,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: { target: true },
          },
          14: {
            id: 5,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 5,
            base_attack: 5,
            health: 5,
            base_health: 5,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: { target: true },
          },
          15: {
            id: 5,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
            attack: 5,
            base_attack: 5,
            health: 5,
            base_health: 5,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: { target: true },
          },
          16: {
            id: 6,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
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
            effects: { target: false },
          },
          17: {
            id: 6,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
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
            effects: { target: false },
          },
          18: {
            id: 6,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
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
            effects: { target: false },
          },
          19: {
            id: 7,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
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
            effects: { target: false },
          },
          20: {
            id: 7,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
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
            effects: { target: false },
          },
          21: {
            id: 7,
            type: "event",
            faeria_cost: 3,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 2, wild: 0 },
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
            effects: { target: false },
          },
          22: {
            id: 8,
            type: "creature",
            faeria_cost: 5,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 5,
            base_attack: 5,
            health: 5,
            base_health: 5,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          23: {
            id: 8,
            type: "creature",
            faeria_cost: 5,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 5,
            base_attack: 5,
            health: 5,
            base_health: 5,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          24: {
            id: 8,
            type: "creature",
            faeria_cost: 5,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 3, wild: 0 },
            attack: 5,
            base_attack: 5,
            health: 5,
            base_health: 5,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          25: {
            id: 9,
            type: "event",
            faeria_cost: 6,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 4, wild: 0 },
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
            effects: { target: false },
          },
          26: {
            id: 9,
            type: "event",
            faeria_cost: 6,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 4, wild: 0 },
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
            effects: { target: false },
          },
          27: {
            id: 9,
            type: "event",
            faeria_cost: 6,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 4, wild: 0 },
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
            effects: { target: false },
          },
          28: {
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
              special: {
                aquatic: true,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          29: {
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
              special: {
                aquatic: true,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
          30: {
            id: 11,
            type: "event",
            faeria_cost: 9,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 4, wild: 0 },
            attack: 0,
            base_attack: 0,
            health: 0,
            base_health: 0,
            movement: {
              range: 1,
              special: {
                aquatic: true,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: { target: false },
          },
        },
      },
      player2: {
        name: "BabyBurrito",
        mulligan: true,
        wheel_used: false,
        wheel_neutral_counter: 0,
        health_dmg: 0,
        faeria: 3,
        hand: [],
        deck: [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
        ],
        cards: {
          0: {
            id: 0,
            type: 0,
            faeria_cost: 0,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
            attack: 0,
            health: 0,
            effects: [],
          },
          1: {
            id: 1,
            type: 0,
            faeria_cost: 0,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 0, wild: 0 },
            attack: 0,
            health: 0,
            effects: [],
          },
          2: {
            id: 1,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          3: {
            id: 1,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          4: {
            id: 2,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          5: {
            id: 2,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          6: {
            id: 2,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          7: {
            id: 3,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          8: {
            id: 3,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          9: {
            id: 3,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          10: {
            id: 4,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          11: {
            id: 4,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          12: {
            id: 4,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          13: {
            id: 5,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          14: {
            id: 5,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          15: {
            id: 5,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          16: {
            id: 6,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          17: {
            id: 6,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          18: {
            id: 6,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          19: {
            id: 7,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          20: {
            id: 7,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          21: {
            id: 7,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          22: {
            id: 8,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          23: {
            id: 8,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          24: {
            id: 8,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          25: {
            id: 9,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          26: {
            id: 9,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          27: {
            id: 9,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          28: {
            id: 10,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          29: {
            id: 10,
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
          30: {
            id: 10,
            type: "creature",
            faeria_cost: 1,
            land_cost: { forest: 0, desert: 0, mountain: 0, lake: 1, wild: 0 },
            attack: 1,
            health: 1,
            movement: {
              range: 1,
              special: {
                aquatic: false,
                flying: false,
                jump: false,
              },
            },
            ranged: false,
            effects: [],
          },
        },
      },
    },
  });
};

export default configureStore;
