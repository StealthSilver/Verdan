import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Harit (हरित) — how we collect, use, and protect your data on our tree planting and environmental conservation platform.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPageShell
      line1="Privacy Policy"
      lede="Harit (हरित) — tree planting and environmental conservation. How we collect, use, and safeguard your information."
      meta={
        <>
          <p>
            <strong>Effective date:</strong> January 31, 2026
          </p>
          <p>
            <strong>Last updated:</strong> January 31, 2026
          </p>
        </>
      }
    >

          <section>
            <h2>
              1. Introduction
            </h2>
            <p>
              Welcome to Harit (हरित). We are committed to protecting your
              privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our mobile application
              (available on Google Play Store) and website (collectively, the
              &ldquo;Service&rdquo;).
            </p>
            <p>
              Harit is a tree planting and environmental conservation platform
              that helps teams and organizations plant, track, and monitor trees
              across multiple sites with features including photo documentation,
              GPS tracking, growth analytics, and QR code identification.
            </p>
            <p>
              By downloading, installing, or using Harit, you agree to the
              collection and use of information in accordance with this policy.
              If you do not agree with this policy, please do not use our
              Service.
            </p>
          </section>

          <section>
            <h2>
              2. Information We Collect
            </h2>

            <h3>
              2.1 Personal Information
            </h3>
            <p>
              When you register for an account, we may collect:
            </p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (stored in encrypted form using bcrypt hashing)</li>
              <li>Designation and organization (optional)</li>
              <li>Gender (optional)</li>
              <li>Profile information</li>
            </ul>

            <h3>
              2.2 Tree and Site Data
            </h3>
            <p>
              We collect information related to tree planting activities:
            </p>
            <ul>
              <li>Tree location (GPS coordinates - latitude and longitude)</li>
              <li>Tree species and common names</li>
              <li>Tree characteristics (height, health status, condition)</li>
              <li>Planting dates and growth records</li>
              <li>Site information, names, and descriptions</li>
              <li>Photos and images of trees</li>
              <li>QR code data for tree identification</li>
              <li>Notes and observations about trees</li>
            </ul>

            <h3>
              2.3 Usage Data
            </h3>
            <p>
              We automatically collect certain information about your device and
              usage:
            </p>
            <ul>
              <li>Device type, model, and operating system version</li>
              <li>IP address</li>
              <li>Browser type and version (for web access)</li>
              <li>Pages visited and time spent on pages</li>
              <li>App usage statistics and feature interactions</li>
              <li>Crash logs and error reports</li>
              <li>Date and time of access</li>
            </ul>

            <h3>
              2.4 Location Data
            </h3>
            <p>
              With your permission, we collect precise location data to:
            </p>
            <ul>
              <li>Record the exact GPS coordinates of planted trees</li>
              <li>Enable location-based site management</li>
              <li>Provide mapping and navigation features</li>
              <li>Generate location analytics for tree distribution</li>
            </ul>
            <p>
              You can disable location access through your device settings, but
              this may limit certain functionality of the app.
            </p>
          </section>

          <section>
            <h2>
              3. How We Use Your Information
            </h2>
            <p>
              We use the collected information for various purposes:
            </p>
            <ul>
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

          <section>
            <h2>
              4. Data Sharing and Disclosure
            </h2>
            <p>
              <strong>
                We do not sell, trade, or rent your personal information to
                third parties.
              </strong>
              We may share your information only in the following circumstances:
            </p>

            <h3>
              4.1 With Your Consent
            </h3>
            <p>
              We may share your information when you give us explicit permission
              to do so.
            </p>

            <h3>
              4.2 Public Tree Information
            </h3>
            <p>
              Tree data accessed via QR codes is publicly viewable, including
              tree species, location coordinates, planting date, and photos.
              <strong>
                {" "}
                Personal information of the user who planted the tree is not
                shared publicly.
              </strong>
            </p>

            <h3>
              4.3 Service Providers
            </h3>
            <p>
              We may share information with trusted third-party service
              providers who assist us in operating our Service:
            </p>
            <ul>
              <li>Cloud hosting services (Vercel for web hosting)</li>
              <li>Database services (MongoDB Atlas for data storage)</li>
              <li>Email service providers (Resend for transactional emails)</li>
              <li>Analytics services for app performance monitoring</li>
            </ul>
            <p>
              These service providers are contractually obligated to protect
              your data and use it only for the purposes we specify.
            </p>

            <h3>
              4.4 Team and Organization Sharing
            </h3>
            <p>
              Within our platform, team administrators can view information
              about trees planted by team members at their assigned sites. This
              is essential for collaborative tree management.
            </p>

            <h3>
              4.5 Legal Requirements
            </h3>
            <p>
              We may disclose your information if required by law or in response
              to valid legal requests from public authorities.
            </p>
          </section>

          <section>
            <h2>
              5. Data Security
            </h2>
            <p>
              We implement industry-standard technical and organizational
              measures to protect your personal information:
            </p>
            <ul>
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
            <p>
              While we strive to protect your personal information, no method of
              transmission over the Internet or electronic storage is 100%
              secure. We cannot guarantee absolute security but continuously
              work to enhance our security measures.
            </p>
          </section>

          <section>
            <h2>
              6. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to:
            </p>
            <ul>
              <li>Provide our Service to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain environmental records and impact tracking</li>
            </ul>
            <p>
              <strong>Tree planting records:</strong> These may be retained
              indefinitely for environmental tracking, historical documentation,
              and conservation purposes, as they serve important ecological and
              scientific value.
            </p>
            <p>
              <strong>Account data:</strong> If you delete your account, we will
              delete your personal information within 30 days, except where
              retention is required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2>
              7. Your Rights and Choices
            </h2>
            <p>
              Depending on your location, you may have the following rights
              regarding your data:
            </p>
            <ul>
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
            <p>
              To exercise these rights, please contact us at the email address
              provided below. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2>
              8. Children&apos;s Privacy
            </h2>
            <p>
              Our Service is not intended for children under 13 years of age (or
              the applicable age of consent in your jurisdiction). We do not
              knowingly collect personal information from children under 13.
            </p>
            <p>
              If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us
              immediately. If we discover that a child under 13 has provided us
              with personal information, we will delete such information from
              our servers promptly.
            </p>
          </section>

          <section>
            <h2>
              9. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence, including the United States
              where our service providers operate. These countries may have data
              protection laws that differ from your jurisdiction.
            </p>
            <p>
              By using our Service, you consent to such transfers. We ensure
              that appropriate safeguards are in place to protect your
              information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2>
              10. Third-Party Links and Services
            </h2>
            <p>
              Our Service may contain links to third-party websites or services.
              We are not responsible for the privacy practices of these external
              sites. We encourage you to read the privacy policies of any
              third-party services you access through our platform.
            </p>
          </section>

          <section>
            <h2>
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or for legal, operational, or regulatory
              reasons. We will:
            </p>
            <ul>
              <li>Post the updated Privacy Policy on this page</li>
              <li>Update the &ldquo;Last Updated&rdquo; date at the top</li>
              <li>
                Notify you via email or in-app notification for significant
                changes
              </li>
            </ul>
            <p>
              Your continued use of the Service after changes become effective
              constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2>
              12. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="legal-contact-card">
              <p>
                <strong>Application Name:</strong> Harit (हरित)
              </p>
              <p>
                <strong>Developer:</strong> Harit Team
              </p>
              <p>
                <strong>Email:</strong> rajatsaraswat0409@gmail.com
              </p>
              <p>
                <strong>Website:</strong> https://verdan-main.vercel.app
              </p>
            </div>
          </section>

          <section className="legal-section-divider">
            <h2>
              13. Google Play Store - App Permissions & Data Safety
            </h2>
            <p>
              This section provides specific information required for Google
              Play Store compliance.
            </p>

            <h3>
              13.1 App Permissions
            </h3>
            <p>
              Our Android application requests the following permissions:
            </p>
            <ul>
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

            <h3>
              13.2 Data Safety Information
            </h3>
            <p>
              <strong>Data Collection:</strong>
            </p>
            <ul>
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

            <p>
              <strong>Data Sharing:</strong>
            </p>
            <ul>
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

            <p>
              <strong>Security Practices:</strong>
            </p>
            <ul>
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

            <h3>
              13.3 Account Deletion
            </h3>
            <p>
              You can request deletion of your account and associated data by:
            </p>
            <ul>
              <li>
                Sending an email to rajatsaraswat0409@gmail.com with subject
                &ldquo;Account Deletion Request&rdquo;
              </li>
              <li>Include your registered email address in the request</li>
              <li>We will process your request within 30 days</li>
            </ul>
          </section>

          <section className="legal-section-divider">
            <h2>
              14. Cookies and Tracking Technologies
            </h2>
            <p>
              Our web application may use cookies and similar tracking
              technologies to:
            </p>
            <ul>
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns to improve our service</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling
              cookies may affect certain features of our Service.
            </p>
          </section>

          <section className="legal-section-divider">
            <h2>
              15. California Privacy Rights (CCPA)
            </h2>
            <p>
              If you are a California resident, you have specific rights under
              the California Consumer Privacy Act (CCPA):
            </p>
            <ul>
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

          <section className="legal-section-divider">
            <h2>
              16. European Users (GDPR)
            </h2>
            <p>
              If you are located in the European Economic Area (EEA), you have
              additional rights under the General Data Protection Regulation
              (GDPR):
            </p>
            <ul>
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

          <div className="legal-highlight">
            <p>
              <strong>Summary:</strong> Harit (हरित) is committed to
              environmental conservation and your privacy. We collect only the
              data necessary to provide our tree planting tracking service,
              protect it with industry-standard security measures, and never
              sell your personal information.
            </p>
            <p>
              By using Harit, you acknowledge that you have read, understood,
              and agree to this Privacy Policy. Thank you for being part of our
              mission to make the world greener!
            </p>
          </div>
    </LegalPageShell>
  );
}
