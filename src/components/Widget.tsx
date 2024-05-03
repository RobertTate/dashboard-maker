import { 
  MDXEditor,
  headingsPlugin,
  imagePlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
} from "@mdxeditor/editor";
import debounce from "lodash.debounce";
import { useCallback } from "react";

import type { WidgetProps } from "../types";

type WidgetContainerProps = {
  item: WidgetProps;
  updateWidgetContent: (item: WidgetProps, content: string) => void;
};

export default function Widget({
  item,
  updateWidgetContent,
}: WidgetContainerProps) {
  const debouncedUpdate = useCallback(
    debounce((content: string) => updateWidgetContent(item, content), 500),
    [item, updateWidgetContent],
  );

  return (
    <MDXEditor
      markdown={`${item.content}`}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
        imagePlugin({
          imagePreviewHandler(imageSource) {
            return Promise.resolve(imageSource);
          },
        }),
      ]}
      contentEditableClassName="editable-md-widget"
      onChange={(content: string) => debouncedUpdate(content)}
    />
  );
}
