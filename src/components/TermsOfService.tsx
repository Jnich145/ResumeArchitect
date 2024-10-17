import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using Resume Architect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our service.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
        <p>Resume Architect provides an online platform for creating and managing resumes. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. User Content</h2>
        <p>You retain all rights to the content you submit to Resume Architect. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with the service.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
        <p>You agree not to engage in any of the following activities:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Violating laws or regulations</li>
          <li>Infringing on intellectual property rights</li>
          <li>Transmitting harmful code or malware</li>
          <li>Impersonating others or providing false information</li>
          <li>Interfering with the proper functioning of the service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Payments and Subscriptions</h2>
        <p>Some features of Resume Architect require a paid subscription. By subscribing, you agree to pay the fees associated with your chosen plan. Subscriptions will automatically renew unless cancelled before the renewal date.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
        <p>We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
        <p>Resume Architect is provided "as is" without any warranties, expressed or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
        <p>Resume Architect and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms of Service at any time. We will notify users of any significant changes. Your continued use of Resume Architect after changes constitutes acceptance of the new terms.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us at support@resumearchitect.com.</p>
      </section>
    </div>
  );
};

export default TermsOfService;