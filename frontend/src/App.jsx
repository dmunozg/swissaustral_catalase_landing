import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  Droplets,
  Expand,
  RefreshCw,
  Search,
} from "lucide-react";
import { trackGenerateLead, trackWhatsAppClick } from "./google-tag.js";
import { buildWhatsAppHref } from "./whatsapp.js";

const navItems = [
  ["The challenge", "problem"],
  ["The mechanism", "mechanism"],
  ["Evidence", "evidence"],
  ["Why ours", "why-us"],
];

const metrics = [
  {
    value: "2.35×",
    label: "higher sensitivity",
    before: 161,
    after: 378,
    unit: "µS/mM",
    kind: "higher",
  },
  {
    value: "2.13×",
    label: "higher upper linear-range limit",
    before: 800,
    after: 1700,
    unit: "µM",
    kind: "higher",
  },
  {
    value: "50%",
    label: "lower reported detection limit",
    before: 16,
    after: 8,
    unit: "µM",
    kind: "lower",
  },
  {
    value: "67%",
    label: "lower within-day measurement RSD",
    before: 5.2,
    after: 1.7,
    unit: "% RSD",
    kind: "lower",
  },
];

const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
const WHATSAPP_DEV_PHONE = "10000000000";
const WHATSAPP_DEV_MESSAGE = "Hello, I'm interested in Cold-Active Catalase.";
const CONTACT_API_URL =
  import.meta.env.VITE_CONTACT_API_URL ||
  `${import.meta.env.BASE_URL}api/contact`;

