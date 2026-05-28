'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Key,
  FileText,
  Users,
  Globe,
  ClipboardList,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Star,
  Menu,
  X,
  Lock,
  Zap,
  BarChart3,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // ── DATA ──────────────────────────────────────────────────────────
  const features = [
    { icon: Key, title: 'DSC Token Tracking', desc: 'Track digital signature certificate tokens, expiry dates, and custody in real time. Never miss a renewal.' },
    { icon: ClipboardList, title: 'Filing Management', desc: 'Manage ITR, GST, TDS, ROC and all compliance filings with status tracking and period management.' },
    { icon: FileText, title: 'Document Signing', desc: 'Clients sign documents digitally via Email OTP or Google Authenticator — legally binding and paperless.' },
    { icon: Globe, title: 'Remote Access', desc: 'Secure, cloud-based access for your team and clients from anywhere, any device, any time.' },
    { icon: BarChart3, title: 'Audit Trail', desc: 'Immutable, blockchain-anchored audit logs for every action. Full accountability and compliance ready.' },
    { icon: Users, title: 'Multi-Client Dashboard', desc: 'Manage hundreds of clients under one roof with a powerful, searchable, filterable dashboard.' },
  ];

  const steps = {
    ca: [
      { n: '01', title: 'Register your firm', desc: 'Create your CA account, set up your firm profile with license number and details.' },
      { n: '02', title: 'Add your clients', desc: 'Add clients with PAN, Aadhaar, contact info. They get instant access credentials.' },
      { n: '03', title: 'Manage everything', desc: 'Upload documents, track DSC tokens, manage filings — all in one dashboard.' },
    ],
    client: [
      { n: '01', title: 'Receive credentials', desc: 'Your CA adds you to the platform. You get your email + PAN login instantly.' },
      { n: '02', title: 'Set up 2FA security', desc: 'Configure Google Authenticator on first login for legally binding digital signatures.' },
      { n: '03', title: 'Sign & track', desc: 'Review documents, sign digitally via OTP or Authenticator, track all your filings.' },
    ],
  };

  const testimonials = [
    { name: 'CA Priya Mehta', firm: 'Mehta & Associates, Mumbai', rating: 5, text: 'DSC Platform has completely transformed how I manage my 80+ clients. The document signing feature alone saved us thousands in courier and printing costs.' },
    { name: 'CA Rajesh Sharma', firm: 'Sharma Tax Consultants, Jaipur', rating: 5, text: 'The DSC token tracking is a game changer. I used to miss renewal dates — now I get alerts 30 days in advance. My clients trust me more because of this tool.' },
    { name: 'CA Anjali Verma', firm: 'Verma & Co., Bengaluru', rating: 5, text: 'Onboarding clients is now a 5-minute job. The audit trail gives us legal protection and the interface is so clean my senior partners love it too.' },
  ];

  const plans = [
    {
      name: 'Starter', price: 'Free', period: 'forever', border: '#eaeaea', btn: '#111', btnText: '#fff', isPremium: false,
      features: ['Up to 10 clients', 'Basic filing management', 'Document uploads', 'Email OTP signing', 'Email support'],
    },
    {
      name: 'Professional', price: '₹1,999', period: '/month', border: '#111', btn: '#111', btnText: '#fff', isPremium: true,
      badge: 'Most Popular',
      features: ['Unlimited clients', 'All filing types', 'TOTP / Authenticator signing', 'Blockchain audit trail', 'DSC token tracking', 'Priority support', 'Team access (3 seats)'],
    },
  ];

  const faqs = [
    { q: 'Is DSC Platform legally compliant in India?', a: 'Yes. All document signatures are backed by an immutable audit trail. For DSC-specific workflows, our platform integrates with ICAI-approved signing standards.' },
    { q: 'What is the password for a client?', a: 'By default, a client\'s password is their PAN number (e.g. ABCDE1234F). They can change it after first login. The CA sets their real email during client creation.' },
    { q: 'How does document signing work?', a: 'CA uploads a document for a specific client. The client logs in, reviews it, and signs using either an Email OTP (sent to their registered email) or Google Authenticator TOTP code.' },
    { q: 'Is my data secure?', a: 'All data is encrypted in transit (TLS) and at rest. Passwords are bcrypt-hashed. We use Neon PostgreSQL with automatic backups and row-level security.' },
    { q: 'Can I try it for free?', a: 'Absolutely. Our Starter plan is free forever with support for up to 10 clients — no credit card required.' },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111', background: '#fff', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #ececec' : '1px solid transparent',
        transition: 'all 0.3s',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
            <div style={{ width: 32, height: 32, border: '1.5px solid #111', background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="#111" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>DSC Platform</span>
          </div>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
            {['Features', 'How it Works', 'Pricing', 'FAQ'].map(link => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                style={{ background: 'none', border: 'none', fontSize: 14, color: '#555', cursor: 'pointer', fontWeight: 500, padding: 0, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              >{link}</button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {isLoggedIn ? (
              <button onClick={() => router.push('/ca')} style={{
                height: 38, padding: '0 18px', background: '#111', color: '#fff',
                border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Go to Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button onClick={() => router.push('/login')} style={{
                  height: 38, padding: '0 16px', background: 'transparent', color: '#111',
                  border: '1px solid #111', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >Login</button>
                <button onClick={() => router.push('/register')} style={{
                  height: 38, padding: '0 18px', background: '#111', color: '#fff',
                  border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >Get Started <ArrowRight size={14} /></button>
              </>
            )}
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              className="mobile-menu-btn">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #ececec', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Features', 'How it Works', 'Pricing', 'FAQ'].map(link => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                style={{ background: 'none', border: 'none', fontSize: 15, color: '#111', cursor: 'pointer', fontWeight: 500, textAlign: 'left', padding: '6px 0' }}>
                {link}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{ paddingTop: 140, paddingBottom: 100, textAlign: 'center', padding: '140px 24px 100px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#fff', borderRadius: 100, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 28,
            border: '1px solid #e5e5e5',
          }}>
            <Zap size={12} color="#111" fill="#111" /> Trusted by 500+ CAs across India
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 24, color: '#111' }}>
            The modern platform<br />
            CA firms deserve
          </h1>

          <p style={{ fontSize: 18, color: '#666', lineHeight: 1.7, marginBottom: 40, maxWidth: 580, margin: '0 auto 40px' }}>
            Manage clients, track DSC tokens, handle filings, and get documents signed digitally — all in one secure, compliant platform built for Indian CAs.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <button onClick={() => router.push('/register')} style={{
              height: 50, padding: '0 28px', background: '#111', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', transition: 'transform 0.15s, opacity 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Start for free <ArrowRight size={16} />
            </button>
            <button onClick={() => scrollTo('how-it-works')} style={{
              height: 50, padding: '0 28px', background: '#fff', color: '#111',
              border: '1.5px solid #111', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            >See how it works</button>
          </div>

          {/* Dashboard Mockup */}
          <div style={{
            background: '#fff', border: '1px solid #eaeaea', borderRadius: 20,
            padding: 24, maxWidth: 900, margin: '0 auto',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
          }}>
            {/* Fake browser bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ececec' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ececec' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ececec' }} />
              <div style={{ flex: 1, height: 28, background: '#f4f4f5', borderRadius: 6, marginLeft: 8, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                <span style={{ fontSize: 11, color: '#999' }}>dscplatform.in/ca/dashboard</span>
              </div>
            </div>

            {/* Fake Dashboard UI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Total Clients', value: '48' },
                { label: 'Active Filings', value: '23' },
                { label: 'Pending Signs', value: '7' },
                { label: 'DSC Tokens', value: '31' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #eaeaea' }}>
                  <p style={{ fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 500 }}>{stat.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #eaeaea' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Clients</p>
                {['Ramesh Gupta', 'Priya Singh', 'Arun Kumar'].map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                    <div style={{ width: 28, height: 28, background: '#f4f4f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#111' }}>{name[0]}</div>
                    <span style={{ fontSize: 12, color: '#111', fontWeight: 500 }}>{name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, background: '#f4f4f5', color: '#111', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>Active</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #eaeaea' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Signatures</p>
                {['ITR_FY2024_Ramesh.pdf', 'GST_Return_Q3.pdf', 'TDS_Certificate.pdf'].map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                    <FileText size={14} color="#111" />
                    <span style={{ fontSize: 12, color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, background: '#fff', color: '#111', border: '1px solid #e5e5e5', padding: '2px 8px', borderRadius: 100, fontWeight: 600, flexShrink: 0 }}>Pending</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: '#fff', borderTop: '1px solid #f5f5f5', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>Everything your CA firm needs</h2>
            <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto' }}>Purpose-built for the Indian CA ecosystem — from sole practitioners to large firms.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="hover-card" style={{
                borderRadius: 18, padding: 28,
                cursor: 'default',
              }}>
                <div style={{ width: 44, height: 44, background: '#f4f4f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <f.icon size={20} color="#111" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#111' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: '#fff', borderTop: '1px solid #f5f5f5', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px' }}>Simple for everyone</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="how-it-works-grid">
            {[
              { role: 'For CAs', steps: steps.ca },
              { role: 'For Clients', steps: steps.client },
            ].map(({ role, steps: roleSteps }) => (
              <div key={role}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111' }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{role}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {roleSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: '#f4f4f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{step.n}</span>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>{step.title}</h4>
                        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #f5f5f5', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Testimonials</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px' }}>Loved by CAs across India</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="hover-card" style={{ borderRadius: 18, padding: 28 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#111" color="#111" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #f5f5f5', paddingTop: 16 }}>
                  <div style={{ width: 38, height: 38, background: '#f4f4f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#111' }}>
                    {t?.name?.split(' ')[1]?.[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{t?.name}</p>
                    <p style={{ fontSize: 11, color: '#888' }}>{t?.firm}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: '#fff', borderTop: '1px solid #f5f5f5', padding: '100px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: 16, color: '#666' }}>Start free. Scale when you're ready.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={i} className="pricing-card" style={{
                borderRadius: 24, padding: 36,
                border: `1.5px solid ${plan.border}`,
                position: 'relative', overflow: 'hidden',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: 20, right: 20, background: '#111', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
                    {plan.badge}
                  </div>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: '#111' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: '#666' }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={15} color="#111" />
                      <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => router.push('/register')} style={{
                  width: '100%', height: 44, background: plan.btn, color: plan.btnText,
                  border: 'none',
                  borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'opacity 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Get started <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: '#fff', borderTop: '1px solid #f5f5f5', padding: '100px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px' }}>Common questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #eaeaea',
                overflow: 'hidden', cursor: 'pointer',
              }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', paddingRight: 16 }}>{faq.q}</p>
                  <ChevronDown size={18} color="#888" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>
                {openFaq === i && (
                  <div style={{ padding: '0 22px 18px', borderTop: '1px solid #f5f5f5' }}>
                    <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, paddingTop: 14 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ width: 52, height: 52, background: '#f4f4f5', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Lock size={24} color="#111" />
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111', letterSpacing: '-1px', marginBottom: 16 }}>
            Ready to modernize your practice?
          </h2>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 36 }}>Join 500+ CA firms already using DSC Platform. Free to start, no credit card needed.</p>
          <button onClick={() => router.push('/register')} style={{
            height: 50, padding: '0 32px', background: '#111', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            transition: 'opacity 0.15s, transform 0.15s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Create free account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#fff', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, border: '1.5px solid #111', background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={15} color="#111" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>DSC Platform</span>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {['Features', 'Pricing', 'FAQ', 'Login', 'Register'].map(link => (
                <button key={link} onClick={() => link === 'Login' ? router.push('/login') : link === 'Register' ? router.push('/register') : scrollTo(link.toLowerCase())}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#555', cursor: 'pointer', fontWeight: 500, padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >{link}</button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#777' }}>© 2026 DSC Platform. All rights reserved.</p>
            <p style={{ fontSize: 12, color: '#777' }}>Built with precision for Indian CA professionals</p>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .how-it-works-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
        .hover-card {
          background: #fff !important;
          border: 1px solid #f0f0f0 !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-card:hover {
          border-color: #111 !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.06) !important;
          transform: translateY(-2px) !important;
        }
        .pricing-card {
          background: #fff !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .pricing-card:hover {
          box-shadow: 0 16px 40px rgba(0,0,0,0.08) !important;
          transform: translateY(-4px) !important;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
