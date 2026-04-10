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
} from "@mdxeditor/editor";

export const TooltipToolbar = () => {
  return (
    <>
      <UndoRedo />
      <div data-type="block-type-select">
        <BlockTypeSelect />
      </div>
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <ListsToggle />
      <InsertThematicBreak />
      <CreateLink />
      <InsertTable />
      <InsertAdmonition />
    </>
  );
};
