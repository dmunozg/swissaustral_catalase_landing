import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight } from "lucide-react";
import "./styles.css";

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

function SwissaustralMark({ light = false }) {
  return (
    <img
      className={`brand-logo-image ${light ? "brand-logo-image--light" : ""}`}
      src={
        light
          ? "/assets/swissaustral-logo-light.png"
          : "/assets/swissaustral-logo-dark.png"
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
          href="#top"
          onClick={goTo("#top")}
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
          <Button href="#contact" variant="small" onClick={goTo("#contact")}>
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
          <Button href="#contact" variant="light" onClick={goTo("#contact")}>
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
                variant="light"
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
                  "",
                  "Low sensitivity",
                  "A weak response to changes in analyte concentration.",
                ],
                [
                  "",
                  "Limited linear range",
                  "Early saturation across the target concentration range.",
                ],
                [
                  "",
                  "High detection limit",
                  "Insufficient response at lower analyte concentrations.",
                ],
                [
                  "",
                  "Peroxide accumulation",
                  "A reactive by-product building up in the sensing layer.",
                ],
              ].map(([number, title, text]) => (
                <Reveal key={number} className="limitation-card">
                  <span className="card-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="card-arrow">
                    <ArrowUpRight className="arrow-icon" aria-hidden="true" />
                  </span>
                </Reveal>
              ))}
            </div>
            <div className="section-cta">
              <Button
                href="#contact"
                variant="outline"
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
              <div className="reaction-divider">
                <span>signal generated</span>
                <i />
              </div>
              <div className="reaction-row reaction-row--catalase">
                <div className="reaction-label">OXYGEN RECOVERY</div>
                <div className="molecule-chip molecule-chip--peroxide">
                  2H<sub>2</sub>O<sub>2</sub>
                </div>
                <span className="reaction-arrow">
                  <span className="catalase-label">COLD-ACTIVE CATALASE</span> →
                </span>
                <div className="molecule-chip molecule-chip--water">
                  2H<sub>2</sub>O
                </div>
                <span className="reaction-plus">+</span>
                <div className="molecule-chip molecule-chip--oxygen">
                  O<sub>2</sub>
                </div>
              </div>
            </Reveal>
            <Reveal className="mechanism-bottom">
              <div>
                <span className="big-number">01</span>
                <p>
                  Dispose of peroxide while returning part of the consumed
                  oxygen to the sensing layer.
                </p>
              </div>
              <Button
                href="#contact"
                variant="light-outline"
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
                variant="outline"
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
                variant="light"
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
                These characteristics make <em>Cold-Active Catalase</em> worth evaluating
                as a peroxide-management component in your oxidase-based sensor.
              </p>
              <Button
                href="#contact"
                variant="outline"
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
                <span>Unlock the power of nature™</span>
              </div>
            </Reveal>
            <Reveal className="contact-form-wrap">
              <form
                className="contact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
              >
                <label>
                  Name
                  <input type="text" placeholder="Your name" required />
                </label>
                <label>
                  Email
                  <input type="email" placeholder="you@company.com" required />
                </label>
                <label>
                  How can we help?
                  <textarea
                    rows="4"
                    placeholder="Tell us briefly about your sensor, application, or the technical information you need."
                    required
                  />
                </label>
                <div className="form-foot">
                  <span>Cloudflare Turnstile placeholder</span>
                  <button type="submit" className="button button--light">
                    {submitted
                      ? "Message staged"
                      : "Start a technical conversation"}
                    <ArrowUpRight className="arrow-icon" aria-hidden="true" />
                  </button>
                </div>
                {submitted && (
                  <p className="form-success" role="status">
                    Thank you — this prototype has staged your message locally.
                  </p>
                )}
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-top">
            <SwissaustralMark light />
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
    </div>
  );
}

function MetricCard({ metric }) {
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
            {metric.before.toLocaleString()} <small>{metric.unit}</small>
          </b>
        </div>
        <div className="bar-line bar-line--accent">
          <span>GOx + catalase</span>
          <div>
            <i style={{ "--bar-width": `${(metric.after / max) * 100}%` }} />
          </div>
          <b>
            {metric.after.toLocaleString()} <small>{metric.unit}</small>
          </b>
        </div>
      </div>
      {metric.kind === "lower" && (
        <span className="lower-badge">lower is better</span>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
