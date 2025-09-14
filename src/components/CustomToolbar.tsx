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
import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { TextAlignment as Alignment } from "../types";
import { TextAlignment } from "./TextAlignment";

type CustomToolbarProps = {
  activeToolbarKey: string;
  setActiveToolbarKey: (key: string) => void;
  updateWidgetTextAlignment: (itemId: string, alignment: Alignment) => void;
};

export const CustomToolbar = memo((props: CustomToolbarProps) => {
  const { activeToolbarKey, setActiveToolbarKey, updateWidgetTextAlignment } =
    props;
  const activeEditor = useCellValue(activeEditor$);
  const inFocus = useCellValue(inFocus$);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeGridItemId, setActiveGridItemId] = useState("");
  const [activeGridItemTextAlign, setActiveGridItemTextAlign] =
    useState<Alignment>("center");

  useEffect(() => {
    if (activeEditor) {
      if (activeToolbarKey !== activeEditor._key) {
        if (inFocus) {
          const rootEL = activeEditor._rootElement;
          // Yikes.
          const gridItem =
            rootEL?.parentElement?.parentElement?.parentElement?.parentElement
              ?.parentElement;
          const gridItemId = gridItem?.id as string;
          const gridItemTextAlign = gridItem?.dataset.align as Alignment;
          setActiveGridItemId(gridItemId);
          setActiveGridItemTextAlign(gridItemTextAlign);
          setActiveToolbarKey(activeEditor._key);
          setShowToolbar(true);
        } else {
          setShowToolbar(false);
        }
      }
    }
  }, [activeEditor, activeToolbarKey, inFocus, setActiveToolbarKey]);

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
        </>,
        document.getElementById("toolbar") as Element,
      )}
    </>
  ) : null;
});
