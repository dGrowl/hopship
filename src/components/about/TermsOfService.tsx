import Link from 'next/link'

const TermsOfService = (
  <article>
    <section>
      <h1>Terms of Service</h1>
      <b>Last updated: September 22, 2023</b>
      <p>
        Welcome to <b>hopship</b>, an online platform created and maintained
        by&nbsp;
        <a href="https://github.com/dGrowl" className="underline">
          Derek
        </a>
        . These Terms of Service (&quot;Terms&quot;) govern your access to and
        use of this website. Please carefully read and understand the following
        terms before using our services. By accessing or using hopship, you
        agree to comply with these Terms.
      </p>
      <p>
        Throughout these Terms, &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot; refers to Derek, the operator of hopship. If you have
        any questions or concerns about these Terms, feel free to&nbsp;
        <a href="#contact" className="underline">
          contact us
        </a>
        .
      </p>
      <h2>User Eligibility</h2>
      <p>
        To use hopship, you must be at least 18 years old or have the legal
        capacity to enter into these Terms. By using this website, you represent
        and warrant that you meet these eligibility requirements.
      </p>
      <h2>Account Management</h2>
      <h3>Account Information</h3>
      <p>
        When creating an account, you agree to provide accurate and complete
        information. It is your responsibility to maintain the confidentiality
        of your account credentials, including your password.
      </p>
      <h3>Account Usage</h3>
      <p>
        You are solely responsible for all activities that occur under your
        account. If you suspect any unauthorized access to your account,
        please&nbsp;
        <a href="#contact" className="underline">
          contact us
        </a>
        .
      </p>
      <h3>Revocation of Access</h3>
      <p>
        Derek reserves the right to, at our sole discretion and without prior
        notice, delete user accounts or revoke user access to the platform for
        any reason, including but not limited to violation of these Terms of
        Service, inappropriate conduct, or breach of applicable laws. Upon
        account deletion or access revocation, users will no longer have access
        to their account and associated features on the platform. Any content,
        data, or information associated with the account may be permanently
        deleted.
      </p>
      <h2>User Responsibilities</h2>
      <h3>Compliance with Laws</h3>
      <p>
        You agree to comply with all applicable laws, regulations, and
        third-party agreements while using hopship.
      </p>
      <h3>Prohibited Activities</h3>
      <p>
        You must not engage in any activities that may violate these Terms or
        harm the website or its users. Prohibited activities include, but are
        not limited to, spamming, hacking, transmitting viruses, or engaging in
        any form of illegal or malicious activity.
      </p>
      <h3>Accuracy of Information</h3>
      <p>
        You are responsible for the accuracy and truthfulness of the information
        you provide on hopship.
      </p>
      <h2>Intellectual Property Rights</h2>
      <h3>Ownership</h3>
      <p>
        All content and materials available on hopship, unless otherwise stated,
        are the property of Derek and are protected by copyright, trademark, and
        other intellectual property laws.
      </p>
      <h3>License</h3>
      <p>
        By using hopship, you are granted a limited, non-exclusive,
        non-transferable license to access and use the website and its content
        for personal, non-commercial use only.
      </p>
      <h2>Content Usage</h2>
      <h3>User-Generated Content</h3>
      <p>
        You may submit content to hopship, such as comments or contributions. By
        doing so, you grant Derek a worldwide, royalty-free, perpetual,
        irrevocable, non-exclusive license to use, modify, delete, distribute,
        and display the content.
      </p>
      <h3>Third-Party Content</h3>
      <p>
        hopship may contain links to third-party websites. We do not endorse or
        control the content of these websites and are not responsible for any
        third-party content.
      </p>
      <h2>Informal Dispute Resolution</h2>
      <h3>Negotiation and Communication</h3>
      <p>
        If a dispute arises between you and Derek concerning these Terms or the
        use of hopship, we encourage you to contact us to attempt to resolve the
        dispute informally. We will make best efforts to resolve the dispute
        through good-faith negotiation and communication.
      </p>
      <p>
        If informal negotiations do not resolve the dispute to your
        satisfaction, either party shall elect to pursue mediation or any other
        non-binding alternative dispute resolution mechanism before initiating
        formal legal proceedings.
      </p>
      <h2>Disclaimer</h2>
      <p>
        hopship is provided &quot;as is&quot; and &quot;as available,&quot;
        without any warranties of any kind, express or implied. Derek does not
        warrant that the website will be error-free, uninterrupted, secure, or
        meet your requirements. Your use of hopship is at your own risk. Derek
        shall not be liable for any damages arising out of or in connection with
        your use of the website.
      </p>
      <h2>Indemnification</h2>
      <h3>Indemnity</h3>
      <p>
        You agree to indemnify and hold Derek harmless from any claims, demands,
        losses, liabilities, and expenses (including attorneys&apos; fees)
        arising out of or in connection with your use of hopship, violation of
        these Terms, or violation of any rights of another person or entity.
      </p>
      <h3>Defense of Claims</h3>
      <p>
        In the event of a claim or dispute, the user making the claim (the
        &quot;Claimant&quot;) shall be responsible for defending the claim and
        any associated legal proceedings. The Claimant agrees to cooperate with
        Derek by providing any necessary information and documentation related
        to the claim. The Claimant shall promptly notify Derek of any claim,
        lawsuit, or legal action that may affect Derek or hopship.
      </p>
      <h2>Updates to Terms & Conditions</h2>
      <p>
        Derek reserves the right to update, modify, or make changes to these
        Terms of Service at any time without prior notice. The date of the last
        update will be reflected by the &quot;Last updated&quot; date at the
        beginning of these Terms. It is your responsibility to review these
        Terms periodically for any changes. Continued use of hopship after any
        modifications constitutes acceptance of the updated Terms.
      </p>
      <h2 id="contact">Contact Us</h2>
      <p>
        If you need to contact us, please use our&nbsp;
        <Link href="/about/contact" className="underline">
          contact form
        </Link>
        .
      </p>
    </section>
  </article>
)

export default TermsOfService
