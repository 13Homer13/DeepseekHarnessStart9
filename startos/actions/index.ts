import { sdk } from '../sdk'
import { connectModelServers } from './connectModelServers'
import { setPassword } from './setPassword'

export const actions = sdk.Actions.of()
  .addAction(setPassword)
  .addAction(connectModelServers)
