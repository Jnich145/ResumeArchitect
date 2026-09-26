import type { ResumeDocument } from "./document";

export default function ResumePage({ document }: { document: ResumeDocument }) {
  const { contact, summary, experience, education, skills, additional } =
    document;
  return (
    <article
      className={`resume-page ${document.layout}`}
      aria-label="Resume preview"
    >
      <header className="resume-heading">
        <h2>{contact.name || "Your name"}</h2>
        {contact.title && <p className="resume-title">{contact.title}</p>}
        <div className="contact-lines">
          {[contact.email, contact.phone, contact.location, contact.website]
            .filter(Boolean)
            .map((value, i) => (
              <span key={i}>{value}</span>
            ))}
        </div>
      </header>
      {summary && (
        <section>
          <h3>Profile</h3>
          <p className="preserve-lines">{summary}</p>
        </section>
      )}
      {experience.length > 0 && (
        <section>
          <h3>Experience</h3>
          {experience.map((item, i) => (
            <div className="resume-entry" key={i}>
              <div className="entry-heading">
                <h4>{item.role || "Role"}</h4>
                <span>{item.dates}</span>
              </div>
              <p className="organization">{item.employer}</p>
              {item.details && (
                <ul>
                  {item.details
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
      {education.length > 0 && (
        <section>
          <h3>Education</h3>
          {education.map((item, i) => (
            <div className="resume-entry" key={i}>
              <div className="entry-heading">
                <h4>{item.qualification || "Qualification"}</h4>
                <span>{item.dates}</span>
              </div>
              <p className="organization">{item.institution}</p>
            </div>
          ))}
        </section>
      )}
      {skills.some(Boolean) && (
        <section>
          <h3>Skills</h3>
          <ul className="skill-list">
            {skills.filter(Boolean).map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </section>
      )}
      {additional && (
        <section>
          <h3>Additional information</h3>
          <p className="preserve-lines">{additional}</p>
        </section>
      )}
    </article>
  );
}
