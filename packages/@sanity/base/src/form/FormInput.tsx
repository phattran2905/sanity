import React, {memo, useCallback, useMemo} from 'react'
import {isEqual, startsWith, trimLeft} from '@sanity/util/paths'
import {isKeySegment, Path} from '@sanity/types'
import {
  ArrayOfObjectsInputProps,
  FieldMember,
  ObjectInputProps,
  RenderArrayOfObjectsItemCallback,
  RenderFieldCallback,
  RenderInputCallback,
} from './types'
import {MemberItem} from './inputs/arrays/ArrayOfObjectsInput/MemberItem'
import {isArrayInputProps, isObjectInputProps} from './utils/asserters'
import {MemberField} from './inputs/ObjectInput/MemberField'

const pass = ({children}: {children: React.ReactNode}) => children

export type FormInputAbsolutePathArg = {absolutePath: Path}
export type FormInputRelativePathArg = {relativePath: Path}

function hasAbsolutePath(
  a: FormInputAbsolutePathArg | FormInputRelativePathArg
): a is FormInputAbsolutePathArg {
  return 'absolutePath' in a
}

export const FormInput = memo(function FormInput(
  props: (ArrayOfObjectsInputProps | ObjectInputProps) &
    (FormInputRelativePathArg | FormInputAbsolutePathArg) & {
      /**
       * Whether to include the field around the input. Defaults to false
       */
      includeField?: boolean
    }
) {
  const absolutePath = useMemo(() => {
    return hasAbsolutePath(props) ? props.absolutePath : props.path.concat(props.relativePath)
  }, [props])

  return (
    <FormInputInner
      {...props}
      absolutePath={absolutePath}
      destinationRenderField={props.renderField}
      destinationRenderInput={props.renderInput}
      destinationRenderItem={props.renderItem}
    />
  )
})

/**
 * An input that takes input props for object or array and renders an input for a given sub-path
 */
const FormInputInner = memo(function FormInputInner(
  props: (ArrayOfObjectsInputProps | ObjectInputProps) & {
    absolutePath: Path
    includeField?: boolean
    destinationRenderInput: RenderInputCallback
    destinationRenderField: RenderFieldCallback
    destinationRenderItem: RenderArrayOfObjectsItemCallback
  }
) {
  const {absolutePath, destinationRenderInput, destinationRenderItem, destinationRenderField} =
    props

  const renderInput: RenderInputCallback = useCallback(
    (inputProps) => {
      const isDestinationReached =
        isEqual(inputProps.path, absolutePath) || startsWith(absolutePath, inputProps.path)
      if (isDestinationReached) {
        // we have reached the destination node and can now render with the passed renderInput
        return destinationRenderInput(inputProps)
      }
      if (!isObjectInputProps(inputProps) && !isArrayInputProps(inputProps)) {
        throw new Error(
          `Expected either object input props or array input props for: ${JSON.stringify(
            inputProps.path
          )}`
        )
      }
      // we have not yet reached the destination path, so we'll continue recurse until we get there
      return (
        <FormInputInner
          {...inputProps}
          absolutePath={absolutePath}
          destinationRenderInput={destinationRenderInput}
          destinationRenderItem={destinationRenderItem}
          destinationRenderField={destinationRenderField}
        />
      )
    },
    [absolutePath, destinationRenderField, destinationRenderInput, destinationRenderItem]
  )

  const renderField: RenderFieldCallback = useCallback(
    (fieldProps) => {
      // we want to render the field around the input if either of these are true:
      // 1. we have reached the destination path and the `includeField`-prop is passed as true
      // 2. we are currently at a node somewhere below/inside the destination path
      const shouldRenderField =
        startsWith(absolutePath, fieldProps.path) &&
        (props.includeField || !isEqual(absolutePath, fieldProps.path))
      return shouldRenderField ? destinationRenderField(fieldProps) : pass(fieldProps)
    },
    [absolutePath, destinationRenderField, props.includeField]
  )

  if (isArrayInputProps(props)) {
    const childPath = trimLeft(props.path, absolutePath)

    const itemMember = props.members.find(
      (member) =>
        member.kind == 'item' && isKeySegment(childPath[0]) && member.key === childPath[0]._key
    )

    if (!itemMember) {
      const relativePath = trimLeft(props.path, absolutePath)
      const key = (relativePath[0] as any)._key
      return (
        <div>
          No array item with _key <code>"{key}"</code> found at path {JSON.stringify(props.path)}
        </div>
      )
    }

    return (
      <MemberItem
        member={itemMember}
        renderInput={renderInput}
        renderField={renderField}
        renderItem={pass}
      />
    )
  }

  if (isObjectInputProps(props)) {
    const childPath = trimLeft(props.path, absolutePath)
    const fieldMember = props.members.find(
      (member): member is FieldMember => member.kind == 'field' && childPath[0] === member.name
    )

    if (!fieldMember) {
      const fieldName = childPath[0]
      return (
        <div>
          Field {JSON.stringify(fieldName)} not found among members – please verify that it's both
          defined in the schema and that it has not been conditionally hidden.
        </div>
      )
    }

    return (
      <MemberField
        member={fieldMember}
        renderInput={renderInput}
        renderField={renderField}
        renderItem={pass}
      />
    )
  }
  throw new Error('FormInput can only be used with arrays or objects')
})