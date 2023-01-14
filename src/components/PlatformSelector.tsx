import { platforms } from '../lib/util'

interface Props {
  initial: string | null
}

const PlatformSelector = ({ initial }: Props) => {
  return (
    <select
      name="platform"
      defaultValue={initial || platforms[0]}
    >
      {platforms.map((p) => (
        <option key={p}>{p}</option>
      ))}
    </select>
  )
}

export default PlatformSelector
