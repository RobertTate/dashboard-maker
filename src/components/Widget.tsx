import {
  AdmonitionDirectiveDescriptor,
  MDXEditor,
  directivesPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import debounce from "lodash.debounce";
import { memo } from "react";

import { DiceNotationDirectiveDescriptor } from "../plugins/DiceNotationDirectiveDescriptor";
import { diceNotationMarkdownShortcutPlugin } from "../plugins/diceNotationMarkdownShortcutPlugin";
import type { WidgetProps } from "../types";
import CustomLinkDialog from "./CustomLinkDialog";
import CustomToolbar from "./CustomToolbar";

type WidgetContainerProps = {
  item: WidgetProps;
  updateWidgetContent: (item: WidgetProps, content: string) => void;
  activeToolbarKey: string;
  setActiveToolbarKey: (key: string) => void;
};

const Widget = memo(
  ({
    item,
    updateWidgetContent,
    activeToolbarKey,
    setActiveToolbarKey,
  }: WidgetContainerProps) => {
    const debouncedUpdate = debounce((content: string) => {
      return updateWidgetContent(item, content);
    }, 500);

    return (
      <MDXEditor
        markdown={`${item.content}`}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          imagePlugin({
            imagePreviewHandler(imageSource) {
              return Promise.resolve(imageSource);
            },
          }),
          thematicBreakPlugin(),
          tablePlugin(),
          linkPlugin(),
          linkDialogPlugin({
            LinkDialog: () => {
              return (
                <>
                  <CustomLinkDialog />
                </>
              );
            },
          }),
          directivesPlugin({
            directiveDescriptors: [
              AdmonitionDirectiveDescriptor,
              DiceNotationDirectiveDescriptor,
            ],
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <CustomToolbar
                  activeToolbarKey={activeToolbarKey}
                  setActiveToolbarKey={setActiveToolbarKey}
                />
              </>
            ),
          }),
          markdownShortcutPlugin(),
          diceNotationMarkdownShortcutPlugin(),
        ]}
        contentEditableClassName="editable-md-widget"
        onChange={(content: string) => debouncedUpdate(content)}
      />
    );
  },
);

Widget.displayName = "Widget";

export default Widget;
