import Link from "next/link";

export default function About() {
  return (
    <>
      <section className="border-b border-line py-24">
        <div className="max-w-[920px] mx-auto px-7">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-amber-500 border border-amber-900/50 bg-amber-500/10 px-4 py-2 rounded-full font-semibold">
            ● About
          </span>
          <h1 className="text-[clamp(40px,5.6vw,76px)] font-extrabold leading-[0.97] tracking-tight mt-6">
            Built by people who actually
            <br />
            <span className="text-amber-500">run a cabinet shop.</span>
          </h1>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[820px] mx-auto px-7 prose prose-invert space-y-7 text-[16px] leading-relaxed text-neutral-300">
          <p>
            CabinetShop.io was born inside a real cabinet shop in Austin, Texas. We were running a $1.6M custom kitchen business with a whiteboard, a stack of spreadsheets, and a group text. Jobs got lost. Materials ran out the morning of a delivery. The foreman called the owner six times a day for status.
          </p>
          <p>
            We tried every tool out there. Construction PMs were too generic. ERPs were too heavy. Pipefy was close but not built for the way wood actually moves through a shop. So we built our own.
          </p>
          <p>
            Today CabinetShop.io is the operating system that runs our shop, every day. We rolled it out to a few friends in the industry and they asked if they could use it. So here it is.
          </p>
          <p>
            We're not VC funded. We don't have a sales team. Every dollar we charge goes straight back into the product. If you have a feature request, the founder reads it. If you have a bug, the founder fixes it. If you want to talk shop, the founder picks up the phone.
          </p>
          <div className="border-l-2 border-amber-500 pl-6 my-10">
            <div className="text-[18px] text-paper font-semibold mb-2">
              "We built the tool we wished we had ten years ago."
            </div>
            <div className="text-[13px] text-neutral-500">— Frank Lujan, Founder · Crafted &amp; Company</div>
          </div>
          <p>
            CabinetShop.io is a product of <span className="text-amber-500 font-semibold">Crafted Systems</span>, the SaaS arm of Crafted &amp; Company. We build software for the trades — by people who do the trade.
          </p>
        </div>
      </section>

      <section className="border-t border-line py-24 text-center">
        <div className="max-w-[600px] mx-auto px-7">
          <h2 className="text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight">
            Want to see it run?
          </h2>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink font-bold px-7 py-4 rounded-lg mt-7 transition"
          >
            Start your shop free →
          </Link>
        </div>
      </section>
    </>
  );
}
