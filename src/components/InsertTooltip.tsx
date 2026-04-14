import {
  ButtonOrDropdownButton,
  $createDirectiveNode,
  activeEditor$,
  useCellValue,
} from "@mdxeditor/editor";
import { $getSelection, $isRangeSelection } from "lexical";
import { memo, useRef } from "react";

import InfoIcon from "../assets/info.svg?react";
import randomUUID from "../uid";

type InsertTooltipProps = {
  widgetId: string;
  onTooltipCreate: (widgetId: string, tooltipId: string) => void;
};

export const InsertTooltip = memo(
  ({ widgetId, onTooltipCreate }: InsertTooltipProps) => {
    const activeEditor = useCellValue(activeEditor$);
    const validationRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      if (!activeEditor) return;

      activeEditor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          showValidation();
          return;
        }

        const selectedText = selection.getTextContent();
        if (!selectedText.trim()) {
          showValidation();
          return;
        }

        const tooltipId = randomUUID();

        const mdastNode = {
          name: "tooltip" as const,
          type: "textDirective" as const,
          attributes: { id: tooltipId },
          children: [{ type: "text" as const, value: selectedText }],
        };

        const directiveNode = $createDirectiveNode(mdastNode);
        selection.insertNodes([directiveNode]);

        onTooltipCreate(widgetId, tooltipId);
      });
    };

    const showValidation = () => {
      if (validationRef.current) {
        validationRef.current.setCustomValidity(
          "Highlight some text first, then click this button to turn it into a tooltip.",
        );
        validationRef.current.reportValidity();
      }
    };

    return (
      <>
        <input
          ref={validationRef}
          type="text"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            opacity: 0,
            top: "29px",
            right: "15px",
            pointerEvents: "none",
          }}
          tabIndex={-1}
        />
        <ButtonOrDropdownButton
          title="Create Tooltip"
          onChoose={handleClick}
          items={[
            {
              value: "",
              label: "",
            },
          ]}
        >
          <InfoIcon
            className="icon-svg-info"
            style={{
              width: "17px",
            }}
          />
        </ButtonOrDropdownButton>
      </>
    );
  },
);
