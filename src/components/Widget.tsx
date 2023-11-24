import { useCallback } from "react";
import { MDXEditor } from "@mdxeditor/editor/MDXEditor";
import { headingsPlugin } from "@mdxeditor/editor/plugins/headings";
import { listsPlugin } from "@mdxeditor/editor/plugins/lists";
import { quotePlugin } from "@mdxeditor/editor/plugins/quote";
import { markdownShortcutPlugin } from "@mdxeditor/editor/plugins/markdown-shortcut";
import debounce from "lodash.debounce";

import type { WidgetProps } from "../types";

type WidgetContainerProps = {
  item: WidgetProps;
  updateWidgetContent: (item: WidgetProps, content: string) => void;
};

export default function WidgetContainer({
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
      contentEditableClassName="editableMDWidget"
      onChange={(content: string) => debouncedUpdate(content)}
    />
  );
}
