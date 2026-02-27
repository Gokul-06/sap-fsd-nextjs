import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | Westernacher SAP FSD Generator",
  description: "Privacy Policy for the Westernacher SAP FSD Generator",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[calc(100vh-68px-60px)] bg-[#F0F2F5]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#0091DA] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
              <p className="text-white/70 text-sm mt-1">Last updated: February 25, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-8 prose prose-sm max-w-none text-muted-foreground">

            <h2 className="text-lg font-semibold text-[#1B2A4A] mt-0">1. Introduction</h2>
            <p>
              Westernacher Consulting (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the SAP Functional Specification Document (FSD) Generator
              (&quot;the Service&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our Service. We are committed to protecting your privacy in accordance with the EU General Data
              Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">2. Data Controller</h2>
            <p>
              Westernacher Consulting is the data controller for the personal data processed through this Service.
              For any privacy-related inquiries, please contact us at: <strong>privacy@westernacher.com</strong>
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">3. Data We Collect</h2>
            <p>We collect the following categories of data:</p>

            <h3 className="text-base font-medium text-[#1B2A4A]">3.1 Data You Provide</h3>
            <ul>
              <li><strong>Document Metadata:</strong> Project title, project name, author name, and company name entered during FSD generation</li>
              <li><strong>Business Requirements:</strong> Text descriptions of SAP business processes and requirements you provide</li>
              <li><strong>Uploaded Documents:</strong> PDF or Word files uploaded for requirements extraction</li>
              <li><strong>Comments &amp; Feedback:</strong> Author names and comment content submitted on generated documents</li>
              <li><strong>Ratings:</strong> Star ratings you assign to generated documents</li>
            </ul>

            <h3 className="text-base font-medium text-[#1B2A4A]">3.2 Automatically Collected Data</h3>
            <ul>
              <li><strong>Usage Analytics:</strong> Page views, interaction patterns, and core web vitals collected via Vercel Analytics (only with your consent)</li>
              <li><strong>Technical Data:</strong> Browser type, device type, and general geographic region (country level)</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">4. How We Use Your Data</h2>
            <ul>
              <li><strong>FSD Generation:</strong> Your requirements and document metadata are processed to generate SAP Functional Specification Documents</li>
              <li><strong>AI Processing:</strong> Your requirements text and uploaded documents are sent to Anthropic (Claude AI) for AI-powered content generation. Anthropic processes this data under their data processing agreement and does not use it to train their models</li>
              <li><strong>Document Storage:</strong> Generated FSDs are stored in our database so you can access, edit, and share them</li>
              <li><strong>Quality Improvement:</strong> Feedback and ratings may be used to improve generation quality through feedback rules</li>
              <li><strong>Analytics:</strong> Aggregated, anonymized usage data helps us improve the Service (with your consent)</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">5. Third-Party Processors</h2>
            <p>We share data with the following sub-processors:</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-[#1B2A4A]">Processor</th>
                    <th className="text-left py-2 font-medium text-[#1B2A4A]">Purpose</th>
                    <th className="text-left py-2 font-medium text-[#1B2A4A]">Data Shared</th>
                    <th className="text-left py-2 font-medium text-[#1B2A4A]">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Anthropic (Claude AI)</td>
                    <td className="py-2">AI content generation</td>
                    <td className="py-2">Requirements text, uploaded documents</td>
                    <td className="py-2">United States</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Vercel</td>
                    <td className="py-2">Hosting, analytics, file storage</td>
                    <td className="py-2">Usage data, generated documents</td>
                    <td className="py-2">United States / EU</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">PostgreSQL (Neon/Supabase)</td>
                    <td className="py-2">Database storage</td>
                    <td className="py-2">All document data and metadata</td>
                    <td className="py-2">Configurable region</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">6. Legal Basis for Processing (GDPR)</h2>
            <ul>
              <li><strong>Consent (Art. 6(1)(a)):</strong> Analytics cookies and optional data processing</li>
              <li><strong>Contractual Necessity (Art. 6(1)(b)):</strong> Processing your requirements to generate FSDs is necessary to provide the Service</li>
              <li><strong>Legitimate Interest (Art. 6(1)(f)):</strong> Service improvement and security monitoring</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">7. Your Rights</h2>
            <p>Under GDPR and applicable privacy laws, you have the following rights:</p>
            <ul>
              <li><strong>Right to Access (Art. 15):</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Right to Portability (Art. 20):</strong> Export your data in a machine-readable format</li>
              <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (e.g., analytics opt-out)</li>
            </ul>
            <p>To exercise these rights, contact us at <strong>privacy@westernacher.com</strong>.</p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">8. Data Retention</h2>
            <ul>
              <li>Generated FSDs are retained until you delete them or for a maximum of 365 days from creation</li>
              <li>Shared links expire after 30 days by default</li>
              <li>Comments and feedback are retained with their associated FSD</li>
              <li>Analytics data is retained in aggregated form for up to 12 months</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">9. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your data, including:
              HTTPS encryption in transit, security headers (CSP, HSTS), input validation, rate limiting,
              and access controls. However, no method of electronic transmission or storage is 100% secure.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">10. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in the United States (Anthropic, Vercel).
              These transfers are protected by Standard Contractual Clauses (SCCs) and the EU-US Data Privacy Framework
              where applicable.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">11. Cookies</h2>
            <p>
              We use only essential cookies for Service functionality. Analytics cookies (Vercel Analytics)
              are only activated with your explicit consent via our cookie consent banner. You can manage
              your cookie preferences at any time.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting the updated policy with a new &quot;Last updated&quot; date.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">13. Contact</h2>
            <p>
              For questions about this Privacy Policy or to exercise your data protection rights:<br />
              <strong>Westernacher Consulting</strong><br />
              Email: privacy@westernacher.com
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
