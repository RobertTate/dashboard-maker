import type { DirectiveDescriptor } from "@mdxeditor/editor";
import { TextDirective } from "mdast-util-directive";

export interface TooltipDirectiveNode extends TextDirective {
  name: "tooltip";
}

export const TooltipDirectiveDescriptor: DirectiveDescriptor<TooltipDirectiveNode> =
  {
    name: "tooltip",
    type: "textDirective",
    testNode(node) {
      return node.name === "tooltip";
    },
    attributes: [],
    hasChildren: false,
    Editor: ({ mdastNode }) => {
      const nodeChildren = mdastNode.children;
      const textChild = nodeChildren.find((child) => child.type === "text");
      const textChildValue = textChild?.value || "";
      const tooltipId = mdastNode?.attributes?.id || "";

      return (
        <span data-tooltip-id={tooltipId} className="tooltip-trigger">
          {textChildValue}
        </span>
      );
    },
  };
