"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Briefcase,
  GraduationCap,
  Laptop,
  Calendar,
  FileText,
  Users,
  ShieldCheck,
} from "lucide-react";
import { SITE } from "@/content/site";
import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/utils";

const WE_OFFER_ITEMS = [
  {
    label: "Services",
    href: "/services",
    description: "Engineering & skill development",
    icon: Briefcase,
  },
  {
    label: "Internships",
    href: "/internships",
    description: "Industry-aligned student cohorts",
    icon: GraduationCap,
  },
  {
    label: "Training",
    href: "/training",
    description: "Hands-on technical curriculum",
    icon: Laptop,
  },
  {
    label: "Events",
    href: "/events",
    description: "Webinars, bootcamps & workshops",
    icon: Calendar,
  },
  {
    label: "Blog",
    href: "/blog",
    description: "Tech insights & student guides",
    icon: FileText,
  },
  {
    label: "Ambassador",
    href: "/ambassador/apply",
    description: "Campus leader rewards & network",
    icon: Users,
  },
  {
    label: "Verify",
    href: "/verify",
    description: "Cryptographic certificate validation",
    icon: ShieldCheck,
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Optimistic hover prefetch
  const handlePrefetch = useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {
        // Ignored
      }
    },
    [router]
  );

  // Preload top offer links on dropdown hover
  const handleDropdownHover = useCallback(() => {
    setIsDropdownOpen(true);
    WE_OFFER_ITEMS.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch {
        // Ignored
      }
    });
  }, [router]);

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check if any "We offer" item is currently active
  const isWeOfferActive = WE_OFFER_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  // Close menus whenever navigation occurs
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-navy/10 bg-surface/95 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-surface/80 backdrop-blur-sm"
      )}
    >
      <Container>
        <div className="flex h-20 items-center justify-between gap-4">
          {/* 1. Left Block: Logo Image with Tagline Directly Underneath */}
          <Link
            href="/"
            prefetch={true}
            onMouseEnter={() => handlePrefetch("/")}
            className="group flex flex-col items-start justify-center gap-0.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
            aria-label={`${SITE.name} - Home`}
          >
            <div className="relative flex items-center justify-start transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/images/logo-full.png"
                alt={SITE.name}
                width={130}
                height={60}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* 2. Middle Navigation Links: Home, We offer (Dropdown), About, Contact */}
          <nav
            aria-label="Main Navigation"
            className="hidden items-center gap-1 md:flex lg:gap-2"
          >
            {/* Link 1: Home */}
            <Link
              href="/"
              prefetch={true}
              onMouseEnter={() => handlePrefetch("/")}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink",
                pathname === "/"
                  ? "text-brand-ink font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-brand-ink"
                  : "text-navy/80 hover:bg-navy/5 hover:text-navy"
              )}
            >
              Home
            </Link>

            {/* Link 2: We offer (Dropdown Menu) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleDropdownHover}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                onMouseEnter={handleDropdownHover}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-controls="we-offer-dropdown"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink cursor-pointer",
                  isWeOfferActive || isDropdownOpen
                    ? "text-brand-ink font-semibold"
                    : "text-navy/80 hover:bg-navy/5 hover:text-navy"
                )}
              >
                <span>We offer</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isDropdownOpen ? "rotate-180 text-brand-ink" : "text-navy/50"
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Dropdown Menu Panel */}
              {isDropdownOpen && (
                <div
                  id="we-offer-dropdown"
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="We offer offerings"
                  className="absolute left-1/2 top-full -translate-x-1/2 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="rounded-2xl border border-navy/10 bg-white/98 p-2 shadow-xl backdrop-blur-md ring-1 ring-black/5">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy/40">
                      Our Programs & Platforms
                    </div>
                    <div className="space-y-0.5">
                      {WE_OFFER_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isItemActive =
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            onMouseEnter={() => handlePrefetch(item.href)}
                            role="menuitem"
                            onClick={() => setIsDropdownOpen(false)}
                            className={cn(
                              "group flex items-start gap-3 rounded-xl p-2.5 transition-colors",
                              isItemActive
                                ? "bg-brand/10 text-brand-ink"
                                : "text-navy hover:bg-navy/5"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                isItemActive
                                    ? "bg-brand-ink text-white"
                                  : "bg-navy/5 text-navy/70 group-hover:bg-brand/10 group-hover:text-brand-ink"
                              )}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold leading-snug">
                                {item.label}
                              </span>
                              <span className="text-[11px] text-body/70 line-clamp-1">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Link 3: About */}
            <Link
              href="/about"
              prefetch={true}
              onMouseEnter={() => handlePrefetch("/about")}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink",
                pathname === "/about"
                  ? "text-brand-ink font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-brand-ink"
                  : "text-navy/80 hover:bg-navy/5 hover:text-navy"
              )}
            >
              About
            </Link>

            {/* Link 4: Contact */}
            <Link
              href="/contact"
              prefetch={true}
              onMouseEnter={() => handlePrefetch("/contact")}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink",
                pathname === "/contact"
                  ? "text-brand-ink font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-brand-ink"
                  : "text-navy/80 hover:bg-navy/5 hover:text-navy"
              )}
            >
              Contact
            </Link>
          </nav>

          {/* 3. Right Action Block: ONLY the "Sign In" button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              prefetch={true}
              onMouseEnter={() => handlePrefetch("/login")}
              className="inline-flex items-center justify-center rounded-xl bg-brand-ink px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              Sign In
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-navy/15 text-navy hover:bg-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink md:hidden"
              aria-label={isOpen ? "Close menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer — slides down */}
        {isOpen ? (
          <div
            id="mobile-nav"
            className="animate-fade-in border-t border-navy/10 py-5 md:hidden"
            style={{ animationDuration: "200ms" }}
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              <Link
                href="/"
                prefetch={true}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  pathname === "/"
                    ? "bg-brand/10 text-brand-ink font-semibold"
                    : "text-navy hover:bg-navy/5"
                )}
              >
                Home
              </Link>

              {/* Mobile We offer sub-menu */}
              <div className="py-2">
                <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy/50">
                  We offer
                </div>
                <div className="mt-1 flex flex-col gap-0.5 pl-2">
                  {WE_OFFER_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand/10 text-brand-ink font-semibold"
                            : "text-navy/80 hover:bg-navy/5"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-brand-ink" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link
                href="/about"
                prefetch={true}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  pathname === "/about"
                    ? "bg-brand/10 text-brand-ink font-semibold"
                    : "text-navy hover:bg-navy/5"
                )}
              >
                About
              </Link>

              <Link
                href="/contact"
                prefetch={true}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  pathname === "/contact"
                    ? "bg-brand/10 text-brand-ink font-semibold"
                    : "text-navy hover:bg-navy/5"
                )}
              >
                Contact
              </Link>

              <div className="pt-4 px-2">
                <Link
                  href="/login"
                  prefetch={true}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
