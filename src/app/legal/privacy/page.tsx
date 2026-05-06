import { LegalLayout, H2, P, UL } from "@/components/legal-layout";

export const metadata = {
  title: "Privacy Policy",
  description: "How Adam Careers collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="2026-05-06">
      <P>
        Adam Careers (&ldquo;we&rdquo;, &ldquo;us&rdquo;) helps you build and
        tailor CVs and cover letters with AI. This page explains what data we
        collect, how we use it, and your rights under GDPR and similar laws.
      </P>

      <H2>1. Data we collect</H2>
      <UL>
        <li>
          <strong>Account data:</strong> name, email address, and any
          information you choose to add to your profile (experience,
          education, skills, links).
        </li>
        <li>
          <strong>Documents you upload</strong> (CVs, cover letters, supporting
          files) and the job postings you ask us to analyse.
        </li>
        <li>
          <strong>Usage data:</strong> pages visited, features used, and
          generation history. We use this to operate and improve the product.
        </li>
        <li>
          <strong>Billing data:</strong> if you subscribe, Stripe processes
          your payment. We never see or store full card numbers.
        </li>
      </UL>

      <H2>2. How we use your data</H2>
      <UL>
        <li>To provide the service: building tailored CVs and cover letters.</li>
        <li>
          To send service emails (welcome, billing receipts, security alerts).
          We do not send marketing without explicit opt-in.
        </li>
        <li>To detect abuse and prevent fraud.</li>
        <li>To improve the product based on aggregated, anonymous usage.</li>
      </UL>

      <H2>3. AI processing</H2>
      <P>
        Your profile, the job postings you submit, and the content of your CVs
        are sent to our AI providers (OpenRouter and the underlying model
        providers, e.g. xAI and Anthropic) solely to generate the requested
        output. We do not use your content to train models, and our providers
        are contractually bound to the same.
      </P>

      <H2>4. Data sharing</H2>
      <P>
        We share data only with the providers we need to deliver the service:
        Supabase (database and auth), Stripe (billing), Resend (email), and
        our AI providers. We never sell your personal data.
      </P>

      <H2>5. Data retention</H2>
      <P>
        We keep your account and documents until you delete them. After
        account deletion, backups may persist for up to 30 days before being
        permanently removed.
      </P>

      <H2>6. Your rights</H2>
      <P>
        You can export or delete your data from your dashboard at any time. To
        exercise any other privacy right (access, rectification, restriction,
        portability, objection), email{" "}
        <a
          href="mailto:privacy@adamcareers.com"
          className="font-medium text-blue-600 hover:underline"
        >
          privacy@adamcareers.com
        </a>
        .
      </P>

      <H2>7. Cookies</H2>
      <P>
        We use only the cookies needed to keep you signed in and to remember
        your preferences. We do not use advertising or tracking cookies.
      </P>

      <H2>8. Contact</H2>
      <P>
        For privacy questions, email{" "}
        <a
          href="mailto:privacy@adamcareers.com"
          className="font-medium text-blue-600 hover:underline"
        >
          privacy@adamcareers.com
        </a>
        .
      </P>
    </LegalLayout>
  );
}
