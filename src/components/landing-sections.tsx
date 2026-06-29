import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  FileStack,
  FolderSearch2,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { audiences, features, heroCopy, resources, workflowSteps } from "@/content/landing-copy";
import { applications, pipeline, weeklyMetrics } from "@/content/dashboard-preview-data";
import { Annotation, Container, SectionHeader } from "./ui";
import { DashboardPreview, IPhoneMockup, StatusPill } from "./product-preview";
import { WaitlistForm } from "./waitlist-form";
import { FAQ } from "./faq";

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Container>
        <div className="hero-copy">
          <p className="hero-badge"><Sparkles size={14} />{heroCopy.badge}</p>
          <h1 id="hero-title">{heroCopy.headlineStart}<br />{heroCopy.headlineEnd} <em>{heroCopy.headlineAccent}</em></h1>
          <p>{heroCopy.subheadline}</p>
          <div className="cta-row">
            <a href="#pricing" className="button button-primary">{heroCopy.primaryCta}<ArrowRight size={17} /></a>
            <a href="#product" className="button button-secondary">{heroCopy.secondaryCta}<ArrowDown size={16} /></a>
          </div>
        </div>
      </Container>
      <Container wide><IPhoneMockup /></Container>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className="section" id="problem">
      <Container>
        <SectionHeader title="Apply kerja sering berantakan bukan karena kamu malas." />
        <div className="editorial-copy">
          <p>Kadang lowongan disimpan di LinkedIn, link lain ada di chat, catatan interview ada di notes, dan status apply cuma diingat-ingat. Semakin banyak lamaran, semakin susah tahu mana yang harus di-follow-up, mana yang sudah interview, dan mana yang sebenarnya sudah tidak aktif.</p>
          <p>KareerTrack dibuat untuk merapikan bagian itu: semua lowongan, status, deadline, catatan, dan next action masuk ke satu alur yang <em>jelas.</em></p>
        </div>
        <div className="scattered-visual" aria-label="Contoh proses apply yang tercecer">
          {[
            [Search, "LinkedIn", "3 saved jobs", "source: LinkedIn"],
            [MessageSquareText, "Chat", "Link Tokopedia", "belum dicatat"],
            [BookOpenText, "Notes", "Interview questions", "stage: interview"],
            [CalendarClock, "Ingat-ingat", "Follow-up Jumat?", "deadline: ?"],
          ].map(([Icon, title, body, meta]) => (
            <div className="scatter-card" key={String(title)}>
              <Icon size={18} /><strong>{String(title)}</strong><span>{String(body)}</span><small>{String(meta)}</small>
            </div>
          ))}
          <p className="scatter-caption">Yang hilang bukan motivasi, tapi <em>sistem.</em></p>
        </div>
      </Container>
    </section>
  );
}

export function ProductPreviewSection() {
  return (
    <section className="section" id="product">
      <Container>
        <SectionHeader
          eyebrow="PRODUCT PREVIEW"
          title="Satu workspace untuk semua proses apply."
          body="Setiap lamaran punya tempat, status, deadline, catatan, dan langkah berikutnya. Kamu bisa melihat proses apply dari awal sampai akhir tanpa harus membuka banyak platform sekaligus."
        />
      </Container>
      <Container wide>
        <div className="preview-wrap">
          <div className="preview-label preview-label-left"><Annotation active>status: applied</Annotation></div>
          <div className="preview-label preview-label-right"><Annotation>review: this week</Annotation></div>
          <DashboardPreview />
        </div>
      </Container>
    </section>
  );
}

const workflowIcons = [FolderSearch2, FileStack, Target, CalendarClock, MessageSquareText, BarChart3];

