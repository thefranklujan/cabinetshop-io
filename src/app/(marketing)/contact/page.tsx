import { Mail, MapPin, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Contact() {
  return (
    <>
      <section className="border-b border-line py-24">
        <div className="max-w-[920px] mx-auto px-7">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-amber-500 border border-amber-900/50 bg-amber-500/10 px-4 py-2 rounded-full font-semibold">
            ● Contact
          </span>
          <h1 className="text-[clamp(40px,5.6vw,76px)] font-extrabold leading-[0.97] tracking-tight mt-6">
            We pick up
            <br />
            <span className="text-amber-500">the phone.</span>
          </h1>
          <p className="text-[18px] text-neutral-400 mt-6 max-w-[600px]">
            Real human, real cabinet shop owner, real fast reply. No tickets, no bots.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-7 grid lg:grid-cols-2 gap-7">
          {/* Contact info */}
          <div className="space-y-4">
            <a href="mailto:hello@cabinetshop.io" className="card p-7 flex items-start gap-5 hover:border-amber-500/30 transition block">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Email</div>
                <div className="text-[16px] font-bold">hello@cabinetshop.io</div>
                <div className="text-[13px] text-neutral-500 mt-1">Replies within 24 hours, often same day.</div>
              </div>
            </a>
            <div className="card p-7 flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Where we are</div>
                <div className="text-[16px] font-bold">Austin, Texas</div>
                <div className="text-[13px] text-neutral-500 mt-1">Crafted &amp; Company HQ</div>
              </div>
            </div>
            <div className="card p-7 flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Sales / demos</div>
                <div className="text-[16px] font-bold">Book a 15-min walkthrough</div>
                <div className="text-[13px] text-neutral-500 mt-1">Just email us. We'll send a calendar link.</div>
              </div>
            </div>
          </div>

          {/* Form (visual only — needs backend/email service to actually send) */}
          <form className="card p-8 space-y-4">
            <h2 className="text-[20px] font-extrabold mb-2">Send us a note</h2>
            <p className="text-[13px] text-neutral-500 mb-4">
              Tell us about your shop. We'll get back fast.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="label">Your Name</div>
                <input className="input" placeholder="Frank Lujan" />
              </div>
              <div>
                <div className="label">Shop Name</div>
                <input className="input" placeholder="Crafted Kitchens" />
              </div>
            </div>
            <div>
              <div className="label">Email</div>
              <input type="email" className="input" placeholder="you@example.com" />
            </div>
            <div>
              <div className="label">How can we help?</div>
              <textarea
                className="input"
                rows={5}
                placeholder="Tell us about your shop, your team size, what tools you're using today…"
              />
            </div>
            <button
              type="button"
              className="bg-amber-500 hover:bg-amber-400 text-ink font-bold w-full py-3 rounded-lg transition"
            >
              Send message →
            </button>
            <p className="text-[11px] text-neutral-600 text-center">
              Or just email us directly at{" "}
              <a href="mailto:hello@cabinetshop.io" className="text-amber-500">
                hello@cabinetshop.io
              </a>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
