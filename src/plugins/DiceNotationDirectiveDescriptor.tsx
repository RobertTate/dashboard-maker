import type { DirectiveDescriptor } from "@mdxeditor/editor";
import { TextDirective } from "mdast-util-directive";

export interface DiceNotationDirectiveNode extends TextDirective {
  name: "dice";
}

export const DiceNotationDirectiveDescriptor: DirectiveDescriptor<DiceNotationDirectiveNode> =
  {
    name: "dice",
    type: "textDirective",
    testNode(node) {
      return node.name === "dice";
    },
    attributes: [],
    hasChildren: false,
    Editor: ({ mdastNode }) => {
      const nodeChildren = mdastNode.children;
      const textChild = nodeChildren.find((child) => child.type === "text");
      // @ts-ignore
      let textChildValue = textChild?.value;

      const isDCNotation = mdastNode?.attributes?.isDCNotation === "true";
      const isModNoation = mdastNode?.attributes?.isModNotation === "true";

      const getNotation = () => {
        if (isDCNotation) {
          const dc = textChildValue.replace("DC", "");
          return `1d20>${dc}`;
        } else if (isModNoation) {
          const regex = /^([+-])(\d+)$/;
          const match = textChildValue.match(regex);
          if (match) {
            const [, modifier, num] = match;
            if (modifier && num) {
              return `1d20${modifier}${num}`;
            }
          }
        } else {
          return textChildValue;
        }
      };

      return (
        <span data-dice-notation={getNotation()} className="dice-notation">
          {textChildValue}
        </span>
      );
    },
  };
