import { MAX_PLATFORM_NAME_LENGTH } from '../lib/safety'
import Field from './Field'
import PlatformSelector from './PlatformSelector'

interface Props {
  platform: string | null
  name: string | null
}

const SearchForm = ({ platform, name }: Props) => {
  return (
    <section>
      <form action="/results">
        <fieldset>
          <Field name="platform">
            <PlatformSelector initial={platform} />
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
