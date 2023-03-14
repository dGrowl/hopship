import { Dispatch } from 'react'

import { doNothing, platforms } from '../lib/util'

interface Props {
  initial: string | null
  setter?: Dispatch<string>
}

const PlatformSelector = ({ initial, setter }: Props) => {
  return (
    <select
      id="platform"
      name="platform"
      key={initial ? 'default' : 'stored'}
      defaultValue={initial === null ? platforms[0] : initial}
      onChange={setter ? (e) => setter(e.target.value) : doNothing}
      required
    >
      <option />
      {platforms.map((p) => (
        <option key={p}>{p}</option>
      ))}
    </select>
  )
}

export default PlatformSelector
