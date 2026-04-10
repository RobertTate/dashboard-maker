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
import { memo, useEffect, useMemo } from "react";

import { DiceNotationDirectiveDescriptor } from "../plugins/DiceNotationDirectiveDescriptor";
import { TooltipDirectiveDescriptor } from "../plugins/TooltipDirectiveDescriptor";
import { diceNotationMarkdownShortcutPlugin } from "../plugins/diceNotationMarkdownShortcutPlugin";
import type { TextAlignment, WidgetProps } from "../types";
import CustomLinkDialog from "./CustomLinkDialog";
import { CustomToolbar } from "./CustomToolbar";

type WidgetContainerProps = {
  item: WidgetProps;
  updateWidgetContent: (item: WidgetProps, content: string) => void;
  updateWidgetTextAlignment: (itemId: string, alignment: TextAlignment) => void;
  onTooltipCreate: (widgetId: string, tooltipId: string) => void;
};

const Widget = memo(
  ({
    item,
    updateWidgetContent,
    updateWidgetTextAlignment,
    onTooltipCreate,
  }: WidgetContainerProps) => {
    const debouncedUpdate = useMemo(
      () =>
        debounce((content: string) => {
          updateWidgetContent(item, content);
        }, 500),
      [item, updateWidgetContent],
    );

    useEffect(() => {
      return () => debouncedUpdate.cancel();
    }, [debouncedUpdate]);

    return (
      <MDXEditor
        key={item.id}
        data-id={item.id}
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
              TooltipDirectiveDescriptor,
            ],
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <CustomToolbar
                  updateWidgetTextAlignment={updateWidgetTextAlignment}
                  onTooltipCreate={onTooltipCreate}
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
