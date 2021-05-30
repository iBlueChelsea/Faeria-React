import React from "react";
import { useStore } from "../../../../hooks-store/store";
import images_ui from "../../../../assets/images/ui/images_ui";

const WheelButton = (props) => {
  const [state, dispatch] = useStore();
  const selectable = state.wheelbuttons[props.id].selectable
    ? ""
    : " not-selectable";
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

  const selectHandler = () => {
    if (state.wheelbuttons[props.id].selectable) {
      const payload = {
        player: props.user,
        opponent: props.opponent,
      };
      switch (props.id) {
        case "wheel-B3":
          dispatch("DRAW_CARD", payload);
          break;
        case "wheel-C2":
          dispatch("PLUS_FAERIA", props.user);
          break;
        default:
          dispatch("SELECT_LAND", {
            player: props.user,
            wheelbutton_id: props.id,
          });
      }
    }
  };

  return (
    <g>
      <defs>
        <pattern
          id={"buttonimage-" + props.id}
          height="100%"
          width="100%"
          patternContentUnits="objectBoundingBox"
        >
          <image
            height="1"
            width="1"
            preserveAspectRatio="none"
            href={images_ui[props.id]}
          />
        </pattern>
      </defs>
      <polygon
        className={props.className + selectable}
        fill={"url(#buttonimage-" + props.id + ")"}
        id={props.id}
        points={points}
        onClick={selectHandler}
      />
    </g>
  );
};

export default WheelButton;
