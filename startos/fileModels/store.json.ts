import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const storedModel = z.looseObject({
  id: z.string(),
  contextWindow: z.number().int().positive().optional().catch(undefined),
  image: z.boolean().catch(false),
})
export type StoredModel = z.infer<typeof storedModel>

const shape = z.looseObject({
  uiPassword: z.string().catch(''),
  // Model servers connected by Connect Model Servers, keyed by package id,
  // with the models each served when the action last ran.
  backends: z
    .record(
      z.string(),
      z.looseObject({ models: z.array(storedModel).catch([]) }),
    )
    .catch({}),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
