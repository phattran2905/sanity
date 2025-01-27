import {type UploadState} from '@sanity/types'
import {Box, type CardTone} from '@sanity/ui'
import {type FocusEvent, forwardRef, memo, useMemo} from 'react'

import {ChangeIndicator} from '../../../../changeIndicators'
import {type InputProps} from '../../../types'
import {FileTarget} from '../common/styles'
import {UploadWarning} from '../common/UploadWarning'
import {type BaseImageInputProps, type BaseImageInputValue, type FileInfo} from './types'

const ASSET_FIELD_PATH = ['asset'] as const

function ImageInputAssetComponent(
  props: {
    elementProps: BaseImageInputProps['elementProps']
    handleClearUploadState: () => void
    handleFilesOut: () => void
    handleFilesOver: (hoveringFiles: FileInfo[]) => void
    handleFileTargetFocus: (event: FocusEvent<Element, Element>) => void
    handleSelectFiles: (files: File[]) => void
    hoveringFiles: FileInfo[]
    inputProps: Omit<InputProps, 'renderDefault'>
    isStale: boolean
    readOnly: boolean | undefined
    renderAssetMenu(): JSX.Element | null
    renderPreview: () => JSX.Element
    renderUploadPlaceholder(): JSX.Element
    renderUploadState(uploadState: UploadState): JSX.Element
    tone: CardTone
    value: BaseImageInputValue | undefined
  },
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    elementProps,
    handleClearUploadState,
    handleFilesOut,
    handleFilesOver,
    handleFileTargetFocus,
    handleSelectFiles,
    hoveringFiles,
    inputProps,
    isStale,
    readOnly,
    renderAssetMenu,
    renderPreview,
    renderUploadPlaceholder,
    renderUploadState,
    tone,
    value,
  } = props

  const hasValueOrUpload = Boolean(value?._upload || value?.asset)
  const path = useMemo(() => inputProps.path.concat(ASSET_FIELD_PATH), [inputProps.path])

  return (
    <>
      {isStale && (
        <Box marginBottom={2}>
          <UploadWarning onClearStale={handleClearUploadState} />
        </Box>
      )}
      <ChangeIndicator path={path} hasFocus={!!inputProps.focused} isChanged={inputProps.changed}>
        {value?._upload ? (
          renderUploadState(value._upload)
        ) : (
          <FileTarget
            {...elementProps}
            onFocus={handleFileTargetFocus}
            tabIndex={0}
            disabled={Boolean(readOnly)}
            onFiles={handleSelectFiles}
            onFilesOver={handleFilesOver}
            onFilesOut={handleFilesOut}
            tone={tone}
            $border={hasValueOrUpload || hoveringFiles.length > 0}
            sizing="border"
            radius={2}
          >
            {!value?.asset && renderUploadPlaceholder()}
            {!value?._upload && value?.asset && (
              <div style={{position: 'relative'}} ref={forwardedRef}>
                {renderPreview()}
                {renderAssetMenu()}
              </div>
            )}
          </FileTarget>
        )}
      </ChangeIndicator>
    </>
  )
}
export const ImageInputAsset = memo(forwardRef(ImageInputAssetComponent))
