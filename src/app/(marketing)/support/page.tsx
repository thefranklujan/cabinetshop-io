import Link from "next/link";
import { Mail, Bug, UserX } from "lucide-react";

export const metadata = { title: "Support · CabinetShop.io" };

export default function Support() {
  return (
    <section className="py-24">
      <div className="max-w-[820px] mx-auto px-7">
        <h1 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight">Support</h1>
        <p className="text-[16px] text-neutral-400 mt-4 max-w-[560px]">
          We are a small team and the founder reads every message. Typical reply time is one business day.
        </p>
        <div className="space-y-4 mt-10">
          <a href="mailto:hello@cabinetshop.io" className="card p-6 flex items-start gap-5 hover:border-amber-500/30 transition block">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[15px] font-bold">Email support</div>
              <div className="text-[13px] text-neutral-500 mt-1">
                hello@cabinetshop.io for anything: setup help, questions, billing, feedback.
              </div>
            </div>
          </a>
          <div className="card p-6 flex items-start gap-5">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[15px] font-bold">Found a bug?</div>
              <div className="text-[13px] text-neutral-500 mt-1">
                Use the Report an issue link in the app footer. It goes straight to our triage board with
                your shop context attached, so we can reproduce it fast.
              </div>
            </div>
          </div>
          <div className="card p-6 flex items-start gap-5">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[15px] font-bold">Delete your account</div>
              <div className="text-[13px] text-neutral-500 mt-1">
                Email <a href="mailto:hello@cabinetshop.io" className="text-amber-500">hello@cabinetshop.io</a>{" "}
                from your account email and we will delete your account and workspace within 30 days, with
                an export first if you want one. See the{" "}
                <Link href="/privacy" className="text-amber-500">Privacy Policy</Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
