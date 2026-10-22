import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_0_2_0_rc_2_0 } from './v0.2.0-rc.2_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_0_2_0_rc_2_0],
})
