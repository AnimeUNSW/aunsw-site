# Content editing guide

Most routine site updates happen in `src/data/`. This guide is the authoritative
editorial contract for those files. TypeScript interfaces remain the code-level
contract.

## Safe editing workflow

1. Edit the smallest relevant JSON file.
2. Preserve valid JSON: double quotes, no comments, and no trailing commas.
3. Give every record a stable, unique `id`.
4. Add any new public image under `public/` and use a root-relative path.
5. Run `npm run typecheck`, `npm test`, and `npm run build`.
6. Open the affected page and inspect mobile/desktop, light/dark, links, dates,
   image crops, and alternative text.

Content is compiled into the application. Publishing a JSON change requires a
new production build and deployment.

## General conventions

- IDs and slugs use lowercase kebab-case, for example
  `evt-anisyd-artmart-2026`.
- Dates use ISO 8601 with an explicit Sydney offset when the date is fixed, for
  example `2026-05-16T10:00:00+10:00`.
- URLs should be HTTPS unless the destination only supports another scheme.
- Empty optional fields should normally be omitted rather than set to an empty
  string.
- User-facing text may use punctuation and Unicode normally.
- Alternative text describes the useful visual content, not the filename.
- Array order matters for FAQs and sponsors. Team order is controlled by
  `displayOrder`; events are sorted at runtime.

Sydney changes between UTC+10 and UTC+11. Use the offset in effect on the event
date, not necessarily today's offset.

## Images

For JSON-managed content, place images in a descriptive subdirectory of
`public/`:

```text
public/
├── events/
├── sponsors/
└── team/portraits/
```

Reference them from JSON as browser-root paths:

```json
{
  "image": "/events/example.webp",
  "imageAlt": "Attendees playing a trivia game at an AnimeUNSW event"
}
```

Do not use filesystem-relative JSON paths such as
`../src/assets/event-pics/example.png`. Vite cannot fingerprint or rewrite a
string stored in JSON. Component-owned artwork under `src/assets/` should be
imported directly from TS/TSX instead.

Prefer WebP for photographs when quality is acceptable, SVG for logos that are
already vector artwork, and PNG when transparency or source constraints require
it. Avoid committing multiple unused versions of the same portrait.

## `src/data/events.json`

This file is an object with an `events` array. It also currently contains a
`categoryOptions` array for editorial reference; runtime validation and filter
UI use code-defined category lists, so changing `categoryOptions` alone does
not add a category.

### Event fields

| Field                | Required         | Type and allowed values | Meaning                                                                       |
| -------------------- | ---------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `id`                 | Yes              | string                  | Stable internal key                                                           |
| `slug`               | Yes              | string                  | URL-friendly identifier; individual event routes do not currently exist       |
| `title`              | Yes              | string                  | Card heading                                                                  |
| `description`        | Yes              | string                  | Event summary                                                                 |
| `category`           | Yes              | non-empty array         | One or more of `weekly`, `collab`, `anisyd`, `cosplay`, `competition`, `past` |
| `startDateTime`      | Fixed events     | ISO date-time string    | Fixed start time                                                              |
| `endDateTime`        | Fixed events     | ISO date-time string    | Fixed end time and source of past-event status                                |
| `recurringStartTime` | Recurring events | `weekday HH:mm`         | Local weekly start, for example `thursday 13:00`                              |
| `recurringEndTime`   | Recurring events | `weekday HH:mm`         | Local weekly end                                                              |
| `location`           | Yes              | string                  | Venue shown on the card                                                       |
| `image`              | No               | string URL              | Event image                                                                   |
| `imageAlt`           | No               | string                  | Useful description; the component generates a generic fallback if absent      |
| `featured`           | Yes              | boolean                 | Places the event in the featured group and home-page selection                |
| `registerLink`       | No               | string URL              | External registration destination                                             |

An event must have exactly one schedule form:

- both `startDateTime` and `endDateTime`; or
- both `recurringStartTime` and `recurringEndTime`.

Do not mix fixed and recurring fields. The validator rejects partial pairs and
mixed schedules.

### Event behavior

- Fixed events become past when their end time is earlier than the visitor's
  current time.
- The UI automatically adds a `Past Events` badge to past events even if the
  JSON category does not include `past`.
