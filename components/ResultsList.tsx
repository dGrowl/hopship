import { Result } from '../lib/types'

interface ResultsListProps {
  results: Result[]
}

const buildRows = (results: Result[]) => {
  return results.map((r) => (
    <tr key={r.platform + r.id}>
      <td>{r.platform}</td>
      <td>{r.id}</td>
      <td>{r.desc}</td>
    </tr>
  ))
}

export default function ResultsList(props: ResultsListProps) {
  return (
    <table>
      <thead>
        <tr>
          <td>Platform</td>
          <td>ID</td>
          <td>Description</td>
        </tr>
      </thead>
      <tbody>{buildRows(props.results)}</tbody>
    </table>
  )
}
