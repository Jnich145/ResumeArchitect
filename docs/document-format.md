# Portable document v1

Exports are UTF-8 JSON with `schemaVersion: 1`. The parser rejects unknown or missing fields and unsupported versions rather than dropping data. All values below are plain text; nothing is interpreted as HTML, Markdown, a URL, or a script.

| Field                   | Shape / bound                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `schemaVersion`         | Integer `1`                                                                                       |
| `layout`                | `classic` or `modern`                                                                             |
| `contact`               | Exactly `name`, `title`, `email`, `phone`, `location`, `website`; strings up to 200 characters    |
| `summary`, `additional` | Strings up to 4,000 characters                                                                    |
| `experience`            | Up to 20 objects: `employer`, `role`, `dates` (200 characters each), `details` (4,000 characters) |
| `education`             | Up to 20 objects: `institution`, `qualification`, `dates` (200 characters each)                   |
| `skills`                | Up to 40 strings, 200 characters each                                                             |

The whole encoded document must be at most 128 KiB in UTF-8. Length limits for individual fields follow JavaScript string length (UTF-16 code units). Unsupported control characters are rejected; tabs and newlines are allowed. Highlights use one line per rendered bullet. Dates are deliberately free text to preserve dates the author can substantiate; they are not inferred or normalized.

Saving and export use the same validation as import. A failed import leaves the current and stored drafts untouched. Importing a valid document changes the current tab only; it does not silently persist or upload the file. Load sample, import and clear ask before replacing unsaved work where applicable.

JSON Resume, Word, PDF and the archived prototype’s schema are different formats. No compatibility adapter or automatic migration is supplied. Add versioned migrations with fixtures before changing this contract.
