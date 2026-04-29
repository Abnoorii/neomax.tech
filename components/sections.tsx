import { ArrowRight, BarChart3, ChartNoAxesCombined, ShoppingBag, Target, Zap } from "lucide-react";

const navLinks = ["Services", "Work", "About", "Pricing", "Blog", "Contact"];

export default function Sections() {
  return (
    <main>
      <section className="sticky top-0 z-50 border-b border-white/10 bg-bg/80 backdrop-blur-xl">
        <div className="section-shell flex items-center justify-between py-5">
          <div className="text-xl font-extrabold tracking-tight">NEOMAX</div>
          <nav className="hidden gap-8 text-sm text-textSecondary md:flex">{navLinks.map((item) => <a key={item}>{item}</a>)}</nav>
          <div className="flex gap-3">
            <button className="rounded-full bg-neomax-gradient px-4 py-2 text-sm font-semibold">Get a Free Audit</button>
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm">Login</button>
          </div>
        </div>
      </section>

      <section className="section-shell grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-sm text-accentCyan">Global Growth Agency</p>
          <h1 className="text-5xl font-extrabold leading-tight md:text-7xl">We Don't Just Market Your Business. We Engineer Its Growth.</h1>
          <p className="mt-6 max-w-2xl text-lg text-textSecondary">NEOMAX is a global growth agency delivering high-performance digital marketing, revenue-focused sales systems, and conversion-optimized e-commerce.</p>
          <div className="mt-8 flex gap-4">
            <button className="rounded-full bg-neomax-gradient px-6 py-3 font-semibold">Start Growing <ArrowRight className="ml-2 inline h-4 w-4"/></button>
            <button className="rounded-full border border-white/20 px-6 py-3">See Our Work</button>
          </div>
        </div>
        <div className="glass-card p-8">
          <p className="font-mono text-sm text-textSecondary">Dashboard mockup placeholder</p>
          <div className="mt-4 space-y-3">{["↑ 340% ROAS", "2.4x Revenue Growth", "↓ 62% CPA"].map((m) => <div key={m} className="rounded-xl bg-white/5 p-3">{m}</div>)}</div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-bg2">
        <div className="section-shell grid grid-cols-2 gap-6 text-center font-mono md:grid-cols-6">{["120+ Clients", "$50M+ Revenue", "$10M+ Spend", "15+ Countries", "4.8x ROAS", "25+ Team"].map((s)=><div key={s} className="glass-card p-4">{s}</div>)}</div>
      </section>

      <section className="section-shell">
        <h2 className="text-4xl font-bold md:text-5xl">Everything You Need to Dominate Your Market</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[{t:"Performance Marketing",i:Zap},{t:"Revenue & Sales",i:Target},{t:"E-commerce Growth",i:ShoppingBag}].map(({t,i:Icon})=><article key={t} className="glass-card p-6"><Icon className="h-6 w-6 text-accentBlue"/><h3 className="mt-4 text-2xl font-semibold">{t}</h3></article>)}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-4xl font-bold">The NEOMAX Growth System</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-5">{["Audit & Discovery","Strategy & Roadmap","Execute & Launch","Optimize & Scale","Report & Grow"].map((s,idx)=><div key={s} className="glass-card p-5"><p className="font-mono text-xs text-accentCyan">Step {idx+1}</p><p className="mt-2">{s}</p></div>)}</div>
      </section>

      <section className="section-shell">
        <h2 className="text-4xl font-bold">Results That Speak</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">{[1,2].map((i)=><article key={i} className="glass-card p-6"><p className="font-mono text-xs text-accentCyan">E-commerce</p><h3 className="mt-2 text-2xl font-semibold">Case Study {i}</h3><div className="mt-5 flex gap-2 text-sm"><span className="rounded-full bg-white/10 px-3 py-1">↑280% Traffic</span><span className="rounded-full bg-white/10 px-3 py-1">4.2x ROAS</span></div></article>)}</div>
      </section>

      <section className="section-shell">
        <h2 className="text-4xl font-bold">Transparent Pricing. No Surprises.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{["Starter","Growth","Enterprise"].map((p)=><article key={p} className="glass-card p-6"><h3 className="text-2xl font-semibold">{p}</h3><p className="mt-3 text-textSecondary">Pricing scaffold</p><button className="mt-6 rounded-lg bg-neomax-gradient px-4 py-2">Get Started</button></article>)}</div>
      </section>

      <section className="section-shell grid gap-6 lg:grid-cols-2">
        <div><h2 className="text-4xl font-bold">Built Different</h2><ul className="mt-6 space-y-3 text-textSecondary">{["Canadian-Incorporated","Data-First Approach","Global Reach","AI-Powered Tools","Full Transparency","Long-Term Partnership"].map((x)=><li key={x}>• {x}</li>)}</ul></div>
        <div className="grid gap-4 sm:grid-cols-2">{[BarChart3,ChartNoAxesCombined,Zap,Target].map((Icon,idx)=><div key={idx} className="glass-card flex h-24 items-center justify-center"><Icon className="text-accentViolet"/></div>)}</div>
      </section>

      <section className="section-shell">
        <h2 className="text-4xl font-bold">What Our Clients Say</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">{Array.from({length:8}).map((_,i)=><article key={i} className="glass-card p-5"><p>"NEOMAX helped us scale faster with clear execution and reporting."</p><p className="mt-3 text-sm text-textSecondary">Client {i+1} · Company</p></article>)}</div>
      </section>

      <section className="section-shell">
        <h2 className="text-4xl font-bold">Growth Intelligence</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">{["SEO","Paid Ads","E-commerce"].map((c)=><article key={c} className="glass-card p-5"><p className="font-mono text-xs text-accentCyan">{c}</p><h3 className="mt-2 text-xl font-semibold">Article title placeholder</h3></article>)}</div>
      </section>

      <section className="section-shell text-center">
        <h2 className="text-4xl font-bold md:text-6xl">Let's Build Something Extraordinary Together</h2>
        <p className="mx-auto mt-4 max-w-2xl text-textSecondary">Book a free 30-minute strategy call.</p>
        <button className="mt-8 rounded-full bg-neomax-gradient px-8 py-4 text-lg font-semibold">Book a Free Call</button>
      </section>

      <footer className="border-t border-white/10 bg-bg2">
        <div className="section-shell grid gap-8 md:grid-cols-4">
          <div><p className="text-xl font-bold">NEOMAX</p><p className="mt-3 text-sm text-textSecondary">Growth Engine Inc.</p></div>
          <div><p className="font-semibold">Services</p></div>
          <div><p className="font-semibold">Company</p></div>
          <div><p className="font-semibold">Contact</p></div>
        </div>
      </footer>
    </main>
  );
}
