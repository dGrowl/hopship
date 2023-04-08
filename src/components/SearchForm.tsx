import { Dispatch, FormEvent } from 'react'

import { MAX_PLATFORM_NAME_LENGTH } from '../lib/safety'
import Field from './Field'
import PlatformSelector from './PlatformSelector'

type Fields = EventTarget & {
  platform: HTMLSelectElement
  id: HTMLInputElement
}

const storeQuery = (e: FormEvent) => {
  const form = e.target as Fields
  const platform = form.platform.value
  const name = form.id.value
  if (platform) {
    localStorage.setItem('platform', platform)
  }
  if (name) {
    localStorage.setItem('name', name)
  }
}

interface Props {
  platform: string | null
  name: string | null
  setPlatform?: Dispatch<string>
}

const SearchForm = ({ platform, name, setPlatform }: Props) => {
  return (
    <section>
      <form action="/results" onSubmit={storeQuery}>
        <fieldset>
          <Field name="platform">
            <PlatformSelector initial={platform} setter={setPlatform} />
          </Field>
          <Field name="platform_name" label="id">
            <input
              id="platform_name"
              name="id"
              defaultValue={name || ''}
              pattern="\w+"
              minLength={1}
              maxLength={MAX_PLATFORM_NAME_LENGTH}
              title="Platform IDs can only contain letters, numbers, and underscores."
              required
            />
          </Field>
          <button>search</button>
        </fieldset>
      </form>
    </section>
  )
}

export default SearchForm
