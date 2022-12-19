import { Identity } from '../lib/types'

interface IdentitiesListProps {
  editable?: boolean
  identities: Identity[]
}

const buildRows = (identities: Identity[], editable: boolean) => {
  return identities.map(({ platform, id, desc }) => (
    <tr key={platform + id}>
      <td>{platform}</td>
      <td>{id}</td>

      <td>{editable ? <textarea defaultValue={desc} /> : <>{desc}</>}</td>
      {editable ? (
        <td>
          <button>X</button>
        </td>
      ) : null}
    </tr>
  ))
}

export default function IdentitiesList(props: IdentitiesListProps) {
  const { identities } = props
  const editable = props.editable || false
  return (
    <>
      <table>
        <thead>
          <tr>
            <td>Platform</td>
            <td>ID</td>
            <td>Description</td>
            {editable ? <td>Delete?</td> : null}
          </tr>
        </thead>
        <tbody>{buildRows(identities, editable)}</tbody>
      </table>
      {editable ? (
        <>
          <button>Add</button>
          <button>Save Descriptions</button>
        </>
      ) : null}
    </>
  )
}
