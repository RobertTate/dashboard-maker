import { MDXEditor } from '@mdxeditor/editor/MDXEditor'
import { 
  headingsPlugin,
  markdownShortcutPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin
} from '@mdxeditor/editor'
import type { WidgetProps } from "../types"

type WidgetContainerProps = {
  item: WidgetProps;
  updateWidgetContent: (item: WidgetProps, content: string) => void
}

export default function WidgetContainer({ item, updateWidgetContent }: WidgetContainerProps) {

  return (
      <MDXEditor 
        markdown={`${item.content}`}
        // toMarkdownOptions={}
        plugins={[
          headingsPlugin(),
          markdownShortcutPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
        ]}
        contentEditableClassName="editableMDWidget"
        onChange={(content: string) => updateWidgetContent(item, content) }
      />
  )
}
