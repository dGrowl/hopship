import {
  BsBookHalf,
  BsEmojiFrownFill,
  BsPersonHeart,
  BsPersonVcard,
} from 'react-icons/bs'
import { redirect } from 'next/navigation'

import { Identity } from '../../../lib/types'
import { USER_NAME_MAX_LENGTH } from '../../../lib/safety'
import db, { fetchBio } from '../../../lib/db'
import IdentityBox from '../../../components/IdentityBox'

import styles from '../../../styles/UserPage.module.css'

export const generateMetadata = ({ params }: Props) => ({
  title: 'hopship: ' + params.name,
})

const fetchVerifiedIdentities = async (userName: string) => {
  try {
    const result = await db.query(
      `
        SELECT
          i.platform,
          i.network,
          i.name,
          i.description AS desc,
          i.status
        FROM public.identities i
          INNER JOIN public.users u
            ON u.id = i.user_id
        WHERE u.name = $1
          AND i.status = 'VERIFIED'
        ORDER BY platform ASC, name ASC;
      `,
      [userName]
    )
    return result.rows
  } catch (error) {
    console.error(error)
  }
  return null
}

const load = async (userName: string) => {
  if (userName.length > USER_NAME_MAX_LENGTH) {
    return null
  }
  const [bio, identities] = await Promise.all([
    fetchBio(userName),
    fetchVerifiedIdentities(userName),
  ])
  return bio && identities ? { bio, identities } : null
}

const buildRows = (identities: Identity[]) =>
  identities.map((i) => <IdentityBox key={i.network + i.name} {...i} />)

const NoIdentities = ({ userName }: { userName: string }) => {
  return (
    <div id={styles.noIdentities}>
      <p>
        {userName} hasn&apos;t verified any identities yet. <BsEmojiFrownFill />
      </p>
      <p>If you know them, tell them that they should!</p>
    </div>
  )
}

interface Props {
  params: {
    name: string
  }
}

const Page = async ({ params }: Props) => {
  const { name: userName } = params
  const data = await load(userName)
  if (!data) {
    return redirect('/')
  }
  const { bio, identities } = data
  return (
    <>
      <header id={styles.nameContainer}>
        <h2 id={styles.name}>
          <BsPersonHeart />
          {userName}
        </h2>
      </header>
      <dl id={styles.container}>
        {bio ? (
          <>
            <dt className={styles.label}>
              <BsBookHalf size="24px" />
              biography
            </dt>
            <dd id={styles.bio}>{bio}</dd>
          </>
        ) : null}
        <dt className={`${styles.label} ${styles.wide}`}>
          <BsPersonVcard size="24px" />
          identities
        </dt>
        <dd className={styles.wide}>
          {identities.length > 0 ? (
            <section>
              <div id={styles.identities}>{buildRows(identities)}</div>
            </section>
          ) : (
            <NoIdentities userName={userName} />
          )}
        </dd>
      </dl>
    </>
  )
}

export default Page
