export const metadata = { title: "Privacy Policy · CabinetShop.io" };

export default function Privacy() {
  return (
    <section className="py-24">
      <div className="max-w-[820px] mx-auto px-7">
        <h1 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-neutral-500 text-[13px] mt-2">Last updated July 13, 2026</p>
        <div className="space-y-6 text-[15px] leading-relaxed text-neutral-300 mt-10">
          <p>
            CabinetShop.io is operated by Crafted &amp; Company, Houston, Texas. This policy explains what
            we collect, why, and what we will never do with it.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">What we collect</h2>
          <p>
            Account information: your email address and password (stored as a hash by our authentication
            provider, Supabase). Shop data: the clients, jobs, materials, tasks, messages, and related
            records your team enters to run your shop. Lead information: if you request early access or
            contact us, the details you submit (name, shop name, email, phone, city, state, website).
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">How we use it</h2>
          <p>
            To run the product, to support you, and to contact you about your account or your early access
            request. That is the whole list. We do not sell your data, we do not share it with advertisers,
            and we do not use your shop data to train anything.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Where it lives</h2>
          <p>
            Data is stored in Supabase (Postgres) with Row Level Security enforcing that each shop&apos;s
            data is only visible to members of that shop. The application is hosted on Vercel.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Cookies</h2>
          <p>
            We use only the cookies required to keep you signed in and to remember which shop you are
            viewing. There are no advertising or cross-site tracking cookies.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Your rights and deletion</h2>
          <p>
            Your data is yours. Email <a href="mailto:hello@cabinetshop.io" className="text-amber-500">hello@cabinetshop.io</a>{" "}
            from your account email to request an export of your shop&apos;s data or full deletion of your
            account and workspace. Deletion requests are completed within 30 days.
          </p>
          <h2 className="text-[20px] font-bold text-paper pt-4">Contact</h2>
          <p>
            Questions about this policy: <a href="mailto:hello@cabinetshop.io" className="text-amber-500">hello@cabinetshop.io</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
