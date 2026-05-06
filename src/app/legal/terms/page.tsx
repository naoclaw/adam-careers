import { LegalLayout, H2, P, UL } from "@/components/legal-layout";

export const metadata = {
  title: "Terms of Service",
  description: "Adam Careers terms of service.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="2026-05-06">
      <P>
        These terms govern your use of Adam Careers. By creating an account or
        using the service, you agree to them. If you don&rsquo;t agree, please
        don&rsquo;t use the service.
      </P>

      <H2>1. The service</H2>
      <P>
        Adam Careers provides AI-assisted CV and cover-letter generation,
        plus a job-posting analyser. The service is provided as-is, and the
        features available depend on your plan.
      </P>

      <H2>2. Your account</H2>
      <UL>
        <li>You must be 16 or older to create an account.</li>
        <li>
          You&rsquo;re responsible for keeping your credentials secure and for
          all activity under your account.
        </li>
        <li>
          One person, one account — please don&rsquo;t share login credentials.
        </li>
      </UL>

      <H2>3. Your content</H2>
      <P>
        You retain ownership of everything you upload (profile, documents,
        generated CVs). You grant us a limited licence to process your content
        solely to provide the service. You confirm that the information you
        put in your profile is accurate and yours to use.
      </P>

      <H2>4. Acceptable use</H2>
      <UL>
        <li>Don&rsquo;t use the service for unlawful purposes.</li>
        <li>Don&rsquo;t impersonate another person or fabricate a professional history.</li>
        <li>Don&rsquo;t scrape, reverse-engineer, or attempt to break the service.</li>
        <li>
          Don&rsquo;t upload malicious files, spam, or content that infringes
          someone else&rsquo;s rights.
        </li>
      </UL>

      <H2>5. Plans, billing &amp; refunds</H2>
      <P>
        Subscriptions renew automatically until canceled. You can cancel any
        time from your dashboard; access continues until the end of the
        current billing period. Refunds are handled case-by-case at our
        discretion within 14 days of purchase.
      </P>

      <H2>6. AI output</H2>
      <P>
        AI output may contain inaccuracies. We do not guarantee employment
        outcomes, interview invitations, or any specific result. Always
        review and edit generated content before sending it to anyone.
      </P>

      <H2>7. Termination</H2>
      <P>
        We may suspend or terminate accounts that abuse the service or
        violate these terms. You can delete your account at any time from the
        dashboard.
      </P>

      <H2>8. Liability</H2>
      <P>
        To the extent permitted by law, our total liability for any claim
        related to the service is limited to the amount you paid us in the 12
        months preceding the claim.
      </P>

      <H2>9. Changes</H2>
      <P>
        We may update these terms when we add features or change how the
        service works. We&rsquo;ll notify you by email for material changes.
        Continued use after changes means you accept the new terms.
      </P>

      <H2>10. Contact</H2>
      <P>
        Questions about these terms? Email{" "}
        <a
          href="mailto:hello@adamcareers.com"
          className="font-medium text-blue-600 hover:underline"
        >
          hello@adamcareers.com
        </a>
        .
      </P>
    </LegalLayout>
  );
}