export function HowItWorksSection() {
  return (
    <section className="section" id="workflow">
      <Container>
        <SectionHeader
          eyebrow="HOW IT WORKS"
          title="Dari nemu lowongan sampai offering, alurnya jelas."
          body="KareerTrack mengikuti alur nyata job seeker: menemukan lowongan, menyiapkan dokumen, apply, menunggu respon, interview, follow-up, dan mencatat hasil akhirnya."
        />
        <div className="workflow-grid">
          {workflowSteps.map(([title, description], index) => {
            const Icon = workflowIcons[index];
            return (
              <article className="workflow-card" key={title}>
                <div className="workflow-top"><span>0{index + 1}</span><Icon size={22} /></div>
                <div className="workflow-visual">
                  <span className="mini-step-dot" />
                  <span className="mini-step-line" />
                  <span className="mini-step-pill">{index === 0 ? "saved" : index === 5 ? "weekly review" : title.toLowerCase()}</span>
                </div>
                <h3>{title}</h3><p>{description}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function FeatureVisual({ type }: { type: (typeof features)[number][2] }) {
  if (type === "tracker") return (
    <div className="feature-list">{applications.slice(0, 2).map((item) => <div key={item.id}><span className="company-avatar">{item.company[0]}</span><p><b>{item.company}</b><small>{item.role}</small></p><StatusPill status={item.status} /></div>)}</div>
  );
  if (type === "pipeline") return <div className="feature-pipeline">{pipeline.slice(0, 4).map((item) => <div key={item.label}><span>{item.count}</span><small>{item.label}</small></div>)}</div>;
  if (type === "followup") return <div className="feature-sheet"><b>DUE TODAY</b><p>Shopee <span>Today</span></p><p>Telkom Indonesia <span>Today</span></p></div>;
  if (type === "interview") return <div className="feature-note"><span>HR Interview</span><b>Bank Mandiri</b><p>Prepare STAR answers tonight.</p></div>;
  if (type === "research") return <div className="feature-note"><span>WHY I APPLY</span><p>Interested in product scale and team culture.</p><span>QUESTIONS</span></div>;
  if (type === "documents") return <div className="feature-files">{["CV_Product_v3.pdf", "Portfolio_2026.pdf", "Transcript.pdf"].map((item) => <p key={item}><FileStack size={15} />{item}<Check size={14} /></p>)}</div>;
  if (type === "review") return <div className="feature-metrics">{weeklyMetrics.slice(0, 3).map(([value, label]) => <div key={label}><b>{value}</b><span>{label.split(" ")[0]}</span></div>)}</div>;
  return <div className="feature-bars"><p><span>LinkedIn</span><i style={{ width: "82%" }} /></p><p><span>Referral</span><i style={{ width: "60%" }} /></p><p><span>MagangKareer</span><i style={{ width: "48%" }} /></p></div>;
}

export function FeatureCardsSection() {
  return (
    <section className="section">
      <Container>
        <SectionHeader eyebrow="FEATURES" title="Fitur yang dibuat khusus untuk job seeker." body="KareerTrack tidak dibuat sebagai tracker umum. Setiap fitur mengikuti proses apply kerja yang benar-benar dialami job seeker." />
        <div className="feature-grid">
          {features.map(([title, description, type]) => (
            <article className="feature-card" key={title}>
              <div className="feature-visual"><FeatureVisual type={type} /></div>
              <p className="eyebrow">{type}</p><h3>{title}</h3><p>{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function WhyItWorksSection() {
  const points = [
    ["Progress terlihat", "Apa yang sudah dilakukan tidak lagi hilang dari ingatan."],
    ["Next action jelas", "Setiap lamaran punya langkah berikutnya yang bisa dikerjakan."],
    ["Pola bisa dibaca", "Lihat sumber, respon, dan tahap yang paling sering berhasil."],
    ["Strategi bisa diperbaiki", "Weekly review mengubah aktivitas acak menjadi evaluasi."],
  ];
  return (
    <section className="section">
      <Container>
        <SectionHeader title="Karena cari kerja butuh sistem, bukan cuma motivasi." />
        <div className="editorial-copy"><p>Banyak orang merasa tidak punya progress saat cari kerja, padahal masalahnya bukan selalu karena tidak berusaha. Sering kali, prosesnya tidak terdokumentasi. KareerTrack membantu kamu melihat apa yang sudah dilakukan, apa yang sedang berjalan, dan apa yang perlu diperbaiki.</p></div>
        <div className="why-grid">{points.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </Container>
    </section>
  );
}

export function WhoItIsForSection() {
  return (
    <section className="section">
      <Container>
        <SectionHeader title="Cocok untuk kamu yang sedang apply dari banyak tempat." body="Mau apply 5 tempat atau 50 tempat, KareerTrack membantu kamu tetap tahu posisi setiap lamaran, apa yang perlu disiapkan, dan langkah apa yang harus dilakukan berikutnya." />
        <div className="audience-group">
          {audiences.map(([title, body]) => <div key={title}><span className="audience-icon"><BriefcaseBusiness size={17} /></span><p><b>{title}</b><small>{body}</small></p><ArrowRight size={16} /></div>)}
        </div>
      </Container>
    </section>
  );
}

export function EcosystemSection() {
  return (
    <section className="section">
      <Container>
        <SectionHeader title="MagangKareer bantu kamu menemukan peluang. KareerTrack bantu kamu memantau prosesnya." />
        <div className="ecosystem-flow">
          <article><span className="ecosystem-logo">M</span><p className="eyebrow">DISCOVER</p><h3>MagangKareer</h3><p>Temukan info magang, fresh graduate program, MT, ODP, dan peluang entry-level.</p></article>
          <div className="flow-arrow"><ArrowRight /></div>
          <article><span className="ecosystem-logo blue">K</span><p className="eyebrow">TRACK</p><h3>KareerTrack</h3><p>Simpan lowongan, update status, catat interview, follow-up, dan pantau hasil akhirnya.</p></article>
        </div>
      </Container>
    </section>
  );
}

export function EarlyAccessSection() {
  const benefits = ["Application tracker", "Status pipeline", "Follow-up queue", "Interview notes", "Company research", "Weekly review"];
  return (
    <section className="section" id="pricing">
      <Container>
        <SectionHeader title="Mulai tracking apply kerja kamu lebih awal." body="KareerTrack sedang disiapkan untuk job seeker yang ingin proses apply lebih rapi sejak awal. Masuk early access untuk mendapatkan akses pertama saat platform dibuka." />
        <div className="early-card">
          <div><p className="eyebrow">EARLY ACCESS</p><h3>Dapatkan akses pertama ke KareerTrack.</h3><p>Mulai pantau semua lamaran kerja kamu dalam satu workspace yang rapi.</p></div>
          <ul>{benefits.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <WaitlistForm />
          <small>No spam. Hanya update penting dari KareerTrack dan MagangKareer.</small>
        </div>
      </Container>
    </section>
  );
}

export function FreeResourcesSection() {
  return (
    <section className="section">
      <Container>
        <SectionHeader eyebrow="FREE CAREER RESOURCES" title="Mulai rapikan proses apply dari sekarang." body="Sambil menunggu KareerTrack, kamu bisa mulai merapikan proses apply dengan beberapa resource sederhana dari MagangKareer." />
        <div className="resource-group">
          {resources.map(([title, body], index) => <a href="#pricing" key={title}><span className="resource-number">0{index + 1}</span><p><b>{title}</b><small>{body}</small></p><ArrowRight size={17} /></a>)}
        </div>
      </Container>
    </section>
  );
}

export function FAQSection() {
  return <section className="section" id="faq"><Container><SectionHeader title="FAQ" body="Hal-hal yang perlu kamu tahu sebelum mulai memakai KareerTrack." /><FAQ /></Container></section>;
}

export function FinalCTASection() {
  return (
    <section className="section final-cta">
      <Container>
        <div className="final-cta-inner">
          <p className="eyebrow">KAREERTRACK BY MAGANGKAREER</p>
          <h2>Jangan biarkan proses apply kerja kamu <em>tercecer.</em></h2>
          <p>Mulai catat, pantau, dan evaluasi setiap lamaran kerja dengan KareerTrack. Dari saved sampai offering, semuanya punya tempat dan status yang jelas.</p>
          <div className="cta-row"><a className="button button-primary" href="#pricing">Join Early Access<ArrowRight size={17} /></a><a className="button button-secondary" href="#product">Lihat Demo</a></div>
        </div>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-top">
          <div><div className="brand"><span className="brand-mark">K</span><span>KareerTrack <small>by MagangKareer</small></span></div><p>Dibuat untuk membantu job seeker memantau setiap lamaran sampai ada hasil.</p></div>
          <nav aria-label="Footer navigation"><a href="#">Instagram</a><a href="mailto:hello@magangkareer.com">Contact</a><a href="#">Privacy</a><a href="#">Terms</a><a href="#">MagangKareer</a></nav>
        </div>
        <div className="footer-bottom"><span>© 2026 KareerTrack by MagangKareer. All rights reserved.</span><span className="version">v1.0</span></div>
      </Container>
    </footer>
  );
}
