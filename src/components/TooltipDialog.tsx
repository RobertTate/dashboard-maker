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
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "radix-ui";
import debounce from "lodash.debounce";
import { memo, useCallback, useEffect, useMemo } from "react";

import { DiceNotationDirectiveDescriptor } from "../plugins/DiceNotationDirectiveDescriptor";
import { diceNotationMarkdownShortcutPlugin } from "../plugins/diceNotationMarkdownShortcutPlugin";
import CustomLinkDialog from "./CustomLinkDialog";
import { TooltipToolbar } from "./TooltipToolbar";

import styles from "../styles/TooltipDialog.module.css";

type TooltipDialogProps = {
  tooltipId: string;
  content: string;
  onContentChange: (tooltipId: string, content: string) => void;
  onClose: () => void;
};

const TooltipDialog = memo(
  ({ tooltipId, content, onContentChange, onClose }: TooltipDialogProps) => {
    const handleClose = useCallback(() => {
      // Move focus away from the dialog's Lexical editor to prevent
      // undo/redo keystrokes from targeting the unmounted editor
      (document.activeElement as HTMLElement)?.blur();
      onClose();
    }, [onClose]);

    const debouncedUpdate = useMemo(
      () =>
        debounce((newContent: string) => {
          onContentChange(tooltipId, newContent);
        }, 500),
      [tooltipId, onContentChange],
    );

    // Cancel any pending debounced update on unmount
    useEffect(() => {
      return () => debouncedUpdate.cancel();
    }, [debouncedUpdate]);

    return (
      <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content
            className={styles.content}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={handleClose}
            aria-describedby={undefined}
          >
            <VisuallyHidden.Root>
              <Dialog.Title className={styles.title}>
                Edit Tooltip
              </Dialog.Title>
            </VisuallyHidden.Root>
            <div className={styles.editorContainer}>
              <MDXEditor
                autoFocus
                key={tooltipId}
                data-id={tooltipId}
                markdown={content}
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
                    LinkDialog: () => <CustomLinkDialog />,
                  }),
                  directivesPlugin({
                    directiveDescriptors: [
                      AdmonitionDirectiveDescriptor,
                      DiceNotationDirectiveDescriptor,
                    ],
                  }),
                  toolbarPlugin({
                    toolbarContents: () => <TooltipToolbar />,
                    toolbarPosition: "top",
                    toolbarClassName: styles.toolbar,
                  }),
                  markdownShortcutPlugin(),
                  diceNotationMarkdownShortcutPlugin(),
                ]}
                contentEditableClassName="editable-md-widget"
                onChange={(newContent: string) => debouncedUpdate(newContent)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

TooltipDialog.displayName = "TooltipDialog";

export default TooltipDialog;
