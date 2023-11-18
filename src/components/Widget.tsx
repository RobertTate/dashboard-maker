import { MDXEditor } from '@mdxeditor/editor/MDXEditor'
import { headingsPlugin } from '@mdxeditor/editor/plugins/headings'
import { listsPlugin } from '@mdxeditor/editor/plugins/lists'
import { quotePlugin } from '@mdxeditor/editor/plugins/quote'
import { thematicBreakPlugin } from '@mdxeditor/editor/plugins/thematic-break'
import { markdownShortcutPlugin } from '@mdxeditor/editor/plugins/markdown-shortcut'
import { linkPlugin } from '@mdxeditor/editor/plugins/link'

import type { WidgetProps } from "../types"

type WidgetContainerProps = {
  item: WidgetProps;
  updateWidgetContent: (item: WidgetProps, content: string) => void
}

export default function WidgetContainer({ item, updateWidgetContent }: WidgetContainerProps) {

  return (
    <MDXEditor
      markdown={`${item.content}`}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        linkPlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin()
      ]}
      contentEditableClassName="editableMDWidget"
      onChange={(content: string) => updateWidgetContent(item, content)}
    />
  )
}
