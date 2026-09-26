import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p>Resume Architect ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Personal information (e.g., name, email address, phone number)</li>
          <li>Resume content and related information</li>
          <li>Account credentials</li>
          <li>Payment information</li>
          <li>Communications with us</li>
        </ul>
        <p className="mt-4">We also automatically collect certain information about your device and how you interact with our services, including:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Device information</li>
          <li>Usage data</li>
          <li>Cookies and similar technologies</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices, updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and customer service requests</li>
          <li>Communicate with you about products, services, offers, and events</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
          <li>Personalize and improve the services and provide content or features that match user profiles or interests</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Sharing of Information</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul className="list-disc list-inside ml-4">
          <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
          <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law or legal process</li>
          <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of Resume Architect or others</li>
          <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company</li>
          <li>With your consent or at your direction</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
        <p>We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it. We may retain certain information for legitimate business purposes or as required by law.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
        <p>You have certain rights and choices regarding your information, including:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Accessing, correcting, or deleting your information</li>
          <li>Opting out of marketing communications</li>
          <li>Choosing whether to provide certain information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Changes to this Privacy Policy</h2>
        <p>We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at: privacy@resumearchitect.com</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;