import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';

export default function Privacy() {
  return (
    <Page>
      <PageHeader
        title="Privacy Policy"
        subtitle="Last updated: February 2025"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="prose prose-sm max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create an account, use our services, or contact us for support.
          </p>
          
          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
          </p>
          
          <h2>3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h2>4. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time through your account settings.
          </p>
          
          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide you services.
          </p>
        </div>
      </div>
    </Page>
  );
}