- Registration is disabled for past events and for events without a
  `registerLink`.
- Recurring events are hydrated to their next local occurrence at application
  module load and receive the `Weekly` presentation from their category.
- The home page takes up to three records whose `featured` value is `true`,
  after repository sorting.

Example fixed event:

```json
{
  "id": "evt-example-2026",
  "slug": "example-2026",
  "title": "Example Night",
  "description": "A concise explanation of the event.",
  "category": ["competition"],
  "startDateTime": "2026-08-14T18:00:00+10:00",
  "endDateTime": "2026-08-14T20:00:00+10:00",
  "location": "UNSW Room",
  "image": "/events/example-2026.webp",
  "imageAlt": "Promotional artwork for Example Night",
  "featured": false,
  "registerLink": "https://example.com/register"
}
```

Example recurring event:

```json
{
  "id": "evt-weekly-example",
  "slug": "weekly-example",
  "title": "Weekly Example",
  "description": "A weekly social activity.",
  "category": ["weekly"],
  "recurringStartTime": "thursday 13:00",
  "recurringEndTime": "thursday 15:00",
  "location": "UNSW Room",
  "featured": true
}
```

Adding a new category requires coordinated code changes to `EventCategory`,
`EVENT_CATEGORIES`, event-card metadata, event tabs, tests, and this document.

## `src/data/sponsors.json`

This file is an array of sponsor records.

| Field                 | Required | Type            | Meaning                                       |
| --------------------- | -------- | --------------- | --------------------------------------------- |
| `id`                  | Yes      | string          | Stable internal key                           |
| `name`                | Yes      | string          | Sponsor's public name                         |
| `logoText`            | Yes      | string          | Short textual fallback/initials               |
| `websiteUrl`          | Yes      | string URL      | Sponsor destination                           |
| `image`               | No       | string URL      | Usually `/sponsors/<file>`                    |
| `imageAlt`            | No       | string          | Sponsor logo description                      |
| `discountDescription` | Yes      | string          | Member benefit shown on the card              |
| `promoCode`           | No       | string          | Code members use                              |
| `terms`               | Yes      | string          | Conditions and exclusions                     |
| `validUntil`          | No       | ISO date string | Expiry date shown using Australian formatting |

The home-page sponsor preview selects the first three records that appear to
offer a member discount. The heuristic accepts a promo code or a description
containing a percentage, “discount”, “discounted”, or “off”. Event-only support
such as free drinks may appear on the sponsors page but not the home preview.

Keep legal conditions in `terms`, not only in `discountDescription`. Verify
promo codes and expiry dates with the sponsor before publishing.

## `src/data/faq.json`

This file is an ordered array.

| Field      | Required | Type and allowed values                         | Meaning              |
| ---------- | -------- | ----------------------------------------------- | -------------------- |
| `id`       | Yes      | string                                          | Stable accordion key |
| `question` | Yes      | string                                          | Accordion trigger    |
| `answer`   | Yes      | string                                          | Plain-text answer    |
| `category` | Yes      | `membership`, `discord`, `events`, or `general` | Filtering metadata   |

Answers are rendered as plain text. HTML and Markdown inside the string are not
interpreted. If rich answers are introduced, design and sanitize that feature
in code rather than embedding markup in JSON.

## `src/data/site.json`

This is the singleton record for global copy, links, statistics, membership,
and contacts.

### Top-level fields

| Field                  | Required | Meaning                                                     |
| ---------------------- | -------- | ----------------------------------------------------------- |
| `clubName`             | Yes      | Primary site/hero name                                      |
| `hero`                 | Yes      | Hero heading and calls to action                            |
| `clubDescription`      | Yes      | Home-page introduction                                      |
| `eventsOverview`       | Yes      | General events copy; currently part of the content contract |
| `sponsorPerksOverview` | Yes      | Home sponsor-preview copy                                   |
| `discordOverview`      | Yes      | Info-page Discord copy                                      |
| `socialLinks`          | Yes      | Social and email destinations                               |
| `clubStats`            | Yes      | Home-page statistics                                        |
| `membershipSteps`      | Yes      | Membership card and tabs                                    |
| `contacts`             | Yes      | Ordered contact list                                        |

### Hero