function SwissaustralMark({ light = false }) {
  return (
    <img
      className={`brand-logo-image ${light ? "brand-logo-image--light" : ""}`}
      src={
        light
          ? `${import.meta.env.BASE_URL}assets/swissaustral-logo-light.png`
          : `${import.meta.env.BASE_URL}assets/swissaustral-logo-dark.png`
      }
      alt="Swissaustral"
    />
  );
}

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} reveal ${visible ? "reveal--visible" : ""}`}
    >
      {children}
    </div>
  );
}

function SectionKicker({ children, light = false }) {
  return (
    <div className={`section-kicker ${light ? "section-kicker--light" : ""}`}>
      <span className="kicker-line" />
      {children}
    </div>
  );
}

function Button({ children, href = "#contact", variant = "dark", onClick }) {
  return (
    <a className={`button button--${variant}`} href={href} onClick={onClick}>
      {children}
      <ArrowUpRight className="arrow-icon" aria-hidden="true" />
    </a>
  );
}

function WhatsAppButton() {
  const phone =
    import.meta.env.VITE_WHATSAPP_PHONE ||
    (import.meta.env.DEV ? WHATSAPP_DEV_PHONE : "");
  const message =
    import.meta.env.VITE_WHATSAPP_MESSAGE ||
    (import.meta.env.DEV ? WHATSAPP_DEV_MESSAGE : "");
  const href = buildWhatsAppHref(phone, message);

  if (!href) {
    return null;
  }

  return (
    <a
      className="whatsapp-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-tooltip="Get in touch over Whatsapp!"
      onClick={trackWhatsAppClick}
    >
      <svg viewBox="0 0 448 512" aria-hidden="true">
        <path d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157Zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6Zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6Z" />
      </svg>
    </a>
  );
}

function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      <span className="particle particle--one" />
      <span className="particle particle--two" />
      <span className="particle particle--three" />
      <span className="particle particle--four" />
      <span className="particle particle--five" />
      <svg className="orbit-lines" viewBox="0 0 600 460" fill="none">
        <ellipse
          cx="280"
          cy="222"
          rx="220"
          ry="92"
          transform="rotate(-20 280 222)"
          stroke="rgba(229,241,243,.45)"
        />
        <ellipse
          cx="280"
          cy="222"
          rx="174"
          ry="62"
          transform="rotate(34 280 222)"
          stroke="rgba(164,212,218,.38)"
        />
        <circle cx="277" cy="224" r="18" fill="#e6282f" fillOpacity=".88" />
        <circle cx="277" cy="224" r="31" stroke="#e5f1f3" strokeOpacity=".55" />
      </svg>
    </div>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState({ status: "idle", message: "" });
  const turnstileContainerRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);
  const turnstileSiteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    (import.meta.env.DEV ? TURNSTILE_TEST_SITE_KEY : "");
  const isSubmitting = formState.status === "pending";

  useEffect(() => {
    if (!turnstileSiteKey) {
      setFormState({
        status: "error",
        message: "The security check could not be completed. Please try again.",
      });
      return undefined;
    }

    let timer;
    const render = () => {
      if (!window.turnstile || !turnstileContainerRef.current) {
        timer = window.setTimeout(render, 50);
        return;
      }
      turnstileWidgetIdRef.current = window.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: turnstileSiteKey,
          action: "contact",
          size: "flexible",
          theme: "light",
          "error-callback": () =>
            setFormState({
              status: "error",
              message: "The security check could not be completed. Please try again.",
            }),
          "expired-callback": () =>
            setFormState({
              status: "error",
              message: "The security check expired. Please complete it again.",
            }),
        },
      );
    };

    render();
    return () => {
      window.clearTimeout(timer);
      if (turnstileWidgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
      }
    };
  }, [turnstileSiteKey]);

  const resetTurnstile = () => {
    if (turnstileWidgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  };

  const submitContactForm = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const turnstileToken = turnstileWidgetIdRef.current === null
      ? undefined
      : window.turnstile?.getResponse(turnstileWidgetIdRef.current);

    if (typeof turnstileToken !== "string" || !turnstileToken) {
      setFormState({
        status: "error",
        message: "Please complete the security check before sending your message.",
      });
      return;
    }

    setFormState({ status: "pending", message: "Sending your message…" });
    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          message: values.message,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        setFormState({
          status: "error",
          message:
            response.status === 429
              ? "Too many attempts. Please wait a few minutes and try again."
              : "We could not send your message. Please check your details and try again.",
        });
        return;
      }

      trackGenerateLead();
      form.reset();
      setFormState({
        status: "success",
        message: "Thank you — your message has been sent. We’ll be in touch soon.",
      });
    } catch {
      setFormState({
        status: "error",
        message: "We could not reach the contact service. Please try again shortly.",
      });
    } finally {
      resetTurnstile();
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const goTo = (id) => (event) => {
    event.preventDefault();
    closeMenu();
    document
      .querySelector(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="logo-link"
          href="https://www.swissaustral.com"
          aria-label="Swissaustral home"
        >
          <SwissaustralMark light />
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={goTo(`#${id}`)}>
              {label}
            </a>
          ))}
          <Button href="#contact" variant="accent" onClick={goTo("#contact")}>
            Talk to a scientist
          </Button>
        </nav>
        <button
          className={`menu-toggle ${menuOpen ? "menu-toggle--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </header>
      <div
        className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu__inner">
          <div className="mobile-menu__eyebrow">Explore the science</div>
          {navItems.map(([label, id], index) => (
            <a key={id} href={`#${id}`} onClick={goTo(`#${id}`)}>
              <span>0{index + 1}</span>
              {label}
              <ArrowUpRight className="arrow-icon" aria-hidden="true" />
            </a>
          ))}
          <Button href="#contact" variant="accent" onClick={goTo("#contact")}>
            Talk to a scientist
          </Button>
        </div>
      </div>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-image" />
          <div className="hero-overlay" />
          {/* <ParticleField /> */}
          <div className="hero-content page-container">
            {/* <SectionKicker light>SWISSAUSTRAL</SectionKicker> */}
            <p className="hero-product">COLD-ACTIVE CATALASE</p>
            <h1 id="hero-title">
              Your oxidase sensor may be running out of room.
            </h1>
            <p className="hero-subtitle">
              Manage peroxide. Recover oxygen. Give your biosensor more room to
              perform.
            </p>
            <div className="hero-actions">
              <Button
                href="#evidence"
                variant="accent"
                onClick={goTo("#evidence")}
              >
                Explore the evidence
              </Button>
              <a
                className="text-link text-link--light"
                href="#mechanism"
                onClick={goTo("#mechanism")}
              >
                See how it works{" "}
                <ArrowUpRight className="arrow-icon" aria-hidden="true" />
              </a>
            </div>
            <div className="hero-bottomline">
              <span>Cold-active by nature</span>
              <span className="hero-dot" />
            </div>
          </div>
          <div className="scroll-cue" aria-hidden="true">
            <span>Scroll to investigate</span>
            <i />
          </div>
        </section>

        <section
          className="section problem-section"
          id="problem"
          aria-labelledby="problem-title"
        >
          <div className="page-container">
            <Reveal>
              <SectionKicker>THE CHALLENGE</SectionKicker>
              <div className="split-heading">
                <h2 id="problem-title">
                  When oxygen becomes the bottleneck, your signal pays the
                  price.
                </h2>
                <p>
                  Oxidase-based sensors can face performance constraints as
                  oxygen is consumed and hydrogen peroxide accumulates in the
                  sensing layer.
                </p>
              </div>
            </Reveal>
            <div className="limitation-grid">
              {[
                [
                  ChartNoAxesColumnIncreasing,
                  "",
                  "Low sensitivity",
                  "A weak response to changes in analyte concentration.",
                ],
                [
                  Expand,
                  "",
                  "Limited linear range",
                  "Early saturation across the target concentration range.",
                ],
                [
                  Search,
                  "",
                  "High detection limit",
                  "Insufficient response at lower analyte concentrations.",
                ],
                [
                  Droplets,
                  "",
                  "Peroxide accumulation",
                  "A reactive by-product building up in the sensing layer.",
                ],
              ].map(([Icon, number, title, text]) => (
                <Reveal key={number} className="limitation-card">
                  <span className="card-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="card-arrow">
                    <Icon size={32} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </Reveal>
              ))}
            </div>
            <div className="section-cta">
              <Button
                href="#contact"
                variant="accent"
                onClick={goTo("#contact")}
              >
                Book a technical meeting
              </Button>
              <span>Let’s talk through your architecture.</span>
            </div>
          </div>
        </section>

        <section
          className="section mechanism-section"
          id="mechanism"
          aria-labelledby="mechanism-title"
        >
          <div className="page-container">
            <Reveal>
              <SectionKicker>THE MECHANISM</SectionKicker>
              <div className="mechanism-intro">
                <h2 id="mechanism-title">
                  Manage peroxide.
                  <br />
                  <em>Recover oxygen.</em>
                </h2>
                <p>
                  <strong className="product-inline">
                    Cold-Active Catalase
                  </strong>{" "}
                  helps close the loop around the oxidase reaction—turning a
                  reactive by-product into water and oxygen.
                </p>
              </div>
            </Reveal>
            <Reveal className="reaction-diagram">
              <div className="reaction-row">
                <div className="reaction-label">BIOSENSOR REACTION</div>
                <div className="reaction-content">
                  <div className="molecule-chip molecule-chip--analyte">
                    Analyte
                  </div>
                  <span className="reaction-plus">+</span>
                  <div className="molecule-chip molecule-chip--oxygen">
                    O<sub>2</sub>
                  </div>
                  <span className="reaction-arrow">
                    <span>OXIDASE</span> →
                  </span>
                  <div className="molecule-chip molecule-chip--product">
                    Product
                  </div>
                  <span className="reaction-plus">+</span>
                  <div className="molecule-chip molecule-chip--peroxide">
                    H<sub>2</sub>O<sub>2</sub>
                  </div>
                </div>
              </div>
              <div className="reaction-divider">
                <span>signal generated</span>
                <i />
              </div>
              <div className="reaction-row reaction-row--catalase">
                <div className="reaction-label">OXYGEN RECOVERY</div>
                <div className="reaction-content">
                  <div className="molecule-chip molecule-chip--peroxide">
                    2H<sub>2</sub>O<sub>2</sub>
                  </div>
                  <span className="reaction-arrow">
                    <span className="catalase-label">COLD-ACTIVE CATALASE</span>{" "}
                    →
                  </span>
                  <div className="molecule-chip molecule-chip--water">
                    2H<sub>2</sub>O
                  </div>
                  <span className="reaction-plus">+</span>
                  <div className="molecule-chip molecule-chip--oxygen">
                    O<sub>2</sub>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal className="mechanism-bottom">
              <div>
                <RefreshCw
                  className="big-number"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <p>
                  Dispose of peroxide while returning part of the consumed
                  oxygen to the sensing layer.
                </p>
              </div>
              <Button
                href="#contact"
                variant="accent"
                onClick={goTo("#contact")}
              >
                Book a technical meeting
              </Button>
            </Reveal>
          </div>
        </section>

        <section
          className="section benefits-section"
          id="benefits"
          aria-labelledby="benefits-title"
        >
          <div className="page-container">
            <Reveal>
              <SectionKicker>THE UPSIDE</SectionKicker>
              <div className="split-heading">
                <h2 id="benefits-title">
                  What could <em>Cold-Active Catalase</em> improve in your
                  biosensor?
                </h2>
                <p>
                  A stronger signal is only the beginning. A more balanced
                  sensing layer can give your team more useful space to develop.
                </p>
              </div>
            </Reveal>
            <div className="benefit-list">
              {[
                [
                  "",
                  "Increase sensitivity",
                  "Generate a stronger response to changes in analyte concentration.",
                  "By managing peroxide and partially recovering oxygen, Cold-Active Catalase could support oxidase turnover and help increase the response produced for a given analyte concentration.",
                ],
                [
                  "",
                  "Extend the linear range",
                  "Maintain a proportional response across a broader analyte range.",
                  "Partial oxygen recovery could help the oxidase continue operating as analyte concentrations increase, potentially delaying early saturation or loss of linearity.",
                ],
                [
                  "",
                  "Lower the detection limit",
                  "Improve the ability to distinguish lower analyte concentrations.",
                  "By supporting a stronger analytical response, Cold-Active Catalase could help make low analyte concentrations easier to distinguish from the background signal.",
                ],
                [
                  "",
                  "Manage peroxide exposure",
                  "Remove a reactive by-product from the sensing layer.",
                  "Cold-Active Catalase could decompose oxidase-generated hydrogen peroxide, helping reduce peroxide exposure and maintain a more favourable environment around the immobilized enzymes.",
                ],
              ].map(([number, title, lead, detail]) => (
                <Reveal key={number} className="benefit-row">
                  <span className="benefit-number">{number}</span>
                  <div className="benefit-main">
                    <h3>{title}</h3>
                    <p className="benefit-lead">{lead}</p>
                  </div>
                  <p className="benefit-detail">{detail}</p>
                </Reveal>
              ))}
            </div>
            <div className="section-cta">
              <Button
                href="#contact"
                variant="accent"
                onClick={goTo("#contact")}
              >
                Evaluate Cold-Active Catalase in your sensor
              </Button>
            </div>
          </div>
        </section>

        <section
          className="section evidence-section"
          id="evidence"
          aria-labelledby="evidence-title"
        >
          <div className="page-container">
            <Reveal>
              <SectionKicker light>PUBLISHED EVIDENCE</SectionKicker>
              <div className="evidence-heading">
                <h2 id="evidence-title">Reported performance improvements.</h2>
                <p>
                  Results reported with catalase in a specific conductometric
                  glucose-biosensor architecture. Your architecture should be
                  evaluated independently.
                </p>
              </div>
            </Reveal>
            <div className="metric-grid">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </div>
            <Reveal className="evidence-source">
              <span>Source evidence</span>
              <p>
                <a href="https://doi.org/10.1002/elan.202300190">
                  Berketa et al., 2023
                </a>{" "}
                ·{" "}
                <a href="https://doi.org/10.15407/biotech17.02.024">
                  Berketa et al., 2024
                </a>
              </p>
              <small>
                Values shown are reported results, not a performance guarantee.
              </small>
            </Reveal>
            <div className="section-cta section-cta--evidence">
              <Button
                href="#contact"
                variant="accent"
                onClick={goTo("#contact")}
              >
                Evaluate Cold-Active Catalase in your sensor
              </Button>
            </div>
          </div>
        </section>

        <section
          className="section why-section"
          id="why-us"
          aria-labelledby="why-title"
        >
          <div className="page-container">
            <Reveal>
              <SectionKicker>WHY SWISSAUSTRAL</SectionKicker>
              <div className="split-heading">
                <h2 id="why-title">
                  <em>Cold-Active Catalase</em>, born for demanding conditions.
                </h2>
                <p>
                  Derived from an extremophile found in the Patagonian Ice
                  Fields, with activity across demanding temperature and pH
                  conditions and long-term storage stability.
                </p>
              </div>
            </Reveal>
            <div className="origin-panel">
              <div className="origin-image" />
              <div className="origin-copy">
                <span className="origin-label">
                  ORIGIN / PATAGONIAN ICE FIELDS
                </span>
                <h3>
                  Cold is not a constraint.
                  <br />
                  <em>It is the starting point.</em>
                </h3>
                <p>
                  Our{" "}
                  <strong className="product-inline">
                    Cold-Active Catalase
                  </strong>{" "}
                  originates from an organism adapted to one of the planet’s
                  most demanding cold environments.
                </p>
              </div>
            </div>
            <div className="proof-grid">
              {[
                [
                  "5°C-70°C",
                  "Active at temperatures as low as 5°C and as high as 70°C",
                  "Temperature becomes one less thing to worry about.",
                ],
                [
                  "pH 4–11",
                  "Active across a broad pH range",
                  "Explore compatibility across a broad range of assay conditions.",
                ],
                [
                  "2 yrs",
                  "Storage-stable for up to two years",
                  "Plan longer development programs with a stable enzyme supply.",
                ],
              ].map(([value, title, text]) => (
                <Reveal key={title} className="proof-item">
                  <strong>{value}</strong>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
            <div className="why-bottom">
              <p>
                These characteristics make <em>Cold-Active Catalase</em> worth
                evaluating as a peroxide-management component in your
                oxidase-based sensor.
              </p>
              <Button
                href="#contact"
                variant="accent"
                onClick={goTo("#contact")}
              >
                Request full technical details
              </Button>
            </div>
          </div>
        </section>

        <section
          className="contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-orbit" aria-hidden="true" />
          <div className="page-container contact-grid">
            <Reveal>
              <SectionKicker light>06 / START A CONVERSATION</SectionKicker>
              <h2 id="contact-title">
                Let’s discuss
                <br />
                <em>your biosensor.</em>
              </h2>
              <p>
                Tell us briefly about your application. We can share full
                technical details and discuss how{" "}
                <strong className="product-inline product-inline--dark">
                  Cold-Active Catalase
                </strong>{" "}
                could be evaluated in your sensor.
              </p>
              <div className="contact-aside">
                <span>SWISSAUSTRAL</span>
              </div>
            </Reveal>
            <Reveal className="contact-form-wrap">
              <form
                className="contact-form"
                onSubmit={submitContactForm}
                aria-busy={isSubmitting}
              >
                <label>
                  Name
                  <input name="name" type="text" placeholder="Your name" maxLength="100" required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" placeholder="you@company.com" maxLength="254" required />
                </label>
                <label>
                  How can we help?
                  <textarea
                    name="message"
                    rows="4"
                    maxLength="5000"
                    placeholder="Tell us briefly about your sensor, application, or the technical information you need."
                    required
                  />
                </label>
                <div className="turnstile-wrap">
                  <div ref={turnstileContainerRef} aria-label="Security check" />
                </div>
                <div className="form-foot">
                  <button
                    type="submit"
                    className="button button--accent"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Sending…"
                      : formState.status === "success"
                        ? "Send another message"
                        : "Start a technical conversation"}
                    <ArrowUpRight className="arrow-icon" aria-hidden="true" />
                  </button>
                </div>
                <p
                  id="contact-form-status"
                  className={`form-message form-message--${formState.status}`}
                  role={formState.status === "error" ? "alert" : "status"}
                  aria-live="polite"
                >
                  {formState.message}
                </p>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-top">
            <a
              href="https://www.swissaustral.com"
              aria-label="Swissaustral home"
            >
              <SwissaustralMark light />
            </a>
            <span>Cold-Active Catalase for Oxidase-based biosensors</span>
          </div>
          <p className="disclaimer">
            Potential outcomes are based on the catalase reaction and results
            reported with other catalase preparations. The numerical metrics
            presented in the published-evidence section come from a specific
            conductometric glucose-biosensor architecture and may not be
            reflected in your own application. Performance must be evaluated in
            each sensor architecture.
          </p>
          <div className="footer-bottom">
            <span>© Swissaustral · 2026</span>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}

export function MetricCard({ metric }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const max = Math.max(metric.before, metric.after);
  return (
    <div
      ref={ref}
      className={`metric-card ${visible ? "metric-card--visible" : ""}`}
    >
      <div className="metric-top">
        <strong>{metric.value}</strong>
        <span>{metric.label}</span>
      </div>
      <div className="metric-bars">
        <div className="bar-line">
          <span>GOx only</span>
          <div>
            <i style={{ "--bar-width": `${(metric.before / max) * 100}%` }} />
          </div>
          <b>
            {metric.before.toLocaleString("en-US")} <small>{metric.unit}</small>
          </b>
        </div>
        <div className="bar-line bar-line--accent">
          <span>GOx + catalase</span>
          <div>
            <i style={{ "--bar-width": `${(metric.after / max) * 100}%` }} />
          </div>
          <b>
            {metric.after.toLocaleString("en-US")} <small>{metric.unit}</small>
          </b>
        </div>
      </div>
      {metric.kind === "lower" && (
        <span className="lower-badge">lower is better</span>
      )}
    </div>
  );
}
