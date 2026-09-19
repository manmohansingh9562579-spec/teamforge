import Link from "next/link";
import { Logo } from "./Logo";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/discover", label: "Discover developers" },
      { href: "/teams", label: "Discover teams" },
      { href: "/teams/create", label: "Create a team" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "How it works" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signin", label: "Sign in" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-[220px] text-sm text-muted">
            Find people. Build teams. Ship projects.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-medium text-text">{c.title}</h4>
            <ul className="mt-3 space-y-2">
              {c.links.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-sm text-muted hover:text-text">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5">
        <p className="container-page text-xs text-muted">
          © {new Date().getFullYear()} TeamForge. Built for builders.
        </p>
      </div>
    </footer>
  );
}
