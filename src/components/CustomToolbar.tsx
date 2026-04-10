import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertAdmonition,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  activeEditor$,
  inFocus$,
  useCellValue,
} from "@mdxeditor/editor";
import { memo, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ActiveToolbarContext } from "../ActiveToolbarContext";
import type { TextAlignment as Alignment } from "../types";
import { InsertTooltip } from "./InsertTooltip";
import { TextAlignment } from "./TextAlignment";

type CustomToolbarProps = {
  updateWidgetTextAlignment: (itemId: string, alignment: Alignment) => void;
  onTooltipCreate: (widgetId: string, tooltipId: string) => void;
};

export const CustomToolbar = memo((props: CustomToolbarProps) => {
  const { updateWidgetTextAlignment, onTooltipCreate } = props;
  const activeToolbarKeyRef = useContext(ActiveToolbarContext);
  const activeEditor = useCellValue(activeEditor$);
  const inFocus = useCellValue(inFocus$);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeGridItemId, setActiveGridItemId] = useState("");
  const [activeGridItemTextAlign, setActiveGridItemTextAlign] =
    useState<Alignment>("center");

  useEffect(() => {
    if (!activeEditor) return;

    if (inFocus) {
      activeToolbarKeyRef.current = activeEditor._key;
      const rootEL = activeEditor._rootElement;
      // Yikes.
      const gridItem =
        rootEL?.parentElement?.parentElement?.parentElement?.parentElement
          ?.parentElement;
      const gridItemId = gridItem?.id as string;
      const gridItemTextAlign = gridItem?.dataset.align as Alignment;
      setActiveGridItemId(gridItemId);
      setActiveGridItemTextAlign(gridItemTextAlign);
      setShowToolbar(true);
    } else {
      // Defer the hide check so that if another editor's effect claims
      // the ref first (gaining focus), this toolbar will see the new
      // owner and hide. If no one else claims it (e.g. toolbar button
      // click), the toolbar stays visible.
      const timeout = setTimeout(() => {
        if (activeToolbarKeyRef.current !== activeEditor._key) {
          setShowToolbar(false);
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [activeEditor, inFocus, activeToolbarKeyRef]);

  return showToolbar ? (
    <>
      {createPortal(
        <>
          {" "}
          <UndoRedo />
          <div data-type="block-type-select">
            <BlockTypeSelect />
          </div>
          <BoldItalicUnderlineToggles />
          <CodeToggle />
          <TextAlignment
            itemId={activeGridItemId}
            gridItemTextAlign={activeGridItemTextAlign}
            updateWidgetTextAlignment={updateWidgetTextAlignment}
          />
          <ListsToggle />
          <InsertThematicBreak />
          <CreateLink />
          <InsertTable />
          <InsertAdmonition />
          <InsertTooltip
            widgetId={activeGridItemId}
            onTooltipCreate={onTooltipCreate}
          />
        </>,
        document.getElementById("toolbar") as Element,
      )}
    </>
  ) : null;
});
