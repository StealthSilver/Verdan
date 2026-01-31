import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Verdan",
  description:
    "Privacy Policy for Verdan - Tree Planting and Environmental Conservation Platform",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Effective Date:</strong> January 31, 2026
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            <strong>Last Updated:</strong> January 31, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Verdan. We are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our mobile application and website
              (collectively, the "Service").
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By using Verdan, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.1 Personal Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you register for an account, we may collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Designation and organization (optional)</li>
              <li>Gender (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.2 Tree and Site Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect information related to tree planting activities:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Tree location (GPS coordinates)</li>
              <li>Tree species and characteristics</li>
              <li>Planting dates and growth records</li>
              <li>Site information and analytics</li>
              <li>Photos and images of trees</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.3 Usage Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We automatically collect certain information about your device and
              usage:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Device type and operating system</li>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>App usage statistics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>To provide and maintain our Service</li>
              <li>To authenticate users and manage accounts</li>
              <li>To track tree planting activities and generate analytics</li>
              <li>To generate QR codes for tree identification</li>
              <li>To send email notifications and updates</li>
              <li>To improve our Service and user experience</li>
              <li>To detect and prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.1 With Your Consent
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may share your information when you give us explicit
              permission.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.2 Public Tree Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Tree data accessed via QR codes is publicly viewable, including
              tree species, location, and photos. Personal information of the
              user who planted the tree is not shared publicly.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.3 Service Providers
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may share information with third-party service providers who
              assist us in operating our Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Cloud hosting services (Vercel, MongoDB Atlas)</li>
              <li>Email service providers (Resend)</li>
              <li>Analytics services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.4 Legal Requirements
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may disclose your information if required by law or in response
              to valid legal requests.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Passwords are encrypted using bcrypt hashing</li>
              <li>Secure HTTPS connections for all data transmission</li>
              <li>Authentication using JWT tokens</li>
              <li>Role-based access control</li>
              <li>Regular security updates and monitoring</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              However, no method of transmission over the Internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Provide our Service to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Tree planting records may be retained indefinitely for
              environmental tracking and historical purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Access:</strong> Request access to your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Data Portability:</strong> Request transfer of your data
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent for data
                processing
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              To exercise these rights, please contact us using the information
              provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our Service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you believe we have collected information from a child
              under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              data protection laws that differ from your jurisdiction. By using
              our Service, you consent to such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Third-Party Links
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our Service may contain links to third-party websites. We are not
              responsible for the privacy practices of these websites. We
              encourage you to read the privacy policies of any third-party
              sites you visit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date. You are advised to
              review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our privacy
              practices, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> privacy@verdan.com
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Website:</strong> https://verdan-beige.vercel.app
              </p>
            </div>
          </section>

          <section className="mb-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Google Play Store Specific Information
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              13.1 Permissions
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Android application may request the following permissions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Camera:</strong> To capture photos of planted trees
              </li>
              <li>
                <strong>Location:</strong> To record GPS coordinates of tree
                planting sites
              </li>
              <li>
                <strong>Storage:</strong> To save and access tree photos
              </li>
              <li>
                <strong>Internet:</strong> To sync data with our servers
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              13.2 Data Safety
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We are committed to data safety:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>All data is encrypted in transit using HTTPS</li>
              <li>Personal information is stored securely on MongoDB Atlas</li>
              <li>You can request deletion of your data at any time</li>
              <li>
                We do not share your personal data with third parties for
                advertising purposes
              </li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              By using Verdan, you acknowledge that you have read and understood
              this Privacy Policy and agree to its terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
