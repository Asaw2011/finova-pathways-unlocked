import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Instagram, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24–48 hours.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Questions about Monucate, school licensing, partnerships, or our Quant Vault? We'd love to hear from you.
          </p>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 glass rounded-xl p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-xl p-5">
                <Mail className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-display font-semibold text-sm">Email</h3>
                <p className="text-sm text-muted-foreground">hello@monucate.com</p>
              </div>
              <div className="glass rounded-xl p-5">
                <Instagram className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-display font-semibold text-sm">Instagram</h3>
                <a href="https://instagram.com/financial.freedom.initiative" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">@financial.freedom.initiative</a>
              </div>
              <div className="glass rounded-xl p-5">
                <ExternalLink className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-display font-semibold text-sm">Financial Freedom Initiative</h3>
                <a href="https://bcinvestments.wixsite.com/financial-freedom--2" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Visit Website</a>
              </div>
              <div className="glass rounded-xl p-5">
                <MapPin className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-display font-semibold text-sm">For Schools & Districts</h3>
                <p className="text-sm text-muted-foreground">Contact us for custom pricing, PO/invoicing, and onboarding support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Contact;
