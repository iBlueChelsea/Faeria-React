import { initStore } from "./store";

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
      if (data.player === "player2") {
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
      Object.keys(newWheelState).forEach((key) => {
        if (key !== data.wheelbutton_id) {
          newWheelState[key].selectable = !newWheelState[key].selectable;
        }
      });
      updatedState.wheelbuttons = newWheelState;
      const newTileState = updatedState.tiles;
      const anyAdjacent = (tile) =>
        updatedState.data.board.tiles[tile].owner === data.player;
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
              updatedState.gods[god_key].adjacent.includes(key)
            ) {
              newTileState[key].selectable = true;
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
      updatedState.data[player].hand.push(
        updatedState.data[player].deck.splice(0, 1)[0]
      );
      updatedState.wheel.used_wheel = true;
      return updatedState;
    },
    PLUS_FAERIA: (currentState, player) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.data[player].faeria++;
      updatedState.wheel.used_wheel = true;
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
      Object.keys(updatedState.wheelbuttons).forEach((key) => {
        updatedState.wheelbuttons[key].selectable = true;
      });
      Object.keys(updatedState.tiles).forEach((key) => {
        updatedState.tiles[key].selectable = false;
      });
      updatedState.wheel.used_wheel = true;
      return updatedState;
    },
    END_TURN: (currentState) => {
      const updatedState = JSON.parse(JSON.stringify(currentState));
      updatedState.wheel.used_wheel = false;
      updatedState.wheel.ended_turn = true;
      return updatedState;
    },
  };
  initStore(actions, {
    currentAction: "",
    wheel: {
      used_wheel: false,
      ended_turn: false,
    },
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
      0: {
        selectable: true,
        selected: false,
      },
      1: {
        selectable: true,
        selected: false,
      },
      2: {
        selectable: true,
        selected: false,
      },
    },
    tiles: {
      A1: {
        selectable: false,
        selected: false,
        adjacent: ["A2", "B2", "B3"],
      },
      A2: {
        selectable: false,
        selected: false,
        adjacent: ["A1", "B3", "B4"],
      },
      B1: {
        selectable: false,
        selected: false,
        adjacent: ["B2", "C1", "C2"],
      },
      B2: {
        selectable: false,
        selected: false,
        adjacent: ["A1", "B1", "B3", "C2", "C3"],
      },
      B3: {
        selectable: false,
        selected: false,
        adjacent: ["A1", "A2", "B2", "B4", "C3", "C4"],
      },
      B4: {
        selectable: false,
        selected: false,
        adjacent: ["A2", "B3", "B5", "C4", "C5"],
      },
      B5: {
        selectable: false,
        selected: false,
        adjacent: ["B4", "C5", "C6"],
      },
      C1: {
        selectable: false,
        selected: false,
        adjacent: ["B1", "C2", "D1"],
      },
      C2: {
        selectable: false,
        selected: false,
        adjacent: ["B1", "B2", "C1", "C3", "D1", "D2"],
      },
      C3: {
        selectable: false,
        selected: false,
        adjacent: ["B2", "B3", "C2", "C4", "D2", "D3"],
      },
      C4: {
        selectable: false,
        selected: false,
        adjacent: ["B3", "B4", "C3", "C5", "D3", "D4"],
      },
      C5: {
        selectable: false,
        selected: false,
        adjacent: ["B4", "B5", "C4", "C6", "D4", "D5"],
      },
      C6: {
        selectable: false,
        selected: false,
        adjacent: ["B5", "C5", "D5"],
      },
      D1: {
        selectable: false,
        selected: false,
        adjacent: ["C1", "C2", "D2", "E1", "E2"],
      },
      D2: {
        selectable: false,
        selected: false,
        adjacent: ["C2", "C3", "D1", "D3", "E2", "E3"],
      },
      D3: {
        selectable: false,
        selected: false,
        adjacent: ["C3", "C4", "D2", "D4", "E3", "E4"],
      },
      D4: {
        selectable: false,
        selected: false,
        adjacent: ["C4", "C5", "D3", "D5", "E4", "E5"],
      },
      D5: {
        selectable: false,
        selected: false,
        adjacent: ["C5", "C6", "D4", "E5", "E6"],
      },
      E1: {
        selectable: false,
        selected: false,
        adjacent: ["D1", "E2", "F1"],
      },
      E2: {
        selectable: false,
        selected: false,
        adjacent: ["D1", "D2", "E1", "E3", "F1", "F2"],
      },
      E3: {
        selectable: false,
        selected: false,
        adjacent: ["D2", "D3", "E2", "E4", "F2", "F3"],
      },
      E4: {
        selectable: false,
        selected: false,
        adjacent: ["D3", "D4", "E3", "E5", "F3", "F4"],
      },
      E5: {
        selectable: false,
        selected: false,
        adjacent: ["D4", "D5", "E4", "E6", "F4", "F5"],
      },
      E6: {
        selectable: false,
        selected: false,
        adjacent: ["D5", "E5", "F5"],
      },
      F1: {
        selectable: false,
        selected: false,
        adjacent: ["E1", "E2", "F2"],
      },
      F2: {
        selectable: false,
        selected: false,
        adjacent: ["E2", "E3", "F1", "F3", "G1"],
      },
      F3: {
        selectable: false,
        selected: false,
        adjacent: ["E3", "E4", "F2", "F4", "G1", "G2"],
      },
      F4: {
        selectable: false,
        selected: false,
        adjacent: ["E4", "E5", "F3", "F5", "G2"],
      },
      F5: {
        selectable: false,
        selected: false,
        adjacent: ["E5", "E6", "F4"],
      },
      G1: {
        selectable: false,
        selected: false,
        adjacent: ["F2", "F3", "G2"],
      },
      G2: {
        selectable: false,
        selected: false,
        adjacent: ["F3", "F4", "G1"],
      },
    },
    gods: {
      D0: {
        selectable: false,
        selected: false,
        player: "player2",
        adjacent: ["C1", "D1", "E1"],
      },
      D6: {
        selectable: false,
        selected: false,
        player: "player1",
        adjacent: ["C6", "D5", "E6"],
      },
    },
    data: {
      status: {
        finished: false,
        turn: 0,
        current: "player1",
      },
      board: {
        wells: {
          A0: {
            available: true,
            collected: false,
          },
          A3: {
            available: true,
            collected: false,
          },
          G0: {
            available: true,
            collected: false,
          },
          G3: {
            available: true,
            collected: false,
          },
        },
        tiles: {
          A1: {
            type: "none",
            owner: "",
            occupant: {
              player: "",
              id: 0,
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
              hasMoved: false,
              hasAttacked: false,
              effectUsed: false,
            },
          },
          G1: {
            type: "none",
            owner: "",
            occupant: {
              player: "player1",
              id: 0,
              health: 0,
              attack: 0,
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
              health: 0,
              attack: 0,
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
        health: 20,
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
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
        },
      },
      player2: {
        name: "BabyBurrito",
        mulligan: true,
        health: 20,
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
            type: 0,
            faeria: 0,
            attack: 0,
            health: 0,
            effects: [],
          },
        },
      },
    },
  });
};

export default configureStore;
