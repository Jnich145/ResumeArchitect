import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  blankDocument,
  sampleDocument,
  parseDocument,
  serializeDocument,
  saveDocument,
  STORAGE_KEY,
  MAX_FILE_BYTES,
  MAX_ITEMS,
  TEXT_LIMIT,
  LONG_TEXT_LIMIT,
} from "./document";
import type { ResumeDocument } from "./document";
import ResumePage from "./ResumePage";

function initialState() {
  let snapshot: string | null = null;
  try {
    snapshot = window.localStorage.getItem(STORAGE_KEY);
    const saved = snapshot === null ? null : parseDocument(snapshot);
    return {
      snapshot,
      document: saved ?? sampleDocument(),
      message: saved
        ? "Saved draft restored from this browser."
        : "Fictional sample loaded. Nothing is saved yet.",
      error: "",
    };
  } catch {
    return {
      snapshot,
      document: sampleDocument(),
      message: "Fictional sample loaded.",
      error:
        "Your saved draft could not be read. It has not been overwritten. You can export this draft or clear local data.",
    };
  }
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint = "",
  maximum = TEXT_LIMIT,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
  maximum?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={maximum}
          rows={4}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type="text"
          value={value}
          maxLength={maximum}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export default function App() {
  const [initial] = useState(initialState);
  const [document, setDocument] = useState<ResumeDocument>(initial.document);
  const [message, setMessage] = useState(initial.message);
  const [error, setError] = useState(initial.error);
  const [edited, setEdited] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const draftVersion = useRef(0);
  const importSequence = useRef(0);
  const observedSaved = useRef(initial.snapshot);

  useEffect(() => {
    const changedElsewhere = (event: StorageEvent) => {
      if (
        (event.key === STORAGE_KEY || event.key === null) &&
        event.newValue !== observedSaved.current
      ) {
        setEdited(true);
        setMessage(
          "The saved draft changed in another tab. Your current draft is unchanged; saving will ask before replacing that copy.",
        );
      }
    };
    window.addEventListener("storage", changedElsewhere);
    return () => window.removeEventListener("storage", changedElsewhere);
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (edited) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [edited]);

  const change = (update: Partial<ResumeDocument>) => {
    draftVersion.current += 1;
    setDocument((previous) => ({ ...previous, ...update }));
    setEdited(true);
    setError("");
    setMessage("Unsaved changes. Save here or download a JSON copy.");
  };

  const replaceAllowed = () =>
    !edited ||
    window.confirm(
      "Replace the unsaved changes in this tab? Download a JSON copy first if you want to keep them.",
    );
  const save = () => {
    try {
      const latest = window.localStorage.getItem(STORAGE_KEY);
      if (
        latest !== observedSaved.current &&
        !window.confirm(
          "Another tab changed the saved draft. Replace that saved copy with the draft in this tab?",
        )
      ) {
        setMessage(
          "Save canceled. The other tab’s saved draft is unchanged. Download JSON to keep this version.",
        );
        return;
      }
      observedSaved.current = saveDocument(window.localStorage, document);
      setEdited(false);
      setError("");
      setMessage("Saved on this browser. This is not an encrypted backup.");
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message.includes("must")
          ? cause.message
          : "Could not save in this browser. Storage may be blocked or full. Download a JSON copy to keep your work.",
      );
    }
  };

  const download = () => {
    try {
      const content = serializeDocument(document);
      const url = URL.createObjectURL(
        new Blob([content], { type: "application/json" }),
      );
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = "resume-architect.json";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError("");
      setMessage("JSON copy downloaded. Keep exported files private.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not export this draft.",
      );
    }
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const version = draftVersion.current;
    const sequence = ++importSequence.current;
    try {
      if (file.size > MAX_FILE_BYTES)
        throw new Error("Resume file must be 128 KiB or smaller.");
      const next = parseDocument(await file.text());
      if (sequence !== importSequence.current) return;
      if (version !== draftVersion.current)
        throw new Error(
          "Your draft changed while the file was loading. Import again when you are ready to replace it.",
        );
      if (!replaceAllowed()) return;
      draftVersion.current += 1;
      setDocument(next);
      setEdited(true);
      setError("");
      setMessage(
        "JSON imported into this tab. Save here to replace the saved draft.",
      );
    } catch (cause) {
      if (sequence === importSequence.current)
        setError(
          cause instanceof Error ? cause.message : "Could not read this file.",
        );
    }
  };

  const clear = () => {
    if (
      !window.confirm(
        "Delete this app’s saved resume and clear the current draft? Downloaded files and browser backups are not removed.",
      )
    )
      return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      observedSaved.current = null;
      draftVersion.current += 1;
      setDocument(blankDocument());
      setEdited(false);
      setError("");
      setMessage("Local resume deleted. You are working with a blank draft.");
    } catch {
      setError(
        "Browser storage could not be cleared. Your current draft has been kept. Use your browser’s site-data controls.",
      );
    }
  };

  return (
    <>
      <a className="skip-link" href="#editor">
        Skip to resume editor
      </a>
      <header className="app-header no-print">
        <a className="brand" href="./" aria-label="ResumeArchitect home">
          <span className="brand-mark" aria-hidden="true">
            R<span>\</span>
          </span>
          ResumeArchitect
        </a>
        <span className="local-badge">
          <span aria-hidden="true">●</span> Local workspace
        </span>
      </header>
      <main>
        <section className="intro no-print">
          <div>
            <p className="eyebrow">YOUR EXPERIENCE, CLEARLY TOLD</p>
            <h1>
              Make your next <br />
              <em>chapter count.</em>
            </h1>
            <p className="intro-copy">
              A focused space to shape your resume. Edit the details, see the
              result, and take your work with you.
            </p>
          </div>
          <aside className="privacy-card">
            <span className="privacy-symbol" aria-hidden="true">
              ↳
            </span>
            <strong>Your draft stays in your browser.</strong>
            <p>
              No account, AI service, or upload. Saving is your choice. The
              starter profile is entirely fictional.
            </p>
            <a href="#privacy">
              How your data is handled <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </section>

        <section
          className="workspace-toolbar no-print"
          aria-label="Draft actions"
        >
          <div className="toolbar-primary">
            <button className="primary" onClick={save}>
              Save on this browser
            </button>
            <button onClick={download}>Download JSON</button>
            <button onClick={() => fileInput.current?.click()}>
              Import JSON
            </button>
          </div>
          <div className="toolbar-secondary">
            <button onClick={() => window.print()}>
              Print / Save PDF <span aria-hidden="true">↗</span>
            </button>
            <button className="quiet danger" onClick={clear}>
              Clear local data
            </button>
          </div>
          <input
            className="visually-hidden"
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            aria-label="Import resume file"
            onChange={(event) => {
              void importFile(event);
            }}
          />
        </section>
        <div className="status-line no-print">
          <span
            className={edited ? "status-dot unsaved" : "status-dot"}
            aria-hidden="true"
          />
          <p role="status">{message}</p>
        </div>
        {error && (
          <p className="error no-print" role="alert">
            {error}
          </p>
        )}

        <div className="workspace">
          <section
            className="editor-panel no-print"
            id="editor"
            aria-label="Resume editor"
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">01 / THE DETAILS</p>
                <h2>Tell your story</h2>
              </div>
              <button
                className="quiet"
                onClick={() => {
                  if (replaceAllowed()) {
                    draftVersion.current += 1;
                    setDocument(sampleDocument());
                    setEdited(true);
                    setError("");
                    setMessage(
                      "Fictional sample loaded. Save here to replace the saved draft.",
                    );
                  }
                }}
              >
                Load sample
              </button>
            </div>
            <div className="form-section">
              <h3>Personal details</h3>
              <Field
                label="Full name"
                value={document.contact.name}
                onChange={(name) =>
                  change({ contact: { ...document.contact, name } })
                }
              />
              <Field
                label="Professional title"
                value={document.contact.title}
                onChange={(title) =>
                  change({ contact: { ...document.contact, title } })
                }
              />
              <div className="field-pair">
                <Field
                  label="Email"
                  value={document.contact.email}
                  onChange={(email) =>
                    change({ contact: { ...document.contact, email } })
                  }
                />
                <Field
                  label="Phone (optional)"
                  value={document.contact.phone}
                  onChange={(phone) =>
                    change({ contact: { ...document.contact, phone } })
                  }
                />
              </div>
              <div className="field-pair">
                <Field
                  label="Location"
                  value={document.contact.location}
                  onChange={(location) =>
                    change({ contact: { ...document.contact, location } })
                  }
                />
                <Field
                  label="Website (plain text)"
                  value={document.contact.website}
                  onChange={(website) =>
                    change({ contact: { ...document.contact, website } })
                  }
                />
              </div>
            </div>
            <div className="form-section">
              <h3>Profile</h3>
              <Field
                label="Professional summary"
                value={document.summary}
                multiline
                maximum={LONG_TEXT_LIMIT}
                hint="A few specific sentences about your experience and the work you want to do."
                onChange={(summary) => change({ summary })}
              />
            </div>
            <div className="form-section">
              <h3>Experience</h3>
              {document.experience.map((item, i) => (
                <fieldset key={i}>
                  <legend>Experience {i + 1}</legend>
                  <Field
                    label={`Role ${i + 1}`}
                    value={item.role}
                    onChange={(role) =>
                      change({
                        experience: document.experience.map((entry, j) =>
                          j === i ? { ...entry, role } : entry,
                        ),
                      })
                    }
                  />
                  <Field
                    label={`Employer ${i + 1}`}
                    value={item.employer}
                    onChange={(employer) =>
                      change({
                        experience: document.experience.map((entry, j) =>
                          j === i ? { ...entry, employer } : entry,
                        ),
                      })
                    }
                  />
                  <Field
                    label={`Dates ${i + 1}`}
                    value={item.dates}
                    hint="For example, 2023 – Present"
                    onChange={(dates) =>
                      change({
                        experience: document.experience.map((entry, j) =>
                          j === i ? { ...entry, dates } : entry,
                        ),
                      })
                    }
                  />
                  <Field
                    label={`Highlights ${i + 1}`}
                    value={item.details}
                    multiline
                    maximum={LONG_TEXT_LIMIT}
                    hint="One contribution per line. Use only claims you can support."
                    onChange={(details) =>
                      change({
                        experience: document.experience.map((entry, j) =>
                          j === i ? { ...entry, details } : entry,
                        ),
                      })
                    }
                  />
                  <button
                    className="quiet danger"
                    onClick={() =>
                      change({
                        experience: document.experience.filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                  >
                    Remove experience {i + 1}
                  </button>
                </fieldset>
              ))}
              <button
                className="add-button"
                disabled={document.experience.length >= MAX_ITEMS}
                onClick={() =>
                  change({
                    experience: [
                      ...document.experience,
                      { employer: "", role: "", dates: "", details: "" },
                    ],
                  })
                }
              >
                + Add experience
              </button>
            </div>
            <div className="form-section">
              <h3>Education</h3>
              {document.education.map((item, i) => (
                <fieldset key={i}>
                  <legend>Education {i + 1}</legend>
                  <Field
                    label={`Institution ${i + 1}`}
                    value={item.institution}
                    onChange={(institution) =>
                      change({
                        education: document.education.map((entry, j) =>
                          j === i ? { ...entry, institution } : entry,
                        ),
                      })
                    }
                  />
                  <Field
                    label={`Qualification ${i + 1}`}
                    value={item.qualification}
                    onChange={(qualification) =>
                      change({
                        education: document.education.map((entry, j) =>
                          j === i ? { ...entry, qualification } : entry,
                        ),
                      })
                    }
                  />
                  <Field
                    label={`Education dates ${i + 1}`}
                    value={item.dates}
                    onChange={(dates) =>
                      change({
                        education: document.education.map((entry, j) =>
                          j === i ? { ...entry, dates } : entry,
                        ),
                      })
                    }
                  />
                  <button
                    className="quiet danger"
                    onClick={() =>
                      change({
                        education: document.education.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Remove education {i + 1}
                  </button>
                </fieldset>
              ))}
              <button
                className="add-button"
                disabled={document.education.length >= MAX_ITEMS}
                onClick={() =>
                  change({
                    education: [
                      ...document.education,
                      { institution: "", qualification: "", dates: "" },
                    ],
                  })
                }
              >
                + Add education
              </button>
            </div>
            <div className="form-section">
              <h3>Skills & more</h3>
              <Field
                label="Skills"
                value={document.skills.join("\n")}
                multiline
                maximum={8040}
                hint="One skill per line. Up to 40 skills, 200 characters each."
                onChange={(skills) => change({ skills: skills.split("\n") })}
              />
              <Field
                label="Additional information"
                value={document.additional}
                multiline
                maximum={LONG_TEXT_LIMIT}
                hint="Optional certifications, projects, languages, or community involvement."
                onChange={(additional) => change({ additional })}
              />
            </div>
          </section>
          <section className="preview-panel" aria-label="Preview and layout">
            <div className="panel-heading no-print">
              <div>
                <p className="eyebrow">02 / THE BIG PICTURE</p>
                <h2>Your resume, in focus</h2>
              </div>
              <label className="layout-select">
                Layout
                <select
                  aria-label="Layout"
                  value={document.layout}
                  onChange={(event) =>
                    change({
                      layout: event.target.value as ResumeDocument["layout"],
                    })
                  }
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                </select>
              </label>
            </div>
            <div className="preview-surface">
              <ResumePage document={document} />
            </div>
            <p className="preview-note no-print">
              Print uses selectable text. Choose “Save as PDF” in your browser’s
              print dialog; review the page breaks and turn off browser headers
              and footers.
            </p>
          </section>
        </div>

        <section className="privacy-section no-print" id="privacy">
          <div>
            <p className="eyebrow">A LITTLE CLARITY</p>
            <h2>You control the copy.</h2>
          </div>
          <div>
            <p>
              Edits stay in this tab until you choose{" "}
              <strong>Save on this browser</strong>. That saves one unencrypted
              draft in local storage for this site and browser profile. Anyone
              using that profile may be able to read it. Private browsing and
              browser cleanup can remove it.
            </p>
            <p>
              <strong>Clear local data</strong> removes this app’s saved draft
              and current contents. Downloads, printed PDFs, browser backups,
              and copies you share remain yours to manage. Import accepts this
              app’s text-only JSON format, not Word, PDF, or the older
              prototype’s files.
            </p>
            <p>
              This editor sends no resume data, loads no remote fonts, and uses
              no analytics. A site host still receives ordinary page requests.
              It does not evaluate ATS compatibility or predict hiring outcomes.
            </p>
          </div>
        </section>
      </main>
      <footer className="app-footer no-print">
        <span>ResumeArchitect</span>
        <p>A focused tool by Justin Nichols · SOFTech</p>
        <a href="https://github.com/Jnich145/ResumeArchitect" rel="noreferrer">
          Source & project notes ↗
        </a>
      </footer>
    </>
  );
}
