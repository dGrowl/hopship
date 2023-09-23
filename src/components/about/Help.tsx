import {
  BsGearFill,
  BsPersonAdd,
  BsPersonCircle,
  BsSearch,
} from 'react-icons/bs'
import Link from 'next/link'

import styles from '../../styles/About.module.css'

const Help = (
  <article id={styles.content}>
    <section>
      <p>
        <b>hopship</b> is built primarily to serve two types of users:
      </p>
      <ul>
        <li>
          <b>Searchers</b> who wish to follow their friends on other platforms.
        </li>
        <li>
          <b>Providers</b> who wish to add their accounts to our system.
        </li>
      </ul>
    </section>
    <section>
      <h3>Searcher</h3>
      <p>
        You&apos;ll need to know one of the accounts of the person you&apos;re
        hoping to look up. Using the fields at the top, moving from left to
        right:
      </p>
      <ol>
        <li>Select the platform of the account from the dropdown.</li>
        <li>Type their ID/name on that platform into the text field.</li>
        <li>
          Click the <BsSearch /> magnifying glass to run the search.
        </li>
      </ol>
    </section>
    <section>
      <h3>Provider</h3>
      <p>
        To make changes to your account, update your user page, or modify your
        identities, first navigate to the&nbsp;
        <Link href="/settings/identities" className="underline">
          settings
        </Link>
        &nbsp; page:
      </p>
      <ol>
        <li>
          If you aren&apos;t logged in, create or sign into an account by
          clicking the <BsPersonAdd /> unknown user icon and following the steps
          on the&nbsp;
          <Link href="/login" className="underline">
            login
          </Link>
          &nbsp; page.
        </li>
        <li>
          Open the user menu by clicking the <BsPersonCircle /> logged in user
          icon.
        </li>
        <li>
          Click the <BsGearFill /> settings link.
        </li>
      </ol>
      <p>
        <strong>Note:</strong> After adding a new identity to your account, you
        must prove that it belongs to you before it will show up in search
        results. To verify an identity&apos;s authenticity:
      </p>
      <ol>
        <li>
          Navigate to the&nbsp;
          <Link href="/settings/identities" className="underline">
            settings
          </Link>
          &nbsp; page; see above.
        </li>
        <li>
          Click the <BsGearFill /> button on the identity to go to the
          identity&apos;s settings.
        </li>
        <li>Follow the steps in the &quot;Verify&quot; section.</li>
      </ol>
    </section>
  </article>
)

export default Help
