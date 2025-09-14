import { ButtonOrDropdownButton } from "@mdxeditor/editor";
import { memo, useState } from "react";

import CenterAlign from "../assets/centerAlign.svg?react";
import LeftAlign from "../assets/leftAlign.svg?react";
import RightAlign from "../assets/rightAlign.svg?react";
import type { TextAlignment as Alignment } from "../types";

type TextAlignmentProps = {
  itemId: string;
  gridItemTextAlign: Alignment;
  updateWidgetTextAlignment: (itemId: string, alignment: Alignment) => void;
};

const imageSourceMap = {
  center: CenterAlign,
  left: LeftAlign,
  right: RightAlign,
};

export const TextAlignment = memo(
  ({
    itemId,
    gridItemTextAlign,
    updateWidgetTextAlignment,
  }: TextAlignmentProps) => {
    const [alignmentState, setAlignmentState] =
      useState<Alignment>(gridItemTextAlign);

    const TextAlignmentIcon = imageSourceMap[alignmentState];

    return (
      <ButtonOrDropdownButton
        title="Text Alignment"
        items={[
          {
            value: "left",
            label: "Left",
          },
          {
            value: "center",
            label: "Center",
          },
          {
            value: "right",
            label: "Right",
          },
        ]}
        onChoose={(value) => {
          setAlignmentState(value);
          updateWidgetTextAlignment(itemId, value);
        }}
      >
        <TextAlignmentIcon
          className="icon-svg-text-align"
          style={{
            width: "17px",
          }}
        />
      </ButtonOrDropdownButton>
    );
  },
);
