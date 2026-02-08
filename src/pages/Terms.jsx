import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';

export default function Terms() {
  return (
    <Page>
      <PageHeader
        title="Terms of Service"
        subtitle="Last updated: February 2025"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="prose prose-sm max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using WeManageAll, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use WeManageAll for personal, non-commercial transitory viewing only.
          </p>
          
          <h2>3. User Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
          
          <h2>4. Privacy</h2>
          <p>
            Your use of WeManageAll is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
          </p>
          
          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall WeManageAll or its suppliers be liable for any damages arising out of the use or inability to use the materials on WeManageAll.
          </p>
        </div>
      </div>
    </Page>
  );
}
