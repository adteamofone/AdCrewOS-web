import Link from "next/link";

export const metadata = {
  title: "Blog — AdCrewOS",
  description:
    "Practical guides for solo ad operators. How to stop overnight ad spend leaks, automate Google & Meta, and send white-label client reports.",
};

export default function BlogIndex() {
  const posts = [
    {
      title: "Best Ad Management Software for Solo Agencies (2026)",
      excerpt:
        "A no-nonsense comparison of the tools built for 1-person ad agencies — and the one that actually pays for itself.",
      slug: "best-software-for-solo-ad-agencies",
      date: "Oct 22, 2026",
    },
    {
      title: "Google Ads Automation Software for Freelancers in 2026",
      excerpt:
        "Why manual Google Ads management burns freelancers, and how automation removes the 2am budget bleed.",
      slug: "google-ads-automation-freelancers",
      date: "Oct 18, 2026",
    },
    {
      title: "Ad Budget Automation Software: What to Automate First",
      excerpt:
        "The three biggest leaks in small ad spend — and the exact automation you need to stop them.",
      slug: "ad-budget-automation-software",
      date: "Oct 12, 2026",
    },
    {
      title: "White Label Ad Reporting Tool for Agencies (2026)",
      excerpt:
        "Why client reporting is the highest-leverage feature for solo operators who want more clients.",
      slug: "white-label-ad-reporting-tool",
      date: "Oct 5, 2026",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="max-w-2xl">
        <Badge tone="primary" className="mb-4">Blog</Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          Ad ops for solo operators
        </h1>
        <p className="mt-3 text-muted">
          Practical guides on stopping budget bleed, automating Google &amp; Meta, and turning
          reporting into a client-acquisition channel.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="flex flex-col rounded-xl border border-border bg-bg/60 p-6 transition hover:border-primary/40"
          >
            <div className="flex items-center gap-2 text-sm text-muted">
              <time dateTime={p.date}>{p.date}</time>
            </div>
            <h2 className="font-display text-xl font-semibold text-text leading-snug">
              <Link href={`/blog/${p.slug}`} className="hover:text-primary">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
