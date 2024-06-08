import {
  MDXEditor,
  headingsPlugin,
  imagePlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  linkPlugin,
  linkDialogPlugin,
  directivesPlugin,
  thematicBreakPlugin,
  tablePlugin,
  AdmonitionDirectiveDescriptor,
  toolbarPlugin
} from "@mdxeditor/editor";
import debounce from "lodash.debounce";
import { useCallback } from "react";
import CustomToolbar from "./CustomToolbar";
import CustomLinkDialog from "./CustomLinkDialog";

import type { WidgetProps } from "../types";

type WidgetContainerProps = {
  item: WidgetProps;
  updateWidgetContent: (item: WidgetProps, content: string) => void;
  activeToolbarKey: string;
  setActiveToolbarKey: (key: string) => void;
};

export default function Widget({
  item,
  updateWidgetContent,
  activeToolbarKey,
  setActiveToolbarKey
}: WidgetContainerProps) {
  const debouncedUpdate = useCallback(
    debounce((content: string) => {
      return updateWidgetContent(item, content)
    }, 500),
    [item, updateWidgetContent],
  );

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
          LinkDialog: (() => {
            return (
              <>
                <CustomLinkDialog />
              </>
            )
          })
        }),
        directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <CustomToolbar
                activeToolbarKey={activeToolbarKey}
                setActiveToolbarKey={setActiveToolbarKey}
              />
            </>
          )
        }),
        markdownShortcutPlugin(),
      ]}
      contentEditableClassName="editable-md-widget"
      onChange={(content: string) => debouncedUpdate(content)}
    />
  );
}
