import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | Westernacher SAP FSD Generator",
  description: "Terms of Service for the Westernacher SAP FSD Generator",
};

export default function TermsPage() {
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
            <ScrollText className="h-8 w-8" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Terms of Service</h1>
              <p className="text-white/70 text-sm mt-1">Last updated: February 25, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-8 prose prose-sm max-w-none text-muted-foreground">

            <h2 className="text-lg font-semibold text-[#1B2A4A] mt-0">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the SAP Functional Specification Document (FSD) Generator (&quot;the Service&quot;)
              operated by Westernacher Digital Core NA (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to be bound by these
              Terms of Service. If you do not agree, please do not use the Service.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">2. Description of Service</h2>
            <p>
              The Service provides AI-powered generation of SAP Functional Specification Documents. It uses
              artificial intelligence (Anthropic Claude) to generate document content based on user-provided
              business requirements. The Service includes document generation, editing, sharing, export,
              and collaboration features.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">3. User Obligations</h2>
            <ul>
              <li>You must provide accurate information when using the Service</li>
              <li>You are responsible for the content of requirements you submit</li>
              <li>You must not submit personally identifiable information (PII) of third parties in requirements</li>
              <li>You must not use the Service for any unlawful purpose</li>
              <li>You must not attempt to reverse-engineer, hack, or disrupt the Service</li>
              <li>You must not submit malicious content, scripts, or files</li>
              <li>You must comply with applicable data protection laws when inputting data</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">4. Intellectual Property</h2>
            <h3 className="text-base font-medium text-[#1B2A4A]">4.1 Your Content</h3>
            <p>
              You retain ownership of the business requirements, project details, and other content you submit
              to the Service. By using the Service, you grant us a limited license to process your content
              solely for the purpose of generating FSDs.
            </p>
            <h3 className="text-base font-medium text-[#1B2A4A]">4.2 Generated Documents</h3>
            <p>
              Generated FSD content is provided for your use. You may use, modify, and distribute the
              generated documents for your business purposes. However, generated content is created by AI
              and should be reviewed by qualified SAP professionals before use in production environments.
            </p>
            <h3 className="text-base font-medium text-[#1B2A4A]">4.3 Our IP</h3>
            <p>
              The Service, including its design, AI prompts, templates, and underlying technology, remains
              the intellectual property of Westernacher Digital Core NA.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">5. AI-Generated Content Disclaimer</h2>
            <p>
              The Service uses artificial intelligence to generate document content. While we strive for accuracy:
            </p>
            <ul>
              <li>AI-generated content may contain inaccuracies, outdated information, or errors</li>
              <li>Generated FSDs should be reviewed and validated by qualified SAP consultants</li>
              <li>SAP transaction codes, table names, and configuration details should be verified against your specific SAP system</li>
              <li>We do not guarantee that generated documents meet any specific regulatory or compliance requirements</li>
              <li>The Service is an aid to document creation, not a replacement for professional SAP consulting</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">6. Data Processing</h2>
            <p>
              Your data is processed in accordance with our <Link href="/privacy" className="text-[#0091DA] hover:underline">Privacy Policy</Link>.
              By using the Service, you acknowledge that your requirements and uploaded documents will be
              processed by third-party AI services (Anthropic Claude) for content generation.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">7. Service Availability</h2>
            <ul>
              <li>We strive to maintain Service availability but do not guarantee uninterrupted access</li>
              <li>We may perform maintenance, updates, or modifications at any time</li>
              <li>AI model availability depends on third-party providers (Anthropic)</li>
              <li>We reserve the right to modify or discontinue the Service with reasonable notice</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WESTERNACHER DIGITAL CORE NA SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM
              YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS
              OPPORTUNITIES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE
              IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Westernacher Digital Core NA from any claims,
              damages, or expenses arising from your use of the Service, your violation of these Terms,
              or your violation of any third-party rights.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which Westernacher Digital Core NA
              is incorporated, without regard to conflict of law principles. For EU users, mandatory
              consumer protection laws of your country of residence apply.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes
              constitutes acceptance of the updated Terms. Material changes will be communicated with
              reasonable notice.
            </p>

            <h2 className="text-lg font-semibold text-[#1B2A4A]">12. Contact</h2>
            <p>
              For questions about these Terms of Service:<br />
              <strong>Westernacher Digital Core NA</strong><br />
              Email: legal@westernacher.com
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
