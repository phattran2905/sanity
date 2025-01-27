import {type SanityClient, type SanityDocument} from '@sanity/client'
import {mergeMap, range} from 'rxjs'

import {type DocGenTemplate} from './types'

export type ProgramArgs = {
  client: SanityClient
  number?: number
  published?: boolean
  size?: number
  draft?: boolean
  bundle?: string
  template: DocGenTemplate
  concurrency?: number
}

export function run(_args: ProgramArgs) {
  const {client, bundle, draft, concurrency, published, template, number, size} = _args
  const runId = Date.now()

  return range(0, number || 1).pipe(
    mergeMap((i) => {
      const id = `${runId}-autogenerated-${i}`

      const templateOptions = {
        size: size ?? 256,
      }

      const title = `Generated #${runId.toString(32).slice(2)}/${i}`

      const publishedDocument = published
        ? {...template({...templateOptions, title: `${title} - Published`}), _id: id}
        : undefined

      const draftDocument = draft
        ? {
            ...template({...templateOptions, title: `${title} - Published`}),
            _id: `drafts.${id}`,
            title: `${title} - Draft`,
          }
        : undefined

      const bundleDocument = bundle
        ? {
            ...template({...templateOptions, title: `${title} - Published`}),
            _id: `versions.${bundle}.${id}`,
            title: `${title} - Bundle: ${bundle}`,
          }
        : undefined

      return [publishedDocument, draftDocument, bundleDocument].flatMap((d) => (d ? [d] : []))
    }),
    mergeMap((doc) => {
      console.log('Creating', doc._id)
      return client.observable.create(doc as SanityDocument, {autoGenerateArrayKeys: true})
    }, concurrency ?? 2),
  )
}
