import { memo, useState } from "react";
import leftAlign from "../assets/leftAlign.svg";
import centerAlign from "../assets/centerAlign.svg";
import rightAlign from "../assets/rightAlign.svg";
import { ButtonOrDropdownButton } from "@mdxeditor/editor";
import type { TextAlignment as Alignment } from "../types";

type TextAlignmentProps = {
  itemId: string;
  gridItemTextAlign: Alignment;
  updateWidgetTextAlignment: (itemId: string, alignment: Alignment) => void;
}

const imageSourceMap = {
  "center": centerAlign,
  "left": leftAlign,
  "right": rightAlign,
}

export const TextAlignment = memo(({ itemId, gridItemTextAlign, updateWidgetTextAlignment }: TextAlignmentProps) => {
  const [alignmentState, setAlignmentState] = useState<Alignment>(gridItemTextAlign);

  const imageSource = imageSourceMap[alignmentState]

  return (
    <ButtonOrDropdownButton
      title="Text Alignment"
      items={
        [
          {
            value: "left",
            label: "Left"
          },
          {
            value: "center",
            label: "Center"
          },
          {

            value: "right",
            label: "Right"
          },
        ]
      }
      onChoose={(value) => {
        setAlignmentState(value);
        updateWidgetTextAlignment(itemId, value);
      }}
    >
      <img width={20} height={20} src={imageSource} alt={`align ${alignmentState}`} />
    </ButtonOrDropdownButton>
  )
});
