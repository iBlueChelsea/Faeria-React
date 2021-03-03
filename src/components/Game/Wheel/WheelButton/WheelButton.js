import React from "react";
import {useStore} from '../../../../hooks-store/store';

const WheelButton = (props) => {
  const [state, dispatch] = useStore();
  const selectable = (state.wheelbuttons[props.id].selectable) ? '' : ' not-selectable';
  const hexSize = props.hexSize;
  const startPosX = props.startPosX;
  const startPosY = props.startPosY;
  const points = [
    [startPosX + hexSize * 0.5, startPosY].join(),
    [startPosX + hexSize * 1.5, startPosY].join(),
    [startPosX + hexSize * 2, startPosY + Math.sqrt(3) * hexSize * 0.5].join(),
    [startPosX + hexSize * 1.5, startPosY + Math.sqrt(3) * hexSize].join(),
    [startPosX + hexSize * 0.5, startPosY + Math.sqrt(3) * hexSize].join(),
    [startPosX, startPosY + Math.sqrt(3) * hexSize * 0.5].join(),
  ].join(" ");

  const user = 'player1';

  const selectHandler = () => {
    if (state.wheelbuttons[props.id].selectable) {
      switch(props.id) {
        case 'wheel-B3':
          dispatch('DRAW_CARD', user);
          break;
        case 'wheel-C2':
          dispatch('PLUS_FAERIA', user);
          break;
        default:
          dispatch('SELECT_LAND', {player: user, wheelbutton_id: props.id});
      }
    }
  }

  return (
    <polygon
      className={props.className + selectable}
      id={props.id}
      points={points}
      onClick={selectHandler}
    />
  );
};

export default WheelButton;