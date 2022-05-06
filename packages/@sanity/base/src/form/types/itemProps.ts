import {
  BooleanSchemaType,
  NumberSchemaType,
  ObjectSchemaType,
  Path,
  SchemaType,
  StringSchemaType,
  ValidationMarker,
} from '@sanity/types'
import React from 'react'

export interface BaseItemProps {
  schemaType: SchemaType
  key: string
  index: number
  level: number
  value: unknown
  path: Path
  title: string | undefined
  description: string | undefined
  inputId: string
  onFocus: (event: React.FocusEvent) => void
  readOnly?: boolean
  focused?: boolean
  onRemove: () => void

  // --- todo, potentially
  // onMoveTo: (event: {ref: number|string, position: 'before'|'after'}) => void
  // onDuplicate: () => void
  // ---
  onInsert: (event: {items: unknown[]; position: 'before' | 'after'}) => void

  children: React.ReactNode | null

  validation: ValidationMarker[]
}

export interface ObjectItemProps extends BaseItemProps {
  schemaType: ObjectSchemaType
  collapsed: boolean | undefined
  collapsible: boolean
  onSetCollapsed: (collapsed: boolean) => void
}

export type ItemProps = ObjectItemProps | PrimitiveItemProps

export interface PrimitiveItemProps extends BaseItemProps {
  schemaType: NumberSchemaType | BooleanSchemaType | StringSchemaType
}
