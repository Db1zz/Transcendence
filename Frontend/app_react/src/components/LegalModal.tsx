import React, { useState, useEffect } from "react";
import { X, Shield, FileText, ChevronRight } from "lucide-react";

type LegalTab = "privacy" | "terms";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = "privacy",
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-all"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#f2ece9] rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-[#d3c5bd]">
        {/* Sidebar */}
        <div className="w-1/3 bg-[#e8deda]/50 border-r border-[#d3c5bd] p-6 flex flex-col gap-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
            Legal
          </h3>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === "privacy"
                ? "bg-brand-green text-brand-beige shadow-sm"
                : "text-gray-600 hover:bg-[#d3c5bd]/40 hover:text-gray-900"
            }`}
          >
            <Shield size={18} /> Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === "terms"
                ? "bg-brand-green text-brand-beige shadow-sm"
                : "text-gray-600 hover:bg-[#d3c5bd]/40 hover:text-gray-900"
            }`}
          >
            <FileText size={18} /> Terms of Service
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative bg-[#f2ece9]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-brand-brick hover:bg-white p-2 rounded-full transition-all shadow-sm z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 h-full overflow-y-auto scrollbar-hide">
            {activeTab === "privacy" && (
              <div className="animate-in fade-in">
                <h2 className="text-3xl font-extrabold text-brand-green mb-2">
                  Privacy Policy
                </h2>
                <p className="text-xs text-gray-400 mb-8 font-roboto">
                  Last updated: January 1, 2025
                </p>

                <Section title="1. Information We Collect">
                  <p>
                    We collect information you provide directly to us when you
                    create an account, such as your username, display name,
                    email address, and profile picture. We also collect content
                    you submit through the platform, including messages, posts,
                    and any files you upload.
                  </p>
                  <p className="mt-2">
                    We automatically collect certain technical information when
                    you use our service, including your IP address, browser
                    type, operating system, referring URLs, and device
                    identifiers.
                  </p>
                </Section>

                <Section title="2. How We Use Your Information">
                  <p>We use the information we collect to:</p>
                  <ul className="mt-2 space-y-1.5 ml-4">
                    {[
                      "Provide, maintain, and improve our services",
                      "Create and manage your account",
                      "Enable communication between users",
                      "Send you technical notices and support messages",
                      "Monitor and analyze usage patterns to improve user experience",
                      "Detect and prevent fraudulent or abusive activity",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <ChevronRight
                          size={14}
                          className="text-brand-green mt-0.5 shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="3. Information Sharing">
                  <p>
                    We do not sell, trade, or rent your personal information to
                    third parties. We may share your information in the
                    following limited circumstances:
                  </p>
                  <ul className="mt-2 space-y-1.5 ml-4">
                    {[
                      "With your consent or at your direction",
                      "With service providers who assist in our operations under strict confidentiality agreements",
                      "To comply with legal obligations or respond to lawful requests",
                      "To protect the rights, property, or safety of our users or the public",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <ChevronRight
                          size={14}
                          className="text-brand-green mt-0.5 shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="4. Data Retention">
                  <p>
                    We retain your personal data for as long as your account is
                    active or as needed to provide you services. You may request
                    deletion of your account and associated data at any time.
                    Some information may be retained for legal compliance or
                    legitimate business purposes for a period not exceeding 90
                    days after account deletion.
                  </p>
                </Section>

                <Section title="5. Cookies & Tracking">
                  <p>
                    We use cookies and similar tracking technologies to maintain
                    your session, remember your preferences, and analyze how you
                    use our platform. You can control cookies through your
                    browser settings, though disabling them may affect platform
                    functionality.
                  </p>
                </Section>

                <Section title="6. Security">
                  <p>
                    We implement industry-standard security measures including
                    encryption in transit (TLS), hashed password storage, and
                    access controls to protect your personal information.
                    However, no method of transmission over the Internet is 100%
                    secure, and we cannot guarantee absolute security.
                  </p>
                </Section>

                <Section title="7. Your Rights">
                  <p>
                    Depending on your location, you may have certain rights
                    regarding your personal data, including the right to access,
                    correct, delete, or export your data. To exercise these
                    rights, please contact us through the platform's support
                    channels.
                  </p>
                </Section>

                <Section title="8. Changes to This Policy">
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of significant changes by posting a notice on the
                    platform or sending you an email. Your continued use of the
                    service after such notice constitutes acceptance of the
                    updated policy.
                  </p>
                </Section>

                <Section title="9. Contact Us">
                  <p>
                    If you have questions about this Privacy Policy or our data
                    practices, please contact our support team through the
                    platform's help center.
                  </p>
                </Section>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="animate-in fade-in">
                <h2 className="text-3xl font-extrabold text-brand-green mb-2">
                  Terms of Service
                </h2>
                <p className="text-xs text-gray-400 mb-8 font-roboto">
                  Last updated: January 1, 2025
                </p>

                <Section title="1. Acceptance of Terms">
                  <p>
                    By accessing or using our platform, you agree to be bound by
                    these Terms of Service. If you do not agree to these terms,
                    please do not use the service. We reserve the right to
                    modify these terms at any time, and your continued use
                    constitutes acceptance of the updated terms.
                  </p>
                </Section>

                <Section title="2. Eligibility">
                  <p>
                    You must be at least 13 years of age to use this service. By
                    using the platform, you represent that you meet this
                    requirement. If you are under 18, you confirm that you have
                    obtained parental or guardian consent to use the service.
                  </p>
                </Section>

                <Section title="3. Account Responsibilities">
                  <p>
                    You are responsible for maintaining the confidentiality of
                    your account credentials. You agree to notify us immediately
                    of any unauthorized use of your account. You are responsible
                    for all activities that occur under your account.
                  </p>
                  <p className="mt-2">
                    You may not create accounts for others without their
                    permission, impersonate other persons, or create multiple
                    accounts to circumvent bans or restrictions.
                  </p>
                </Section>

                <Section title="4. Acceptable Use">
                  <p>You agree not to use the platform to:</p>
                  <ul className="mt-2 space-y-1.5 ml-4">
                    {[
                      "Post content that is unlawful, harmful, threatening, abusive, or harassing",
                      "Distribute spam, malware, or any form of malicious code",
                      "Violate any applicable laws or regulations",
                      "Infringe upon intellectual property rights of others",
                      "Collect or harvest user data without consent",
                      "Impersonate any person or entity",
                      "Interfere with or disrupt the integrity of the platform",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <ChevronRight
                          size={14}
                          className="text-brand-green mt-0.5 shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="5. Content Ownership">
                  <p>
                    You retain ownership of content you create and post on the
                    platform. By submitting content, you grant us a
                    non-exclusive, worldwide, royalty-free license to use,
                    display, and distribute that content solely for the purpose
                    of operating the service.
                  </p>
                  <p className="mt-2">
                    You are solely responsible for the content you post. We do
                    not endorse any user-submitted content.
                  </p>
                </Section>

                <Section title="6. Servers & Communities">
                  <p>
                    Server owners are responsible for the content and conduct
                    within their servers. We reserve the right to remove servers
                    or revoke server ownership that violate these terms. Members
                    must comply with both our platform rules and any rules
                    established by individual server owners.
                  </p>
                </Section>

                <Section title="7. Termination">
                  <p>
                    We reserve the right to suspend or terminate your account at
                    our discretion for violations of these Terms, without prior
                    notice. You may delete your account at any time through your
                    account settings. Upon termination, your right to use the
                    service ceases immediately.
                  </p>
                </Section>

                <Section title="8. Disclaimer of Warranties">
                  <p>
                    The service is provided "as is" without warranties of any
                    kind. We do not guarantee that the service will be
                    uninterrupted, error-free, or free of harmful components.
                    Your use of the service is at your own risk.
                  </p>
                </Section>

                <Section title="9. Limitation of Liability">
                  <p>
                    To the maximum extent permitted by law, we shall not be
                    liable for any indirect, incidental, special, or
                    consequential damages arising from your use or inability to
                    use the service, even if we have been advised of the
                    possibility of such damages.
                  </p>
                </Section>

                <Section title="10. Governing Law">
                  <p>
                    These Terms shall be governed by and construed in accordance
                    with applicable laws. Any disputes arising from these Terms
                    or the service shall be resolved through binding arbitration
                    or in the courts of competent jurisdiction.
                  </p>
                </Section>

                <Section title="11. Contact">
                  <p>
                    For questions about these Terms of Service, please reach out
                    to us through the platform's support channels.
                  </p>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper sub-component
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-7">
    <h3 className="font-extrabold text-gray-800 text-base mb-2 flex items-center gap-2">
      <span className="w-1 h-4 bg-brand-green rounded-full inline-block" />
      {title}
    </h3>
    <div className="text-gray-600 text-sm leading-relaxed font-roboto pl-3">
      {children}
    </div>
  </div>
);

export default LegalModal;
