import { initStore } from "./store";
import EventProcessor from "./event-processor";
import axios from "axios";

const configureStore = (loadStore) => {
  const actions = {
    SET_DATA: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState = data;
      return updatedState;
    },
    SHUFFLE_DECK: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const shuffledDeck = [];
      for (let i = 0; i < currentState.data[data.player].deck.length; i++) {
        let random = Math.floor(
          Math.random() * updatedState.data[data.player].deck.length
        );
        shuffledDeck.push(updatedState.data[data.player].deck[random]);
        updatedState.data[data.player].deck.splice(random, 1);
      }
      updatedState.data[data.player].deck = shuffledDeck;
      updatedState.data[data.player].shuffle = true;
      const newState = JSON.parse(JSON.stringify(updatedState));
      const getdata = new FormData();
      getdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/getState.php",
          getdata
        )
        .then((res) => {
          const prevState = JSON.parse(res.data);
          newState.data[data.opponent] = prevState.data[data.opponent];
          const postdata = new FormData();
          postdata.append("react_state", JSON.stringify(newState));
          postdata.append("id", data.id);
          axios
            .post(
              "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
              postdata
            )
            .catch((error) => {
              console.log("Network Error", error.message);
            });
        })
        .catch((error) => {
          console.log("Network Error", error.message);
        });
      return updatedState;
    },
    CONFIRM_MULLIGAN: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState = data;
      return updatedState;
    },
    START_GAME: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));

      updatedState.data.status.turn = 1;
      updatedState.data[data.player].wheel_used = false;

      //Wheel
      Object.keys(updatedState.wheelbuttons).forEach((wheel) => {
        updatedState.wheelbuttons[wheel].selectable = true;
        updatedState.wheelbuttons[wheel].selected = false;
      });

      //Hand
      Object.keys(updatedState.hand).forEach((card) => {
        updatedState.hand[card].selectable = true;
        updatedState.hand[card].selected = false;
      });

      //Tiles and Occupants
      Object.keys(updatedState.tiles).forEach((tile) => {
        updatedState.tiles[tile].selectable = false;
        updatedState.tiles[tile].selected = false;
        updatedState.tiles[tile].occupantSelectable = true;
        updatedState.tiles[tile].occupantSelected = false;
      });

      //Gods
      Object.keys(updatedState.gods).forEach((god) => {
        updatedState.gods[god].selectable = false;
      });

      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
      return updatedState;
    },
    SELECT_LAND: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      const newWheelState = updatedState.wheelbuttons;
      newWheelState[data.wheelbutton_id].selected =
        !newWheelState[data.wheelbutton_id].selected;
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
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
      return updatedState;
    },
    PLUS_FAERIA: (currentState, player) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.data[player].faeria++;
      updatedState.data[player].wheel_used = true;
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
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

      // Cheekbloom
      if (type === "forest") {
        Object.keys(updatedState.data.board.tiles).forEach((tile) => {
          if (updatedState.data.board.tiles[tile].occupant.id === 33) {
            updatedState.data.board.tiles[tile].occupant.health += 1;
            updatedState.data.board.tiles[tile].occupant.attack += 1;
          }
        });
      }
      // Cheekbloom

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
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
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
        const canSpawnAdjacentToFriendliesArray = {
          8: "lake", //Cheek lord
        };
        const canSpawnAdjacentToFriendlies = (adjTile) => {
          return (
            updatedState.data.board.tiles[adjTile].occupant.player ===
              data.player &&
            updatedState.data.board.tiles[adjTile].occupant.land_cost[
              canSpawnAdjacentToFriendliesArray[
                updatedState.data[data.player].cards[data.card_id].id
              ]
            ] > 0
          );
        };
        if (
          Object.keys(canSpawnAdjacentToFriendliesArray).includes(
            String(updatedState.data[data.player].cards[data.card_id].id)
          )
        ) {
          if (
            !updatedState.tiles[tile].adjacent.some(
              canSpawnAdjacentToFriendlies
            ) &&
            (!landtypes.includes(updatedState.data.board.tiles[tile].type) ||
              updatedState.data.board.tiles[tile].owner !== data.player)
          ) {
            return false;
          }
          if (
            !updatedState.data[data.player].cards[data.card_id].movement.special
              .aquatic &&
            !updatedState.data[data.player].cards[data.card_id].movement.special
              .flying
          ) {
            if (updatedState.data.board.tiles[tile].type === "none") {
              return false;
            }
          }
          if (
            updatedState.data[data.player].cards[data.card_id].movement.special
              .aquatic &&
            !updatedState.data[data.player].cards[data.card_id].movement.special
              .flying
          ) {
            if (
              updatedState.data.board.tiles[tile].type !== "none" &&
              updatedState.data.board.tiles[tile].type !== "lake"
            ) {
              return false;
            }
          }
        } else {
          if (updatedState.data.board.tiles[tile].owner !== data.player) {
            return false;
          }
          if (!landtypes.includes(updatedState.data.board.tiles[tile].type)) {
            return false;
          }
        }
        if (updatedState.data.board.tiles[tile].occupant.player) {
          return false;
        }
        let valid = true;
        Object.keys(
          updatedState.data[data.player].cards[data.card_id].land_cost
        ).forEach((key) => {
          if (key !== "wild") {
            if (
              updatedState.data[data.player].cards[data.card_id].land_cost[
                key
              ] > lands[key]
            ) {
              valid = false;
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
              valid = false;
            }
          }
        });
        return valid;
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
          updatedState.hand[data.hand_id].selected =
            !updatedState.hand[data.hand_id].selected;
          updatedState = EP.handleEventLogic();
          const formdata = new FormData();
          formdata.append("react_state", JSON.stringify(updatedState));
          formdata.append("id", document.getElementById("game_id").value);
          axios
            .post(
              "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
              formdata
            )
            .catch((error) => {
              console.log("Network Error", error.message);
            });
        }
      }
      return updatedState;
    },
    PROCESS_EVENT_OCCUPANT: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      const EP = new EventProcessor(updatedState, data);
      updatedState = EP.handleEventLogic();
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
      return updatedState;
    },
    PROCESS_EVENT_TILE: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      const EP = new EventProcessor(updatedState, data);
      updatedState = EP.handleEventLogic();
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
      return updatedState;
    },
    PROCESS_GIFT_OCCUPANT: (currentState, data) => {
      let updatedState = JSON.parse(JSON.stringify(currentState));
      const selected_occupant_id = Object.keys(updatedState.tiles).filter(
        (key) => updatedState.tiles[key].occupantSelected
      )[0];
      const EP = new EventProcessor(updatedState, data);
      updatedState = EP.processGiftEffect(selected_occupant_id);
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
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
      newOccupant.taunt = card.taunt;
      newOccupant.divine = card.divine;
      newOccupant.protection = card.protection;
      newOccupant.ranged = card.ranged;
      newOccupant.hasDashed = false;
      newOccupant.effects = card.effects;
      if (!card.movement.haste) {
        newOccupant.hasMoved = true;
        newOccupant.hasAttacked = true;
      } else {
        newOccupant.hasMoved = false;
        newOccupant.hasAttacked = false;
        if (card.movement.dash === 0) {
          Object.keys(updatedState.data.board.wells).forEach((key) => {
            if (
              updatedState.data.board.wells[key].adjacent.includes(
                data.tile_id
              ) &&
              updatedState.data.board.wells[key].available
            ) {
              updatedState.data.board.wells[key].available = false;
              updatedState.data.board.wells[key].collected = true;
              updatedState.data[data.player].faeria += 1;
            }
          });
        }
      }
      updatedState.data.board.tiles[data.tile_id].occupant = newOccupant;
      const newHand = updatedState.hand;
      newHand[selected_card_id].selected = !newHand[selected_card_id].selected;
      if (newOccupant.effects.summon) {
        const EP = new EventProcessor(updatedState, data);
        EP.processSummonEffect(
          updatedState.data.board.tiles[data.tile_id].occupant
        );
      }
      if (newOccupant.effects.gift) {
        const EP = new EventProcessor(updatedState, data);
        newHand[selected_card_id].selectable = false;
        EP.initGiftEffect(updatedState.data.board.tiles[data.tile_id].occupant);
      } else {
        Object.keys(updatedState.tiles).forEach((key) => {
          updatedState.tiles[key].selectable = false;
          updatedState.tiles[key].occupantSelectable = true;
        });
        Object.keys(newHand).forEach((key) => {
          newHand[key].selectable = true;
        });
        if (updatedState.data[data.player].wheel_neutral_counter !== 1) {
          Object.keys(updatedState.wheelbuttons).forEach((key) => {
            updatedState.wheelbuttons[key].selectable = true;
          });
        } else {
          updatedState.wheelbuttons["wheel-B2"].selectable = true;
        }
        updatedState.currentAction = "";
      }
      updatedState.hand = newHand;
      updatedState.data[data.player].faeria -=
        updatedState.data[data.player].cards[
          updatedState.data[data.player].hand[selected_card_id - 1]
        ].faeria_cost;
      updatedState.data[data.player].hand.splice(selected_card_id - 1, 1);
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
      return updatedState;
    },
    SELECT_OCCUPANT: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.tiles[data.tile_id].occupantSelected =
        !updatedState.tiles[data.tile_id].occupantSelected;
      const anyTaunt = (taunt_tile) =>
        updatedState.data.board.tiles[taunt_tile].occupant.taunt &&
        updatedState.data.board.tiles[taunt_tile].occupant.player ===
          data.opponent;
      const isTaunted =
        updatedState.tiles[data.tile_id].adjacent.some(anyTaunt);
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
        updatedState.data.board.tiles[data.tile_id].occupant.movement.dash >
          0 && !updatedState.data.board.tiles[data.tile_id].occupant.hasDashed
          ? updatedState.data.board.tiles[data.tile_id].occupant.movement.dash
          : updatedState.data.board.tiles[data.tile_id].occupant.movement.range;
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
        if (
          updatedState.data.board.tiles[data.tile_id].occupant.movement.dash >
            0 &&
          !updatedState.data.board.tiles[data.tile_id].occupant.hasDashed
        ) {
          if (!rangeTiles.includes(tile_id)) {
            return false;
          }
        } else {
          if (updatedState.data.board.tiles[data.tile_id].occupant.hasMoved) {
            return false;
          }
          if (isTaunted) return false;
          if (
            updatedState.data.board.tiles[data.tile_id].occupant.movement
              .special.jump
          ) {
            if (!jumpTiles.includes(tile_id) && !rangeTiles.includes(tile_id)) {
              return false;
            }
          } else {
            if (!rangeTiles.includes(tile_id)) {
              return false;
            }
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
        updatedState.data.board.tiles[data.tile_id].occupant.hasDashed = true;
        if (
          updatedState.data.board.tiles[data.tile_id].occupant.movement.haste
        ) {
          Object.keys(updatedState.data.board.wells).forEach((key) => {
            if (
              updatedState.data.board.wells[key].adjacent.includes(
                data.tile_id
              ) &&
              updatedState.data.board.wells[key].available
            ) {
              updatedState.data.board.wells[key].available = false;
              updatedState.data.board.wells[key].collected = true;
              updatedState.data[data.player].faeria += 1;
            }
          });
        }
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
      const removeOccupant = {
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
      if (
        updatedState.data.board.tiles[data.tile_id].occupant.movement.dash >
          0 &&
        !updatedState.data.board.tiles[data.tile_id].occupant.hasDashed
      ) {
        updatedState.data.board.tiles[data.tile_id].occupant.hasDashed = true;
        if (
          updatedState.data.board.tiles[data.tile_id].occupant.movement.haste
        ) {
          Object.keys(updatedState.data.board.wells).forEach((key) => {
            if (
              updatedState.data.board.wells[key].adjacent.includes(
                data.tile_id
              ) &&
              updatedState.data.board.wells[key].available
            ) {
              updatedState.data.board.wells[key].available = false;
              updatedState.data.board.wells[key].collected = true;
              updatedState.data[data.player].faeria += 1;
            }
          });
        }
      } else {
        updatedState.data.board.tiles[data.tile_id].occupant.hasMoved = true;
        if (updatedState.data.board.tiles[data.tile_id].occupant.ranged) {
          updatedState.data.board.tiles[
            data.tile_id
          ].occupant.hasAttacked = true;
        }
        Object.keys(updatedState.data.board.wells).forEach((key) => {
          if (
            updatedState.data.board.wells[key].adjacent.includes(
              data.tile_id
            ) &&
            updatedState.data.board.wells[key].available
          ) {
            updatedState.data.board.wells[key].available = false;
            updatedState.data.board.wells[key].collected = true;
            updatedState.data[data.player].faeria += 1;
          }
        });
      }
      Object.keys(updatedState.gods).forEach((god) => {
        updatedState.gods[god].selectable = false;
      });
      updatedState.currentAction = "";
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
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
      if (
        updatedState.tiles[data.tile_id].adjacent.includes(selected_occupant_id)
      ) {
        attacker.health -= defender.attack;
      }
      if (defender.protection) {
        defender.protection = false;
      } else {
        defender.health -= attacker.attack;
      }
      attacker.hasAttacked = true;
      attacker.hasMoved = true;
      attacker.hasDashed = true;
      updatedState.data.board.tiles[selected_occupant_id].occupant =
        attacker.health > 0 ? attacker : removeOccupant;
      updatedState.data.board.tiles[data.tile_id].occupant =
        defender.health > 0 ? defender : removeOccupant;
      const EP = new EventProcessor(updatedState, data);
      if (attacker.health <= 0 && attacker.effects.lastword) {
        EP.processLastwordEffect(attacker, selected_occupant_id);
      }
      if (defender.health <= 0 && defender.effects.lastword) {
        EP.processLastwordEffect(defender, data.tile_id);
      }
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
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
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
      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });
      return updatedState;
    },
    END_TURN: (currentState, data) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.data[data.opponent].wheel_used = false;
      const god = {
        player1: "D6",
        player2: "D0",
      };
      if (updatedState.data.status.turn > 1) {
        updatedState.data[data.opponent].faeria += 3;
        if (updatedState.data[data.opponent].deck.length > 0) {
          if (updatedState.data[data.opponent].hand.length < 9) {
            updatedState.data[data.opponent].hand.push(
              updatedState.data[data.opponent].deck.splice(0, 1)[0]
            );
          } else {
            updatedState.data[data.opponent].deck.splice(0, 1);
          }
        } else {
          updatedState.data.board.gods[god[data.opponent]].health -=
            ++updatedState.data[data.opponent].health_dmg;
          if (updatedState.data.board.gods[god[data.opponent]].health <= 0) {
            updatedState.data.status.finished = true;
            updatedState.data.status.winner = data.player;
          }
        }
      }
      const removeOccupant = {
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
      Object.keys(updatedState.data.board.tiles).forEach((key) => {
        if (
          (updatedState.data.board.tiles[key].occupant.movement.special
            .aquatic &&
            !updatedState.data.board.tiles[key].occupant.movement.special
              .flying &&
            updatedState.data.board.tiles[key].occupant.player ===
              data.player &&
            updatedState.data.board.tiles[key].type !== "lake" &&
            updatedState.data.board.tiles[key].type !== "none") ||
          (!updatedState.data.board.tiles[key].occupant.movement.special
            .aquatic &&
            !updatedState.data.board.tiles[key].occupant.movement.special
              .flying &&
            updatedState.data.board.tiles[key].occupant.player ===
              data.player &&
            updatedState.data.board.tiles[key].type === "none")
        ) {
          const occupant = updatedState.data.board.tiles[key].occupant;
          updatedState.data.board.tiles[key].occupant = removeOccupant;
          const EP = new EventProcessor(updatedState, data);
          if (occupant.health <= 0 && occupant.effects.lastword) {
            EP.processLastwordEffect(occupant, key);
          }
        } else {
          updatedState.data.board.tiles[key].occupant.hasMoved = false;
          updatedState.data.board.tiles[key].occupant.hasAttacked = false;
        }

        //Cheekshrooms
        if (
          updatedState.data.board.tiles[key].occupant.id === 28 &&
          updatedState.data.status.current ===
            updatedState.data.board.tiles[key].occupant.player
        ) {
          updatedState.tiles[key].adjacent.forEach((adjTile) => {
            if (
              updatedState.data.board.tiles[adjTile].occupant.player ===
              data.opponent
            ) {
              let target = updatedState.data.board.tiles[adjTile].occupant;
              if (target.protection) {
                target.protection = false;
              } else {
                target.health -= 1;
              }
              updatedState.data.board.tiles[adjTile].occupant =
                target.health > 0 ? target : removeOccupant;
              const EP = new EventProcessor(updatedState, data);
              if (target.health <= 0 && target.effects.lastword) {
                EP.processLastwordEffect(target, adjTile);
              }
            }
          });
        }
        //Cheekshrooms
      });

      const anyAdjacent = (tile) =>
        updatedState.data.board.tiles[tile].occupant.player === data.opponent;
      Object.keys(updatedState.data.board.wells).forEach((key) => {
        if (updatedState.data.board.wells[key].adjacent.some(anyAdjacent)) {
          updatedState.data.board.wells[key].available = false;
          updatedState.data.board.wells[key].collected = true;
          updatedState.data[data.opponent].faeria += 1;
        } else {
          updatedState.data.board.wells[key].available = true;
          updatedState.data.board.wells[key].collected = false;
        }
      });

      Object.keys(updatedState.data.board.tiles).forEach((key) => {
        if (
          updatedState.data.board.tiles[key].occupant.effects.production &&
          updatedState.data.board.tiles[key].occupant.player === data.opponent
        ) {
          const EP = new EventProcessor(updatedState, data);
          EP.processProductionEffect(
            updatedState.data.board.tiles[key].occupant,
            key
          );
        }
      });

      updatedState.data.status.turn += 1;
      updatedState.data.status.current = data.opponent;

      //Wheel
      Object.keys(updatedState.wheelbuttons).forEach((wheel) => {
        updatedState.wheelbuttons[wheel].selectable = true;
        updatedState.wheelbuttons[wheel].selected = false;
      });

      //Hand
      Object.keys(updatedState.hand).forEach((card) => {
        updatedState.hand[card].selectable = true;
        updatedState.hand[card].selected = false;
      });

      //Tiles and Occupants
      Object.keys(updatedState.tiles).forEach((tile) => {
        updatedState.tiles[tile].selectable = false;
        updatedState.tiles[tile].selected = false;
        updatedState.tiles[tile].occupantSelectable = true;
        updatedState.tiles[tile].occupantSelected = false;
      });

      //Gods
      Object.keys(updatedState.gods).forEach((god) => {
        updatedState.gods[god].selectable = false;
      });

      updatedState.currentAction = "";

      const formdata = new FormData();
      formdata.append("react_state", JSON.stringify(updatedState));
      formdata.append("id", document.getElementById("game_id").value);
      axios
        .post(
          "https://cheekia.loca.lt/faeria/Faeria/utils/saveState.php",
          formdata
        )
        .catch((error) => {
          console.log("Network Error", error.message);
        });

      return updatedState;
    },
  };
  initStore(actions, loadStore);
};

export default configureStore;
