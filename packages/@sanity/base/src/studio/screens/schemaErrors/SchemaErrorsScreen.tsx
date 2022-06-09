import {Schema, SchemaValidationProblemPath} from '@sanity/types'
import {Card, Container} from '@sanity/ui'
import React, {useEffect} from 'react'
import {isProd} from '../../../environment'
import {SchemaErrors} from './SchemaErrors'

interface SchemaErrorsScreenProps {
  schema: Schema
}

export function SchemaErrorsScreen({schema}: SchemaErrorsScreenProps) {
  const groupsWithErrors =
    schema._validation?.filter((group) =>
      group.problems.some((problem) => problem.severity === 'error')
    ) || []

  useEffect(() => _reportWarnings(schema), [schema])

  return (
    <Card height="fill" overflow="auto" paddingY={[4, 5, 6, 7]} paddingX={4} sizing="border">
      <Container width={1}>
        <SchemaErrors problemGroups={groupsWithErrors} />
      </Container>
    </Card>
  )
}

function _reportWarnings(schema: Schema) {
  if (isProd) {
    return
  }

  /* eslint-disable no-console */
  const problemGroups = schema._validation

  const groupsWithWarnings = problemGroups?.filter((group) =>
    group.problems.some((problem) => problem.severity === 'warning')
  )
  if (groupsWithWarnings?.length === 0) {
    return
  }
  console.groupCollapsed(`⚠️ Schema has ${groupsWithWarnings?.length} warnings`)
  groupsWithWarnings?.forEach((group) => {
    const path = _renderPath(group.path)

    console.group(`%cAt ${path}`, 'color: #FF7636')

    group.problems.forEach((problem) => {
      console.log(problem.message)
    })

    console.groupEnd()
  })
  console.groupEnd()
  /* eslint-enable no-console */
}

function _renderPath(path: SchemaValidationProblemPath) {
  return path
    .map((segment) => {
      if (segment.kind === 'type') {
        return `${segment.name || '<unnamed>'}(${segment.type})`
      }

      if (segment.kind === 'property') {
        return segment.name
      }

      return null
    })
    .filter(Boolean)
    .join(' > ')
}
