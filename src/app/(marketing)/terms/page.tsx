export const metadata = { title: "Terms of Service · CabinetShop.io" };

export default function Terms() {
  return (
    <section className="py-24">
      <div className="max-w-[820px] mx-auto px-7">
        <h1 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-neutral-500 text-[13px] mt-2">Last updated July 13, 2026</p>
        <div className="space-y-6 text-[15px] leading-relaxed text-neutral-300 mt-10">
          <p>
            CabinetShop.io is a product of Crafted &amp; Company, Houston, Texas. By creating an account you
            agree to these terms.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Pilot status</h2>
          <p>
            CabinetShop.io is currently in pilot. The service is provided free of charge during the pilot,
            without a payment method on file. Features may change as we build with pilot shops. We will
            give pilot shops clear notice before billing launches; nothing is ever charged silently.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Your data</h2>
          <p>
            The data your team enters belongs to your shop. You can request an export or full deletion at
            any time by emailing <a href="mailto:hello@cabinetshop.io" className="text-amber-500">hello@cabinetshop.io</a>.
            We isolate each shop&apos;s data with database level Row Level Security.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Acceptable use</h2>
          <p>
            Use the product to run your shop. Do not attempt to access other shops&apos; data, probe or
            overload the service, or use it for anything unlawful.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Availability and warranty</h2>
          <p>
            We work hard to keep the service up, but during the pilot it is provided as is, without
            uptime guarantees or warranties of any kind. Keep your own copies of anything critical. Our
            liability is limited to the amount you paid us in the past 12 months, which during the pilot
            is zero.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Ending service</h2>
          <p>
            You can stop using the product and request deletion at any time. We can suspend accounts that
            violate these terms. If we ever discontinue the product, you will get at least 30 days notice
            and an export of your data.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Contact</h2>
          <p>
            Questions: <a href="mailto:hello@cabinetshop.io" className="text-amber-500">hello@cabinetshop.io</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
