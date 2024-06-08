import * as Popover from '@radix-ui/react-popover'
import * as Tooltip from '@radix-ui/react-tooltip'
import React from 'react'

import { 
  editorRootElementRef$, 
  iconComponentFor$, 
  useTranslation, 
  cancelLinkEdit$,
  linkDialogState$,
  removeLink$,
  switchFromPreviewToLinkEdit$,
  updateLink$
} from "@mdxeditor/editor"

import { useForm } from 'react-hook-form'
import styles from '../styles/CustomLinkDialog.module.css';
import classNames from 'classnames'
import { useCellValues, usePublisher } from '@mdxeditor/gurx'

interface LinkEditFormProps {
  url: string
  title: string
  onSubmit: (link: { url: string; title: string }) => void
  onCancel: () => void
}

interface LinkFormFields {
  url: string
  title: string
}

function LinkEditForm({ url, title, onSubmit, onCancel }: LinkEditFormProps) {
  const {
    register,
    handleSubmit,
    reset: _
  } = useForm<LinkFormFields>({
    values: {
      url,
      title
    }
  })
  const t = useTranslation()

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e)
        e.stopPropagation()
        e.preventDefault()
      }}
      onReset={(e) => {
        e.stopPropagation()
        onCancel()
      }}
      className={classNames(styles.multiFieldForm, styles.linkDialogEditForm)}
    >
      <div className={styles.formField}>
        <label htmlFor="link-url">{t('createLink.url', 'URL')}</label>
        <input id="link-url" className={styles.textInput} size={40} {...register('url')} />
      </div>

      <div className={styles.formField}>
        <label htmlFor="link-title">{t('createLink.title', 'Title')}</label>
        <input id="link-title" className={styles.textInput} size={40} {...register('title')} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
        <button
          type="submit"
          title={t('createLink.saveTooltip', 'Set URL')}
          aria-label={t('createLink.saveTooltip', 'Set URL')}
          className={classNames(styles.primaryButton)}
        >
          {t('dialogControls.save', 'Save')}
        </button>
        <button
          type="reset"
          title={t('createLink.cancelTooltip', 'Cancel change')}
          aria-label={t('createLink.cancelTooltip', 'Cancel change')}
          className={classNames(styles.secondaryButton)}
        >
          {t('dialogControls.cancel', 'Cancel')}
        </button>
      </div>
    </form>
  )
}

export default function LinkDialog() {
  const [editorRootElementRef, iconComponentFor, linkDialogState] =
    useCellValues(
      editorRootElementRef$,
      iconComponentFor$,
      linkDialogState$
    )
  const updateLink = usePublisher(updateLink$)
  const cancelLinkEdit = usePublisher(cancelLinkEdit$)
  const switchFromPreviewToLinkEdit = usePublisher(switchFromPreviewToLinkEdit$)
  const removeLink = usePublisher(removeLink$)

  const [copyUrlTooltipOpen, setCopyUrlTooltipOpen] = React.useState(false)

  const t = useTranslation()

  const urlIsExternal = linkDialogState.type === 'preview' && linkDialogState.url.startsWith('http')

  return (
    <Popover.Root open={linkDialogState.type !== 'inactive'}>
      <Popover.Anchor
        data-visible={linkDialogState.type === 'edit'}
        className={styles.linkDialogAnchor}
      />

      <Popover.Portal container={editorRootElementRef?.current}>
        <Popover.Content
          className={classNames(styles.linkDialogPopoverContent, "cancelDrag")}
          sideOffset={5}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
          }}
          key={linkDialogState.linkNodeKey}
        >
          {linkDialogState.type === 'edit' && (
            <LinkEditForm
              url={linkDialogState.url}
              title={linkDialogState.title}
              onSubmit={updateLink}
              onCancel={cancelLinkEdit.bind(null)}
            />
          )}

          {linkDialogState.type === 'preview' && (
            <>
              <a
                className={styles.linkDialogPreviewAnchor}
                href={linkDialogState.url}
                {...(urlIsExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
                title={
                  urlIsExternal ? t('linkPreview.open', `Open {{url}} in new window`, { url: linkDialogState.url }) : linkDialogState.url
                }
              >
                <span>{linkDialogState.url}</span>
                {urlIsExternal && iconComponentFor('open_in_new')}
              </a>

              <ActionButton
                onClick={() => {
                  switchFromPreviewToLinkEdit()
                }}
                title={t('linkPreview.edit', 'Edit link URL')}
                aria-label={t('linkPreview.edit', 'Edit link URL')}
              >
                {iconComponentFor('edit')}
              </ActionButton>
              <Tooltip.Provider>
                <Tooltip.Root open={copyUrlTooltipOpen}>
                  <Tooltip.Trigger asChild>
                    <ActionButton
                      title={t('linkPreview.copyToClipboard', 'Copy to clipboard')}
                      aria-label={t('linkPreview.copyToClipboard', 'Copy to clipboard')}
                      onClick={() => {
                        void window.navigator.clipboard.writeText(linkDialogState.url).then(() => {
                          setCopyUrlTooltipOpen(true)
                          setTimeout(() => {
                            setCopyUrlTooltipOpen(false)
                          }, 1000)
                        })
                      }}
                    >
                      {copyUrlTooltipOpen ? iconComponentFor('check') : iconComponentFor('content_copy')}
                    </ActionButton>
                  </Tooltip.Trigger>
                  <Tooltip.Portal container={editorRootElementRef?.current}>
                    <Tooltip.Content className={classNames(styles.tooltipContent)} sideOffset={5}>
                      {t('linkPreview.copied', 'Copied!')}
                      <Tooltip.Arrow />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>

              <ActionButton
                title={t('linkPreview.remove', 'Remove link')}
                aria-label={t('linkPreview.remove', 'Remove link')}
                onClick={() => {
                  removeLink()
                }}
              >
                {iconComponentFor('link_off')}
              </ActionButton>
            </>
          )}
          <Popover.Arrow className={styles.popoverArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

const ActionButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ className, ...props }, ref) => {
  return <button className={classNames(styles.actionButton, className)} ref={ref} {...props} />
})

