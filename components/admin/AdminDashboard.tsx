"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Save } from "lucide-react";
import type {
  PortfolioContent,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
  LeadershipItem,
  EducationItem,
  SkillGroup,
  StatusStat
} from "@/lib/types";
import { Field, TextAreaField, StringListField, RemovableCard, AddButton, Card } from "./Fields";

const TABS = [
  "Site & hero",
  "Status stats",
  "About",
  "Stack",
  "Experience",
  "Projects",
  "Certifications",
  "Leadership & education",
  "Contact"
] as const;

type Tab = (typeof TABS)[number];

function emptyId() {
  return Math.random().toString(36).slice(2, 9);
}

export function AdminDashboard({ initialContent }: { initialContent: PortfolioContent }) {
  const router = useRouter();
  const [content, setContent] = useState<PortfolioContent>(initialContent);
  const [tab, setTab] = useState<Tab>("Site & hero");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function update<K extends keyof PortfolioContent>(key: K, value: PortfolioContent[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        setMessage({ type: "ok", text: "Saved. Your live site is updated." });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: data.error ?? "Could not save changes." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-10 border-b border-ink-300 bg-ink-50/90 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-base font-semibold text-ink-950">Content admin</p>
            <p className="font-mono text-xs text-ink-600">edit your live portfolio</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-500 px-3 py-2 text-xs font-mono text-ink-800 hover:border-copper hover:text-copper transition-colors"
            >
              <ExternalLink size={14} /> view site
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-copper px-4 py-2 text-xs font-mono font-medium text-ink-50 hover:bg-copper-light transition-colors disabled:opacity-60"
            >
              <Save size={14} /> {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-500 px-3 py-2 text-xs font-mono text-ink-700 hover:border-[#ef5350]/50 hover:text-[#ef5350] transition-colors"
            >
              <LogOut size={14} /> sign out
            </button>
          </div>
        </div>
        {message && (
          <div
            className={`px-6 py-2 text-xs font-mono ${
              message.type === "ok" ? "bg-copper/10 text-copper" : "bg-[#ef5350]/10 text-[#ef5350]"
            }`}
          >
            {message.text}
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[200px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 text-left rounded-lg px-3 py-2 text-sm font-mono transition-colors ${
                tab === t ? "bg-copper/10 text-copper" : "text-ink-700 hover:bg-ink-200/60"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="space-y-6 pb-24">
          {tab === "Site & hero" && (
            <>
              <Card title="Site info">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="First name" value={content.site.name} onChange={(v) => update("site", { ...content.site, name: v })} />
                  <Field label="Last name" value={content.site.role} onChange={(v) => update("site", { ...content.site, role: v })} />
                  <Field label="Title" value={content.site.title} onChange={(v) => update("site", { ...content.site, title: v })} />
                  <Field label="Location" value={content.site.location} onChange={(v) => update("site", { ...content.site, location: v })} />
                  <Field label="Email" value={content.site.email} onChange={(v) => update("site", { ...content.site, email: v })} />
                  <Field label="Phone" value={content.site.phone} onChange={(v) => update("site", { ...content.site, phone: v })} />
                  <Field label="Availability line" value={content.site.availability} onChange={(v) => update("site", { ...content.site, availability: v })} />
                  <Field label="Resume URL" value={content.site.resumeUrl} onChange={(v) => update("site", { ...content.site, resumeUrl: v })} />
                </div>
              </Card>
              <Card title="Links">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="GitHub" value={content.site.links.github} onChange={(v) => update("site", { ...content.site, links: { ...content.site.links, github: v } })} />
                  <Field label="LinkedIn" value={content.site.links.linkedin} onChange={(v) => update("site", { ...content.site, links: { ...content.site.links, linkedin: v } })} />
                  <Field label="Portfolio" value={content.site.links.portfolio} onChange={(v) => update("site", { ...content.site, links: { ...content.site.links, portfolio: v } })} />
                  <Field label="Play Store" value={content.site.links.playstore} onChange={(v) => update("site", { ...content.site, links: { ...content.site.links, playstore: v } })} />
                </div>
              </Card>
              <Card title="Hero">
                <Field label="Eyebrow" value={content.hero.eyebrow} onChange={(v) => update("hero", { ...content.hero, eyebrow: v })} />
                <StringListField label="Rotating roles" items={content.hero.roles} onChange={(v) => update("hero", { ...content.hero, roles: v })} />
                <TextAreaField label="Headline" value={content.hero.headline} onChange={(v) => update("hero", { ...content.hero, headline: v })} rows={2} />
                <TextAreaField label="Subheadline" value={content.hero.subheadline} onChange={(v) => update("hero", { ...content.hero, subheadline: v })} rows={3} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Primary CTA label" value={content.hero.primaryCta.label} onChange={(v) => update("hero", { ...content.hero, primaryCta: { ...content.hero.primaryCta, label: v } })} />
                  <Field label="Primary CTA link" value={content.hero.primaryCta.href} onChange={(v) => update("hero", { ...content.hero, primaryCta: { ...content.hero.primaryCta, href: v } })} />
                  <Field label="Secondary CTA label" value={content.hero.secondaryCta.label} onChange={(v) => update("hero", { ...content.hero, secondaryCta: { ...content.hero.secondaryCta, label: v } })} />
                  <Field label="Secondary CTA link" value={content.hero.secondaryCta.href} onChange={(v) => update("hero", { ...content.hero, secondaryCta: { ...content.hero.secondaryCta, href: v } })} />
                </div>
              </Card>
            </>
          )}

          {tab === "Status stats" && (
            <Card title="Status bar stats (shown in the hero terminal)">
              <Field label="Panel label" value={content.status.label} onChange={(v) => update("status", { ...content.status, label: v })} />
              <div className="space-y-4">
                {content.status.stats.map((stat, i) => (
                  <RemovableCard
                    key={stat.id}
                    title={stat.value || "New stat"}
                    onRemove={() =>
                      update("status", {
                        ...content.status,
                        stats: content.status.stats.filter((_, idx) => idx !== i)
                      })
                    }
                  >
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Field
                        label="Value"
                        value={stat.value}
                        onChange={(v) => {
                          const next: StatusStat[] = [...content.status.stats];
                          next[i] = { ...next[i], value: v };
                          update("status", { ...content.status, stats: next });
                        }}
                      />
                      <Field
                        label="Label"
                        value={stat.label}
                        onChange={(v) => {
                          const next = [...content.status.stats];
                          next[i] = { ...next[i], label: v };
                          update("status", { ...content.status, stats: next });
                        }}
                      />
                      <Field
                        label="Detail"
                        value={stat.detail}
                        onChange={(v) => {
                          const next = [...content.status.stats];
                          next[i] = { ...next[i], detail: v };
                          update("status", { ...content.status, stats: next });
                        }}
                      />
                    </div>
                  </RemovableCard>
                ))}
              </div>
              <AddButton
                label="Add stat"
                onClick={() =>
                  update("status", {
                    ...content.status,
                    stats: [...content.status.stats, { id: emptyId(), value: "", label: "", detail: "" }]
                  })
                }
              />
            </Card>
          )}

          {tab === "About" && (
            <Card title="About">
              <Field label="Heading" value={content.about.heading} onChange={(v) => update("about", { ...content.about, heading: v })} />
              <StringListField
                label="Paragraphs"
                items={content.about.paragraphs}
                onChange={(v) => update("about", { ...content.about, paragraphs: v })}
              />
              <StringListField
                label="Focus areas"
                items={content.about.focusAreas}
                onChange={(v) => update("about", { ...content.about, focusAreas: v })}
              />
            </Card>
          )}

          {tab === "Stack" && (
            <Card title="Skill groups">
              <Field label="Heading" value={content.skills.heading} onChange={(v) => update("skills", { ...content.skills, heading: v })} />
              <div className="space-y-4">
                {content.skills.groups.map((group, i) => (
                  <RemovableCard
                    key={i}
                    title={group.name || "New group"}
                    onRemove={() =>
                      update("skills", {
                        ...content.skills,
                        groups: content.skills.groups.filter((_, idx) => idx !== i)
                      })
                    }
                  >
                    <Field
                      label="Group name"
                      value={group.name}
                      onChange={(v) => {
                        const next: SkillGroup[] = [...content.skills.groups];
                        next[i] = { ...next[i], name: v };
                        update("skills", { ...content.skills, groups: next });
                      }}
                    />
                    <StringListField
                      label="Skills"
                      items={group.items}
                      onChange={(v) => {
                        const next = [...content.skills.groups];
                        next[i] = { ...next[i], items: v };
                        update("skills", { ...content.skills, groups: next });
                      }}
                    />
                  </RemovableCard>
                ))}
              </div>
              <AddButton
                label="Add group"
                onClick={() =>
                  update("skills", {
                    ...content.skills,
                    groups: [...content.skills.groups, { name: "", items: [] }]
                  })
                }
              />
            </Card>
          )}

          {tab === "Experience" && (
            <Card title="Experience">
              <div className="space-y-4">
                {content.experience.items.map((item, i) => (
                  <RemovableCard
                    key={item.id}
                    title={item.role || "New role"}
                    onRemove={() =>
                      update("experience", {
                        ...content.experience,
                        items: content.experience.items.filter((_, idx) => idx !== i)
                      })
                    }
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Role" value={item.role} onChange={(v) => {
                        const next: ExperienceItem[] = [...content.experience.items];
                        next[i] = { ...next[i], role: v };
                        update("experience", { ...content.experience, items: next });
                      }} />
                      <Field label="Company" value={item.company} onChange={(v) => {
                        const next = [...content.experience.items];
                        next[i] = { ...next[i], company: v };
                        update("experience", { ...content.experience, items: next });
                      }} />
                      <Field label="Location" value={item.location} onChange={(v) => {
                        const next = [...content.experience.items];
                        next[i] = { ...next[i], location: v };
                        update("experience", { ...content.experience, items: next });
                      }} />
                      <Field label="Period" value={item.period} onChange={(v) => {
                        const next = [...content.experience.items];
                        next[i] = { ...next[i], period: v };
                        update("experience", { ...content.experience, items: next });
                      }} />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-mono text-ink-700">
                      <input
                        type="checkbox"
                        checked={item.current}
                        onChange={(e) => {
                          const next = [...content.experience.items];
                          next[i] = { ...next[i], current: e.target.checked };
                          update("experience", { ...content.experience, items: next });
                        }}
                        className="accent-copper"
                      />
                      Currently active (highlights the timeline dot)
                    </label>
                    <StringListField
                      label="Bullet points"
                      items={item.points}
                      onChange={(v) => {
                        const next = [...content.experience.items];
                        next[i] = { ...next[i], points: v };
                        update("experience", { ...content.experience, items: next });
                      }}
                    />
                  </RemovableCard>
                ))}
              </div>
              <AddButton
                label="Add role"
                onClick={() =>
                  update("experience", {
                    ...content.experience,
                    items: [
                      ...content.experience.items,
                      { id: emptyId(), role: "", company: "", location: "", period: "", current: false, points: [] }
                    ]
                  })
                }
              />
            </Card>
          )}

          {tab === "Projects" && (
            <Card title="Projects">
              <div className="space-y-4">
                {content.projects.items.map((item, i) => (
                  <RemovableCard
                    key={item.id}
                    title={item.name || "New project"}
                    onRemove={() =>
                      update("projects", {
                        ...content.projects,
                        items: content.projects.items.filter((_, idx) => idx !== i)
                      })
                    }
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Name" value={item.name} onChange={(v) => {
                        const next: ProjectItem[] = [...content.projects.items];
                        next[i] = { ...next[i], name: v };
                        update("projects", { ...content.projects, items: next });
                      }} />
                      <Field label="Tag" value={item.tag} onChange={(v) => {
                        const next = [...content.projects.items];
                        next[i] = { ...next[i], tag: v };
                        update("projects", { ...content.projects, items: next });
                      }} />
                    </div>
                    <TextAreaField label="Description" value={item.description} rows={2} onChange={(v) => {
                      const next = [...content.projects.items];
                      next[i] = { ...next[i], description: v };
                      update("projects", { ...content.projects, items: next });
                    }} />
                    <Field label="Link (optional)" value={item.link} onChange={(v) => {
                      const next = [...content.projects.items];
                      next[i] = { ...next[i], link: v };
                      update("projects", { ...content.projects, items: next });
                    }} />
                    <StringListField label="Stack" items={item.stack} onChange={(v) => {
                      const next = [...content.projects.items];
                      next[i] = { ...next[i], stack: v };
                      update("projects", { ...content.projects, items: next });
                    }} />
                    <StringListField label="Highlights" items={item.highlights} onChange={(v) => {
                      const next = [...content.projects.items];
                      next[i] = { ...next[i], highlights: v };
                      update("projects", { ...content.projects, items: next });
                    }} />
                  </RemovableCard>
                ))}
              </div>
              <AddButton
                label="Add project"
                onClick={() =>
                  update("projects", {
                    ...content.projects,
                    items: [
                      ...content.projects.items,
                      { id: emptyId(), name: "", tag: "", description: "", stack: [], highlights: [], link: "" }
                    ]
                  })
                }
              />
            </Card>
          )}

          {tab === "Certifications" && (
            <Card title="Certifications">
              <div className="space-y-4">
                {content.certifications.items.map((item, i) => (
                  <RemovableCard
                    key={i}
                    title={item.name || "New certification"}
                    onRemove={() =>
                      update("certifications", {
                        ...content.certifications,
                        items: content.certifications.items.filter((_, idx) => idx !== i)
                      })
                    }
                  >
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Field label="Name" value={item.name} onChange={(v) => {
                        const next: CertificationItem[] = [...content.certifications.items];
                        next[i] = { ...next[i], name: v };
                        update("certifications", { ...content.certifications, items: next });
                      }} />
                      <Field label="Issuer" value={item.issuer} onChange={(v) => {
                        const next = [...content.certifications.items];
                        next[i] = { ...next[i], issuer: v };
                        update("certifications", { ...content.certifications, items: next });
                      }} />
                      <Field label="Year" value={item.year} onChange={(v) => {
                        const next = [...content.certifications.items];
                        next[i] = { ...next[i], year: v };
                        update("certifications", { ...content.certifications, items: next });
                      }} />
                    </div>
                  </RemovableCard>
                ))}
              </div>
              <AddButton
                label="Add certification"
                onClick={() =>
                  update("certifications", {
                    ...content.certifications,
                    items: [...content.certifications.items, { name: "", issuer: "", year: "" }]
                  })
                }
              />
            </Card>
          )}

          {tab === "Leadership & education" && (
            <>
              <Card title="Leadership">
                <div className="space-y-4">
                  {content.leadership.items.map((item, i) => (
                    <RemovableCard
                      key={i}
                      title={item.role || "New role"}
                      onRemove={() =>
                        update("leadership", {
                          ...content.leadership,
                          items: content.leadership.items.filter((_, idx) => idx !== i)
                        })
                      }
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Role" value={item.role} onChange={(v) => {
                          const next: LeadershipItem[] = [...content.leadership.items];
                          next[i] = { ...next[i], role: v };
                          update("leadership", { ...content.leadership, items: next });
                        }} />
                        <Field label="Organization" value={item.org} onChange={(v) => {
                          const next = [...content.leadership.items];
                          next[i] = { ...next[i], org: v };
                          update("leadership", { ...content.leadership, items: next });
                        }} />
                      </div>
                      <Field label="Period" value={item.period} onChange={(v) => {
                        const next = [...content.leadership.items];
                        next[i] = { ...next[i], period: v };
                        update("leadership", { ...content.leadership, items: next });
                      }} />
                      <StringListField label="Points" items={item.points} onChange={(v) => {
                        const next = [...content.leadership.items];
                        next[i] = { ...next[i], points: v };
                        update("leadership", { ...content.leadership, items: next });
                      }} />
                    </RemovableCard>
                  ))}
                </div>
                <AddButton
                  label="Add leadership role"
                  onClick={() =>
                    update("leadership", {
                      ...content.leadership,
                      items: [...content.leadership.items, { role: "", org: "", period: "", points: [] }]
                    })
                  }
                />
              </Card>

              <Card title="Education">
                <div className="space-y-4">
                  {content.education.items.map((item, i) => (
                    <RemovableCard
                      key={i}
                      title={item.degree || "New degree"}
                      onRemove={() =>
                        update("education", {
                          ...content.education,
                          items: content.education.items.filter((_, idx) => idx !== i)
                        })
                      }
                    >
                      <Field label="Degree" value={item.degree} onChange={(v) => {
                        const next: EducationItem[] = [...content.education.items];
                        next[i] = { ...next[i], degree: v };
                        update("education", { ...content.education, items: next });
                      }} />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="School" value={item.school} onChange={(v) => {
                          const next = [...content.education.items];
                          next[i] = { ...next[i], school: v };
                          update("education", { ...content.education, items: next });
                        }} />
                        <Field label="Period" value={item.period} onChange={(v) => {
                          const next = [...content.education.items];
                          next[i] = { ...next[i], period: v };
                          update("education", { ...content.education, items: next });
                        }} />
                      </div>
                    </RemovableCard>
                  ))}
                </div>
                <AddButton
                  label="Add education"
                  onClick={() =>
                    update("education", {
                      ...content.education,
                      items: [...content.education.items, { degree: "", school: "", period: "" }]
                    })
                  }
                />
              </Card>
            </>
          )}

          {tab === "Contact" && (
            <Card title="Contact">
              <Field label="Heading" value={content.contact.heading} onChange={(v) => update("contact", { ...content.contact, heading: v })} />
              <TextAreaField label="Message" value={content.contact.message} rows={3} onChange={(v) => update("contact", { ...content.contact, message: v })} />
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Email" value={content.contact.email} onChange={(v) => update("contact", { ...content.contact, email: v })} />
                <Field label="Phone" value={content.contact.phone} onChange={(v) => update("contact", { ...content.contact, phone: v })} />
                <Field label="Location" value={content.contact.location} onChange={(v) => update("contact", { ...content.contact, location: v })} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
