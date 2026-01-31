import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Verdan (हरित)",
  description:
    "Privacy Policy for Verdan (हरित) - Tree Planting and Environmental Conservation Platform. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with back navigation */}
      <div className="bg-green-600 dark:bg-green-800 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-white hover:text-green-200 flex items-center gap-2 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-green-600 dark:text-green-400 mb-8">
          Verdan (हरित) - Tree Planting & Environmental Conservation Platform
        </p>

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
              Welcome to Verdan (हरित). We are committed to protecting your
              privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our mobile application
              (available on Google Play Store) and website (collectively, the
              &ldquo;Service&rdquo;).
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Verdan is a tree planting and environmental conservation platform
              that helps teams and organizations plant, track, and monitor trees
              across multiple sites with features including photo documentation,
              GPS tracking, growth analytics, and QR code identification.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By downloading, installing, or using Verdan, you agree to the
              collection and use of information in accordance with this policy.
              If you do not agree with this policy, please do not use our
              Service.
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
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (stored in encrypted form using bcrypt hashing)</li>
              <li>Designation and organization (optional)</li>
              <li>Gender (optional)</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.2 Tree and Site Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect information related to tree planting activities:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Tree location (GPS coordinates - latitude and longitude)</li>
              <li>Tree species and common names</li>
              <li>Tree characteristics (height, health status, condition)</li>
              <li>Planting dates and growth records</li>
              <li>Site information, names, and descriptions</li>
              <li>Photos and images of trees</li>
              <li>QR code data for tree identification</li>
              <li>Notes and observations about trees</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.3 Usage Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We automatically collect certain information about your device and
              usage:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Device type, model, and operating system version</li>
              <li>IP address</li>
              <li>Browser type and version (for web access)</li>
              <li>Pages visited and time spent on pages</li>
              <li>App usage statistics and feature interactions</li>
              <li>Crash logs and error reports</li>
              <li>Date and time of access</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.4 Location Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              With your permission, we collect precise location data to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Record the exact GPS coordinates of planted trees</li>
              <li>Enable location-based site management</li>
              <li>Provide mapping and navigation features</li>
              <li>Generate location analytics for tree distribution</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              You can disable location access through your device settings, but
              this may limit certain functionality of the app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>To provide, operate, and maintain our Service</li>
              <li>To authenticate users and manage user accounts</li>
              <li>To track tree planting activities and generate analytics</li>
              <li>To generate unique QR codes for tree identification</li>
              <li>
                To send email notifications, updates, and service communications
              </li>
              <li>To improve our Service and user experience</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>
                To detect, prevent, and address fraud, abuse, and security
                issues
              </li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To generate environmental impact reports and statistics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>
                We do not sell, trade, or rent your personal information to
                third parties.
              </strong>
              We may share your information only in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.1 With Your Consent
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may share your information when you give us explicit permission
              to do so.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.2 Public Tree Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Tree data accessed via QR codes is publicly viewable, including
              tree species, location coordinates, planting date, and photos.
              <strong>
                {" "}
                Personal information of the user who planted the tree is not
                shared publicly.
              </strong>
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.3 Service Providers
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may share information with trusted third-party service
              providers who assist us in operating our Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Cloud hosting services (Vercel for web hosting)</li>
              <li>Database services (MongoDB Atlas for data storage)</li>
              <li>Email service providers (Resend for transactional emails)</li>
              <li>Analytics services for app performance monitoring</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These service providers are contractually obligated to protect
              your data and use it only for the purposes we specify.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.4 Team and Organization Sharing
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Within our platform, team administrators can view information
              about trees planted by team members at their assigned sites. This
              is essential for collaborative tree management.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.5 Legal Requirements
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may disclose your information if required by law or in response
              to valid legal requests from public authorities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement industry-standard technical and organizational
              measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Passwords are encrypted using bcrypt hashing algorithm</li>
              <li>All data transmission uses secure HTTPS/TLS encryption</li>
              <li>
                Authentication implemented using secure JWT (JSON Web Tokens)
              </li>
              <li>Role-based access control (Admin, Team Admin, User roles)</li>
              <li>Regular security updates and vulnerability monitoring</li>
              <li>Secure cloud infrastructure with MongoDB Atlas</li>
              <li>
                Input validation and sanitization to prevent injection attacks
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              While we strive to protect your personal information, no method of
              transmission over the Internet or electronic storage is 100%
              secure. We cannot guarantee absolute security but continuously
              work to enhance our security measures.
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
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain environmental records and impact tracking</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Tree planting records:</strong> These may be retained
              indefinitely for environmental tracking, historical documentation,
              and conservation purposes, as they serve important ecological and
              scientific value.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Account data:</strong> If you delete your account, we will
              delete your personal information within 30 days, except where
              retention is required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Depending on your location, you may have the following rights
              regarding your data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information we hold
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or
                incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Data Portability:</strong> Request transfer of your data
                in a machine-readable format
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent for data
                processing at any time
              </li>
              <li>
                <strong>Opt-out:</strong> Opt out of marketing communications
              </li>
              <li>
                <strong>Restrict Processing:</strong> Request limitation of how
                we use your data
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              To exercise these rights, please contact us at the email address
              provided below. We will respond to your request within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Service is not intended for children under 13 years of age (or
              the applicable age of consent in your jurisdiction). We do not
              knowingly collect personal information from children under 13.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us
              immediately. If we discover that a child under 13 has provided us
              with personal information, we will delete such information from
              our servers promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your information may be transferred to and processed in countries
              other than your country of residence, including the United States
              where our service providers operate. These countries may have data
              protection laws that differ from your jurisdiction.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By using our Service, you consent to such transfers. We ensure
              that appropriate safeguards are in place to protect your
              information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Third-Party Links and Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our Service may contain links to third-party websites or services.
              We are not responsible for the privacy practices of these external
              sites. We encourage you to read the privacy policies of any
              third-party services you access through our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or for legal, operational, or regulatory
              reasons. We will:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Post the updated Privacy Policy on this page</li>
              <li>Update the &ldquo;Last Updated&rdquo; date at the top</li>
              <li>
                Notify you via email or in-app notification for significant
                changes
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Your continued use of the Service after changes become effective
              constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Application Name:</strong> Verdan (हरित)
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Developer:</strong> Verdan Team
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Email:</strong> rajatsaraswat0409@gmail.com
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Website:</strong> https://verdan-main.vercel.app
              </p>
            </div>
          </section>

          <section className="mb-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Google Play Store - App Permissions & Data Safety
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This section provides specific information required for Google
              Play Store compliance.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              13.1 App Permissions
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Android application requests the following permissions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Camera (android.permission.CAMERA):</strong> Required to
                capture photos of planted trees for documentation and progress
                tracking
              </li>
              <li>
                <strong>
                  Location (android.permission.ACCESS_FINE_LOCATION):
                </strong>{" "}
                Required to record precise GPS coordinates of tree planting
                sites for mapping and tracking
              </li>
              <li>
                <strong>
                  Storage (android.permission.READ_EXTERNAL_STORAGE,
                  WRITE_EXTERNAL_STORAGE):
                </strong>
                Required to save and access tree photos on your device
              </li>
              <li>
                <strong>Internet (android.permission.INTERNET):</strong>{" "}
                Required to sync data with our cloud servers and access online
                features
              </li>
              <li>
                <strong>
                  Network State (android.permission.ACCESS_NETWORK_STATE):
                </strong>{" "}
                Required to check network connectivity status
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              13.2 Data Safety Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Data Collection:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                Personal info (name, email) - Collected for account
                functionality
              </li>
              <li>
                Location - Collected for tree planting GPS tracking (with
                permission)
              </li>
              <li>
                Photos - Collected for tree documentation (with permission)
              </li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Data Sharing:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                We do not share personal data with third parties for advertising
              </li>
              <li>
                Tree data (non-personal) may be publicly accessible via QR codes
              </li>
              <li>
                Data is shared with service providers only for app functionality
              </li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Security Practices:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>All data is encrypted in transit using HTTPS/TLS</li>
              <li>Passwords are encrypted using bcrypt hashing</li>
              <li>
                Data is stored securely on MongoDB Atlas cloud infrastructure
              </li>
              <li>
                You can request deletion of your data at any time by contacting
                us
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              13.3 Account Deletion
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can request deletion of your account and associated data by:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                Sending an email to rajatsaraswat0409@gmail.com with subject
                &ldquo;Account Deletion Request&rdquo;
              </li>
              <li>Include your registered email address in the request</li>
              <li>We will process your request within 30 days</li>
            </ul>
          </section>

          <section className="mb-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our web application may use cookies and similar tracking
              technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns to improve our service</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              You can control cookies through your browser settings. Disabling
              cookies may affect certain features of our Service.
            </p>
          </section>

          <section className="mb-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              15. California Privacy Rights (CCPA)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you are a California resident, you have specific rights under
              the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Right to know what personal information we collect</li>
              <li>Right to delete your personal information</li>
              <li>
                Right to opt-out of the sale of personal information (we do not
                sell your data)
              </li>
              <li>
                Right to non-discrimination for exercising your privacy rights
              </li>
            </ul>
          </section>

          <section className="mb-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              16. European Users (GDPR)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you are located in the European Economic Area (EEA), you have
              additional rights under the General Data Protection Regulation
              (GDPR):
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                Legal basis for processing: consent, contract performance, and
                legitimate interests
              </li>
              <li>
                Right to lodge a complaint with your local data protection
                authority
              </li>
              <li>
                Right to data portability in a structured, machine-readable
                format
              </li>
              <li>
                Right to object to processing based on legitimate interests
              </li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              <strong>Summary:</strong> Verdan (हरित) is committed to
              environmental conservation and your privacy. We collect only the
              data necessary to provide our tree planting tracking service,
              protect it with industry-standard security measures, and never
              sell your personal information.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              By using Verdan, you acknowledge that you have read, understood,
              and agree to this Privacy Policy. Thank you for being part of our
              mission to make the world greener! 🌳
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2026 Verdan (हरित). All rights reserved.
          </p>
          <Link
            href="/"
            className="text-green-600 dark:text-green-400 hover:underline text-sm mt-2 inline-block"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
