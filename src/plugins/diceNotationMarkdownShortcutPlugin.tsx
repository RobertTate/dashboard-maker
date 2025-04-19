import {
  ElementTransformer,
  TextFormatTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin.js";
import {
  $createDirectiveNode,
  $isDirectiveNode,
  DirectiveNode,
  addComposerChild$,
  addNestedEditorChild$,
  realmPlugin,
} from "@mdxeditor/editor";

import type { DiceNotationDirectiveNode } from "./DiceNotationDirectiveDescriptor";

const diceNotationMarkdownShortcutPlugin = realmPlugin({
  init(realm) {
    const transformers = pickTransformersForActivePlugins();
    realm.pubIn({
      [addComposerChild$]: () => (
        <MarkdownShortcutPlugin transformers={transformers} />
      ),
      [addNestedEditorChild$]: () => (
        <MarkdownShortcutPlugin transformers={transformers} />
      ),
    });
  },
});

function pickTransformersForActivePlugins() {
  const transformers: (
    | ElementTransformer
    | TextFormatTransformer
    | TextMatchTransformer
  )[] = [];
  const DICE_NOTATION_REGEX = new RegExp(/\b\d+d\d+\S*/);
  const DICE_NOTATION: TextMatchTransformer = {
    dependencies: [DirectiveNode],
    export: (node) => {
      if (!$isDirectiveNode(node)) {
        return null;
      }

      // @ts-ignore
      return `:dice[${node?.__mdastNode?.children?.[0]?.value}]`;
    },
    importRegExp: DICE_NOTATION_REGEX,
    regExp: DICE_NOTATION_REGEX,
    replace: (textNode, match) => {
      let diceText = match[0];
      let alias = "";

      if (diceText.includes("@")) {
        const [newText, potentialAlias] = diceText.split("@");
        diceText = newText;
        alias = potentialAlias;
      }

      const mdastNode: DiceNotationDirectiveNode = {
        name: "dice",
        type: "textDirective",
        attributes: {
          alias,
        },
        children: [
          {
            type: "text",
            value: diceText,
          },
        ],
      };

      const diceNotationNode = $createDirectiveNode(mdastNode);
      textNode.replace(diceNotationNode);
    },
    trigger: " ",
    type: "text-match",
  };
  transformers.push(DICE_NOTATION);

  // These additional Notation Handlers are kind of legacy at this point...
  // seeing as you can use the alias feature to make the displayed text be anything you want now.
  const DC_NOTATION_REGEX = new RegExp(/\bDC\d+\b/);
  const DC_NOTATION: TextMatchTransformer = {
    dependencies: [DirectiveNode],
    export: (node) => {
      if (!$isDirectiveNode(node)) {
        return null;
      }

      // @ts-ignore
      return `:dice[${node?.__mdastNode?.children?.[0]?.value}]{isDCNotation="true"}`;
    },
    importRegExp: DC_NOTATION_REGEX,
    regExp: DC_NOTATION_REGEX,
    replace: (textNode, match) => {
      const mdastNode: DiceNotationDirectiveNode = {
        name: "dice",
        type: "textDirective",
        attributes: {
          isDCNotation: "true",
        },
        children: [
          {
            type: "text",
            value: match[0],
          },
        ],
      };

      const diceNotationNode = $createDirectiveNode(mdastNode);
      textNode.replace(diceNotationNode);
    },
    trigger: " ",
    type: "text-match",
  };
  transformers.push(DC_NOTATION);

  const MOD_NOTATION_REGEX = new RegExp(/(?<=^|\s)[+-]\d+\b/);
  const MOD_NOTATION: TextMatchTransformer = {
    dependencies: [DirectiveNode],
    export: (node) => {
      if (!$isDirectiveNode(node)) {
        return null;
      }

      // @ts-ignore
      return `:dice[${node?.__mdastNode?.children?.[0]?.value}]{isModNotation="true"}`;
    },
    importRegExp: MOD_NOTATION_REGEX,
    regExp: MOD_NOTATION_REGEX,
    replace: (textNode, match) => {
      const mdastNode: DiceNotationDirectiveNode = {
        name: "dice",
        type: "textDirective",
        attributes: {
          isModNotation: "true",
        },
        children: [
          {
            type: "text",
            value: match[0],
          },
        ],
      };

      const diceNotationNode = $createDirectiveNode(mdastNode);
      textNode.replace(diceNotationNode);
    },
    trigger: " ",
    type: "text-match",
  };
  transformers.push(MOD_NOTATION);

  return transformers;
}

export { diceNotationMarkdownShortcutPlugin };
