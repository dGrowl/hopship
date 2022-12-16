import { Identity } from '../lib/types'

interface IdentitiesListProps {
  identities: Identity[]
}

const buildRows = (identities: Identity[]) => {
  return identities.map((r) => (
    <tr key={r.platform + r.id}>
      <td>{r.platform}</td>
      <td>{r.id}</td>
      <td>{r.desc}</td>
    </tr>
  ))
}

export default function IdentitiesList(props: IdentitiesListProps) {
  return (
    <table>
      <thead>
        <tr>
          <td>Platform</td>
          <td>ID</td>
          <td>Description</td>
        </tr>
      </thead>
      <tbody>{buildRows(props.identities)}</tbody>
    </table>
  )
}
