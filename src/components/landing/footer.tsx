import Link from "next/link";

import { Logo } from "@/components/shared/logo";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Try-On Studio", href: "/try-on" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Live demo", href: "#demo" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Reviews", href: "#reviews" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const SOCIALS = [
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-4"
        aria-hidden="true"
      >
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-border/60 bg-card/50 border-t">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="flex flex-col items-start gap-4">
            <Logo />
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              The virtual fitting room that helps stores and shoppers see clothes before they buy.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-accent-strong focus-visible:ring-ring flex size-10 items-center justify-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3" aria-label="Footer">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading} className="flex flex-col gap-3">
                <h3 className="font-heading text-sm font-semibold">{column.heading}</h3>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-border/60 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} AI Changing Room. All rights reserved.
          </p>
          <p className="border-border bg-card text-muted-foreground rounded-full border px-3 py-1 text-xs">
            Free MVP demo — no payments, no plans, just try-on
          </p>
        </div>
      </div>
    </footer>
  );
}
