import { platforms } from '../lib/util'

interface PlatformSelectorProps {
  initial: string | null
}

const PlatformSelector = ({ initial }: PlatformSelectorProps) => (
  <select
    name="platform"
    key={initial ? 'default' : 'stored'}
    defaultValue={initial || platforms[0]}
  >
    {platforms.map((p) => (
      <option key={p}>{p}</option>
    ))}
  </select>
)

export default PlatformSelector
