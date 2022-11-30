import { Result } from '../lib/types'

interface ResultsListProps {
  results: Result[]
}

const buildRows = (results: Result[]) => {
  return results.map(r => (
    <tr key={r.platform + r.id}>
      <td>{r.platform}</td>
      <td>{r.id}</td>
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
        </tr>
      </thead>
      <tbody>
        {buildRows(props.results)}
      </tbody>
    </table>
  )
}
