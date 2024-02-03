import { MDXEditor } from "@mdxeditor/editor/MDXEditor";
import { headingsPlugin } from "@mdxeditor/editor/plugins/headings";
import { listsPlugin } from "@mdxeditor/editor/plugins/lists";
import { markdownShortcutPlugin } from "@mdxeditor/editor/plugins/markdown-shortcut";
import { quotePlugin } from "@mdxeditor/editor/plugins/quote";
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
      ]}
      contentEditableClassName="editable-md-widget"
      onChange={(content: string) => debouncedUpdate(content)}
    />
  );
}
