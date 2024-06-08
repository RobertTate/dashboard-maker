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
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type CustomToolbarProps = {
  activeToolbarKey: string;
  setActiveToolbarKey: (key: string) => void;
};

export default function CustomToolbar(props: CustomToolbarProps) {
  const { activeToolbarKey, setActiveToolbarKey } = props;
  const activeEditor = useCellValue(activeEditor$);
  const inFocus = useCellValue(inFocus$);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    if (activeEditor) {
      if (activeToolbarKey !== activeEditor._key) {
        if (inFocus) {
          setActiveToolbarKey(activeEditor._key);
          setShowToolbar(true);
        } else {
          setShowToolbar(false);
        }
      }
    }
  });

  return showToolbar ? (
    <>
      {createPortal(
        <>
          {" "}
          <UndoRedo />
          <BlockTypeSelect />
          <BoldItalicUnderlineToggles />
          <CodeToggle />
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
}
