/** Versioned, text-only interchange format. No HTML, links, or images are executed. */
export const STORAGE_KEY = "resume-architect.document.v1";
export const MAX_FILE_BYTES = 128 * 1024;
export const MAX_ITEMS = 20;
export const TEXT_LIMIT = 200;
export const LONG_TEXT_LIMIT = 4000;

export interface Experience {
  employer: string;
  role: string;
  dates: string;
  details: string;
}

export interface Education {
  institution: string;
  qualification: string;
  dates: string;
}

export interface ResumeDocument {
  schemaVersion: 1;
  layout: "classic" | "modern";
  contact: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  additional: string;
}

export function blankDocument(): ResumeDocument {
  return {
    schemaVersion: 1,
    layout: "classic",
    contact: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    additional: "",
  };
}

export function sampleDocument(): ResumeDocument {
  return {
    ...blankDocument(),
    contact: {
      name: "Alex Morgan",
      title: "Product-minded software developer",
      email: "alex@example.com",
      phone: "",
      location: "Portland, OR",
      website: "portfolio.example.com",
    },
    summary:
      "Developer who turns complex workflows into straightforward tools. Experienced in accessible interfaces, documented APIs, and testing the details that matter to users.",
    experience: [
      {
        employer: "Northstar Studio · fictional",
        role: "Software Developer",
        dates: "2023 – Present",
        details:
          "Built a planning workspace with searchable project records and clear review steps.\nPartnered with designers to make keyboard navigation and small-screen layouts easier to use.\nAdded automated checks for the team’s most important customer workflows.",
      },
    ],
    education: [
      {
        institution: "Example University · fictional",
        qualification: "B.S. Computer Science",
        dates: "2019 – 2023",
      },
    ],
    skills: [
      "TypeScript",
      "React",
      "API design",
      "Accessibility",
      "Automated testing",
    ],
    additional:
      "Community: volunteered at a fictional neighborhood coding workshop.",
  };
}

function record(
  value: unknown,
  keys: string[],
  label: string,
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error(`${label} must be an object.`);
  const actual = Object.keys(value);
  if (
    actual.length !== keys.length ||
    actual.some((key) => !keys.includes(key))
  ) {
    throw new Error(`${label} has missing or unsupported fields.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, maximum = TEXT_LIMIT): string {
  if (
    typeof value !== "string" ||
    value.length > maximum ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  ) {
    throw new Error(
      `${label} must be text of at most ${maximum} characters without control characters.`,
    );
  }
  return value;
}

function items<T>(
  value: unknown,
  label: string,
  convert: (item: unknown) => T,
  maximum = MAX_ITEMS,
): T[] {
  if (!Array.isArray(value) || value.length > maximum)
    throw new Error(`${label} must contain at most ${maximum} items.`);
  return value.map(convert);
}

export function parseDocument(encoded: string): ResumeDocument {
  if (new TextEncoder().encode(encoded).length > MAX_FILE_BYTES)
    throw new Error("Resume file must be 128 KiB or smaller.");
  let input: unknown;
  try {
    input = JSON.parse(encoded);
  } catch {
    throw new Error("Choose a valid ResumeArchitect JSON file.");
  }
  const source = record(
    input,
    [
      "schemaVersion",
      "layout",
      "contact",
      "summary",
      "experience",
      "education",
      "skills",
      "additional",
    ],
    "Resume",
  );
  if (source.schemaVersion !== 1)
    throw new Error("This resume format version is not supported.");
  if (source.layout !== "classic" && source.layout !== "modern")
    throw new Error("Choose a supported resume layout.");
  const contact = record(
    source.contact,
    ["name", "title", "email", "phone", "location", "website"],
    "Contact",
  );
  return {
    schemaVersion: 1,
    layout: source.layout,
    contact: {
      name: text(contact.name, "Name"),
      title: text(contact.title, "Title"),
      email: text(contact.email, "Email"),
      phone: text(contact.phone, "Phone"),
      location: text(contact.location, "Location"),
      website: text(contact.website, "Website"),
    },
    summary: text(source.summary, "Summary", LONG_TEXT_LIMIT),
    experience: items(source.experience, "Experience", (entry) => {
      const item = record(
        entry,
        ["employer", "role", "dates", "details"],
        "Experience item",
      );
      return {
        employer: text(item.employer, "Employer"),
        role: text(item.role, "Role"),
        dates: text(item.dates, "Dates"),
        details: text(item.details, "Details", LONG_TEXT_LIMIT),
      };
    }),
    education: items(source.education, "Education", (entry) => {
      const item = record(
        entry,
        ["institution", "qualification", "dates"],
        "Education item",
      );
      return {
        institution: text(item.institution, "Institution"),
        qualification: text(item.qualification, "Qualification"),
        dates: text(item.dates, "Dates"),
      };
    }),
    skills: items(source.skills, "Skills", (skill) => text(skill, "Skill"), 40),
    additional: text(
      source.additional,
      "Additional information",
      LONG_TEXT_LIMIT,
    ),
  };
}

export function serializeDocument(document: ResumeDocument): string {
  const encoded = JSON.stringify(document, null, 2) + "\n";
  parseDocument(encoded);
  return encoded;
}

export function readSaved(
  storage: Pick<Storage, "getItem">,
): ResumeDocument | null {
  const encoded = storage.getItem(STORAGE_KEY);
  return encoded === null ? null : parseDocument(encoded);
}

export function saveDocument(
  storage: Pick<Storage, "setItem">,
  document: ResumeDocument,
): string {
  const encoded = serializeDocument(document);
  storage.setItem(STORAGE_KEY, encoded);
  return encoded;
}
