import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi",
  "Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "My Addresses — SipCellar" }] }),
  component: AddressesPage,
});

type Address = {
  id: string; label: string | null; recipient_name: string | null; phone: string | null;
  street: string; area: string | null; city: string; state: string; is_default: boolean;
};

function AddressesPage() {
  const [addrs, setAddrs] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setAddrs((data ?? []) as Address[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    toast.success("Address removed");
    load();
  };
  const makeDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-3xl">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-2">Delivery</p>
              <h1 className="font-display text-4xl lg:text-5xl font-light">Saved addresses</h1>
            </div>
            <Button variant="hero" onClick={() => setAdding(true)}><Plus /> New</Button>
          </div>

          {adding && <AddressForm onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load(); }} />}

          {loading ? (
            <div className="space-y-3 mt-6">{[...Array(2)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-card border border-border animate-pulse" />)}</div>
          ) : addrs.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-lg bg-card mt-6">
              <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">No saved addresses yet.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-6">
              {addrs.map((a) => (
                <div key={a.id} className="p-5 rounded-lg border border-border bg-card flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display text-lg">{a.label ?? "Address"}</p>
                      {a.is_default && <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/40 rounded-full px-2 py-0.5">Default</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.recipient_name} · {a.phone}</p>
                    <p className="text-sm mt-1">{a.street}{a.area ? `, ${a.area}` : ""}, {a.city}, {a.state}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!a.is_default && <button onClick={() => makeDefault(a.id)} className="text-xs text-primary hover:underline">Make default</button>}
                    <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function AddressForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ label: "Home", recipient_name: "", phone: "", street: "", area: "", city: "", state: "Lagos" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({ ...f, user_id: user.id });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Address saved");
    onSaved();
  };

  return (
    <form onSubmit={submit} className="mt-6 p-6 border border-primary/30 rounded-lg bg-card space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Fld label="Label"><Input value={f.label} onChange={(e) => set("label", e.target.value)} /></Fld>
        <Fld label="Recipient" required><Input value={f.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} required /></Fld>
      </div>
      <Fld label="Phone" required><Input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} required placeholder="+234..." /></Fld>
      <Fld label="Street address" required><Input value={f.street} onChange={(e) => set("street", e.target.value)} required /></Fld>
      <Fld label="Area / Landmark"><Input value={f.area} onChange={(e) => set("area", e.target.value)} /></Fld>
      <div className="grid grid-cols-2 gap-3">
        <Fld label="City" required><Input value={f.city} onChange={(e) => set("city", e.target.value)} required /></Fld>
        <Fld label="State" required>
          <select value={f.state} onChange={(e) => set("state", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
            {NG_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Fld>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="hero" disabled={saving}>{saving ? "Saving…" : "Save address"}</Button>
        <Button type="button" variant="ghost-gold" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

function Fld({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}{required && <span className="text-primary"> *</span>}</Label>
      {children}
    </div>
  );
}
