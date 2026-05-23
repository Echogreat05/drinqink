// @ts-nocheck
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi",
  "Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

export const Route = createFileRoute("/_authenticated/vendor-onboarding")({
  head: () => ({ meta: [{ title: "Become a Vendor — SipCellar" }] }),
  component: VendorOnboardingPage,
});

function VendorOnboardingPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    slug: "",
    description: "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
  });
  const [documents, setDocuments] = useState<{
    businessRegistration: File | null;
    idDocument: File | null;
    taxCertificate: File | null;
  }>({
    businessRegistration: null,
    idDocument: null,
    taxCertificate: null,
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in required"); setSubmitting(false); return; }

    const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "")
      || form.business_name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

    // Upload documents
    const uploadFile = async (file: File | null, path: string) => {
      if (!file) return null;
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from("vendor-documents").upload(`${user.id}/${path}/${fileName}`, file);
      if (error) throw error;
      return data.path;
    };

    try {
      const [businessRegPath, idDocPath, taxCertPath] = await Promise.all([
        uploadFile(documents.businessRegistration, "business-registration"),
        uploadFile(documents.idDocument, "id-document"),
        uploadFile(documents.taxCertificate, "tax-certificate"),
      ]);

      const { error } = await supabase.from("vendors").insert({
        user_id: user.id,
        business_name: form.business_name,
        slug,
        description: form.description || null,
        contact_phone: form.phone,
        contact_email: user.email ?? null,
        coverage_states: [form.state],
        status: "pending",
        business_registration_doc: businessRegPath,
        id_document: idDocPath,
        tax_certificate: taxCertPath,
      } as any);

      if (error) throw error;

      await supabase.from("user_roles").insert({ user_id: user.id, role: "vendor" });
      toast.success("Application submitted — we'll review shortly.");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-2xl">
          <div className="mb-10 text-center">
            <Store className="h-10 w-10 text-primary mx-auto mb-4" />
            <p className="text-xs tracking-widest uppercase text-primary mb-2">Vendor application</p>
            <h1 className="font-display text-4xl lg:text-5xl font-light">Sell on <span className="italic text-gradient-gold">SipCellar</span></h1>
            <p className="text-muted-foreground mt-3 text-sm">Tell us about your business. Approval typically takes 24–48 hours.</p>
          </div>

          <form onSubmit={submit} className="space-y-5 p-8 border border-border rounded-lg bg-card">
            <Field label="Business name" required>
              <Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} required />
            </Field>
            <Field label="URL slug" hint="Lowercase, no spaces. e.g. golden-cellar">
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from business name" />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
            </Field>
            <Field label="Phone" required>
              <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required placeholder="+234..." />
            </Field>
            <Field label="Address" required>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" required>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} required />
              </Field>
              <Field label="State" required>
                <select
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                  aria-label="State selection"
                  title="State selection"
                >
                  {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <DocumentUploadSection
              title="Business Registration"
              description="CAC certificate or business registration document"
              file={documents.businessRegistration}
              onFileChange={(file) => setDocuments({ ...documents, businessRegistration: file })}
              onRemove={() => setDocuments({ ...documents, businessRegistration: null })}
            />

            <DocumentUploadSection
              title="ID Document"
              description="Valid government-issued ID (driver's license, passport, etc.)"
              file={documents.idDocument}
              onFileChange={(file) => setDocuments({ ...documents, idDocument: file })}
              onRemove={() => setDocuments({ ...documents, idDocument: null })}
              required
            />

            <DocumentUploadSection
              title="Tax Certificate"
              description="Tax clearance certificate (optional but recommended)"
              file={documents.taxCertificate}
              onFileChange={(file) => setDocuments({ ...documents, taxCertificate: file })}
              onRemove={() => setDocuments({ ...documents, taxCertificate: null })}
            />

            <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}{required && <span className="text-primary"> *</span>}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function DocumentUploadSection({
  title,
  description,
  file,
  onFileChange,
  onRemove,
  required = false,
}: {
  title: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  required?: boolean;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      onFileChange(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}{required && <span className="text-primary"> *</span>}
      </Label>
      <p className="text-xs text-muted-foreground/70">{description}</p>
      {file ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="max-w-xs mx-auto"
          />
          <p className="text-xs text-muted-foreground mt-2">PDF, JPG, PNG up to 5MB</p>
        </div>
      )}
    </div>
  );
}
