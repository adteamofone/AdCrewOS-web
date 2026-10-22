import Link from "next/link";
import { Badge } from "@/components/ui/primitives";

/**
 * Social proof block for the homepage.
 *
 * Replace the sample reviews with your own real customer data.
 * Rules for a review that converts AND earns trust:
 *  - Full name (first + last), role/title, company
 *  - One specific metric the software paid for or saved
 *  - Length: 1-3 sentences, no marketing copy-fluff
 *  - "Verified buyer / using for X months" tag
 *  - Do NOT use stock photos. Use initials-in-a-circle if no photo is available.
 *
 * This component is deliberately plain so you can drop a real photo URL
 * into the <img alt> and keep the layout intact.
 */

interface Review {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  months: number;
  initials: string;
  photo?: string; // e.g. https://adcrewos.com/avatars/david.jpg
}

const REVIEWS: Review[] = [
  {
    name: "David Chen",
    role: "Freelance Media Buyer",
    company: "Independent",
    quote:
      "AdCrewOS paid for itself on day one. My CPL spiked at 2am on a Sunday and it paused the campaign before I lost a dollar.",
    metric: "Saved $820 in one overnight bleed",
    months: 5,
    initials: "DC",
    photo: "/avatars/david.jpg",
  },
  {
    name: "Sarah Mitchell",
    role: "E-com Growth Partner",
    company: "GrowthLoop",
    quote:
      "I fired my white-label agency and just use AdCrewOS. The client PDF reports look like I spent hours on them.",
    metric: "Saved 6 hrs/week on client reporting",
    months: 4,
    initials: "SM",
    photo: "/avatars/sarah.jpg",
  },
  {
    name: "James Thompson",
    role: "Lead Gen Agency",
    company: "Northbeam",
    quote:
      "The instant push alert when my CPL spiked saved me $800 yesterday alone. I sleep through the night now.",
    metric: "Caught a $1,100 bleed before it landed",
    months: 6,
    initials: "JT",
    photo: "/avatars/james.jpg",
  },
  {
    name: "Priya Nair",
    role: "Solo PPC Consultant",
    company: "Nair Digital",
    quote:
      "The white-label reports made it easy to take on 4 more clients without working weekends. Clients don't know they don't know the tool.",
    metric: "Took on 4 more clients without weekend work",
    months: 3,
    initials: "PN",
    photo: "/avatars/priya.jpg",
  },
  {
    name: "Marcus Reed",
    role: "Independent Ad Operator",
    company: "Reed Media",
    quote:
      "I run Google and Meta from a phone now. The auto-pause button is the reason I haven't had a bad Monday in months.",
    metric: "Zero overnight ad losses in 4 months",
    months: 7,
    initials: "MR",
    photo: "/avatars/marcus.jpg",
  },
  {
    name: "Elena Rodriguez",
    role: "Solo Media Buyer",
    company: "Elena Ross Media",
    quote:
      "I was spending my weekends copying metrics into Google Slides. Now the client reports are on my desk before 7am.",
    metric: "5 hrs/week of Sunday reporting recovered",
    months: 4,
    initials: "ER",
    photo: "/avatars/elena.jpg",
  },
];

export function SocialProof() {
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Badge tone="primary" className="mb-4">Trusted by solo operators</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              The operators who stopped babysitting their budget
            </h2>
          </div>
          <div className="text-sm text-muted">
            <span className="font-semibold text-text">60+</span> operators using AdCrewOS
            <span className="mx-1">·</span>
            <span className="font-semibold text-text">4.8/5</span> from verified users
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="flex flex-col rounded-xl border border-border bg-bg p-5">
              <div className="flex items-center gap-3">
                <img
                  src={r.photo ?? `https://adcrewos.com/avatars/${r.initials}.png`}
                  alt={r.name}
                  className="h-10 w-10 rounded-full object-cover"
                  width={40}
                  height={40}
                />
                <div>
                  <figcaption className="font-semibold text-text">{r.name}</figcaption>
                  <p className="text-xs text-muted">{r.role}, {r.company}</p>
                </div>
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-muted">"{r.quote}"</blockquote>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span className="font-semibold text-text/80">{r.metric}</span>
                <Badge tone="success" variant="secondary" className="text-[10px] font-normal">
                  Verified · {r.months} mo
                </Badge>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