`hero.title`, `hero.primaryCta`, and `hero.secondaryCta` are required.
`subtitle`, `image`, and `imageAlt` are optional. Each CTA requires `label` and
`href`.

If `hero.image` is omitted, the component uses the matched background and
character artwork imported from `src/assets/banner/`. If it is supplied, it is
treated as a raw public URL and the character layer is omitted.

Internal CTA paths such as `/events` use React Router. HTTP(S), protocol-relative,
and `mailto:` values open as external links.

### Social links

`discord`, `instagram`, and `email` are required strings. `facebook`, `youtube`,
and `linktree` are optional. The `email` value is an address without `mailto:`;
the component adds the scheme.

### Club statistics

`memberCount`, `activeSince`, `eventsThisYear`, and `sponsorCount` accept either
a number or a display string such as `"2600+"`. `lastUpdated` is a required
string and should use `YYYY-MM-DD`.

Update `lastUpdated` whenever changing a statistic. Confirm that the label
matches the value's meaning—for example, a sponsor count should not contain a
social follower count.

### Membership steps

| Field       | Required  | Meaning                     |
| ----------- | --------- | --------------------------- |
| `id`        | Yes       | Stable membership block key |
| `label`     | Yes       | Card title                  |
| `summary`   | Yes       | Short introduction          |
| `tabs`      | Preferred | Array of tab records        |
| `linkUrl`   | No        | External signup destination |
| `linkLabel` | No        | Signup link text            |

Each tab requires `id`, `label`, and a `steps` array of strings. The current UI
is laid out for two tabs and initially selects the ID `join-home`; if tab IDs or
count change, update `MembershipInstructions` so the initial selection and grid
remain valid.

The validator retains backward compatibility with an older top-level `steps`
array by converting it to one `join` tab. New content should use `tabs`.

### Contacts

Each contact requires a `label` and plain email address. Contacts are rendered
in source order.

## `src/data/team.json`

This file is an array of team profiles sorted by `displayOrder`.

| Field           | Required | Type and allowed values                     | Meaning                                                |
| --------------- | -------- | ------------------------------------------- | ------------------------------------------------------ |
| `id`            | Yes      | string                                      | Stable profile and accessibility key                   |
| `name`          | Yes      | string                                      | Display name                                           |
| `role`          | Yes      | string                                      | Committee title; may be empty for subcommittee members |
| `membership`    | Yes      | `top5`, `executive`, `director`, or `other` | Grouping and count behavior                            |
| `portfolio`     | Yes      | string                                      | Portfolio chip/group, such as `Events` or `IT`         |
| `displayOrder`  | Yes      | finite number                               | Global carousel ordering                               |
| `pronouns`      | No       | string                                      | Optional badge                                         |
| `portraitImage` | Yes      | string URL                                  | Usually `/team/portraits/<file>`                       |
| `portraitAlt`   | Yes      | string                                      | Description of the person/photo                        |
| `degree`        | Yes      | string array                                | One or more education lines; empty is valid            |
| `funFacts`      | Yes      | string array                                | Profile facts; empty is valid                          |
| `favoriteAnime` | Yes      | string array                                | Favorite titles; empty is valid                        |
| `extras`        | No       | string array                                | Additional profile section                             |
| `discordHandle` | No       | string                                      | Public Discord display handle                          |

The team page separates leadership (`top5`, `executive`, and `director`) from
other profiles. Portfolio navigation chooses a preferred lead using current
component rules, so preserve consistent portfolio spelling and capitalization.

Use unique `displayOrder` values to make order obvious, even though duplicate
numbers are technically accepted. Confirm permission before publishing names,
portraits, pronouns, personal facts, or Discord handles.

## Content review checklist

- [ ] JSON parses and runtime validation succeeds.
- [ ] IDs, slugs, and `displayOrder` values are intentional.
- [ ] Dates include the correct Sydney UTC offset.
- [ ] External links open and use the correct destination.
- [ ] New images are committed and load from production-safe paths.
- [ ] Meaningful images have useful alternative text.
- [ ] Personal information has publication consent.
- [ ] Sponsor terms and expiry dates are current.
- [ ] Statistics and `lastUpdated` agree.
- [ ] No registration link remains enabled for an event that should be closed.
- [ ] The affected route was checked on mobile and desktop.
