// Smoke tests for the CV renderer and the HTML stripper.
// Run with: node --import tsx --test tests/render.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { renderCv } from "../src/lib/cv/render";
import { htmlToText } from "../src/lib/jobs/extract";
import { profileCompleteness, isProfileComplete } from "../src/lib/profile/types";

const sampleProfile = {
  basics: {
    full_name: "Ada Lovelace",
    email: "ada@example.com",
    headline: "Software Engineer",
    location: "London, UK",
    summary: "Engineer with 8 years building reliable backends.",
    linkedin_url: "https://linkedin.com/in/ada",
  },
  experiences: [
    {
      id: "1",
      company: "Acme",
      title: "Senior Engineer",
      location: "Remote",
      start_date: "2022-01-01",
      end_date: null,
      current: true,
      description: "Lead the payments team.",
      achievements: ["Cut p99 latency 60%"],
      order_index: 0,
    },
  ],
  education: [
    {
      id: "1",
      school: "University of London",
      degree: "BSc",
      field: "Mathematics",
      start_date: "2010-09-01",
      end_date: "2013-06-01",
      description: null,
      order_index: 0,
    },
  ],
  skills: [
    { id: "1", name: "TypeScript", category: "technical", level: null },
    { id: "2", name: "Postgres", category: "tool", level: null },
    { id: "3", name: "Communication", category: "soft", level: null },
  ],
  links: [
    { id: "1", label: "GitHub", url: "https://github.com/ada" },
  ],
};

const sampleTailored = {
  tailored_headline: "Backend engineer focused on payments scale",
  tailored_summary: "Engineer with strong payments experience.",
  tailored_experiences: [
    {
      company: "Acme",
      title: "Senior Engineer",
      bullets: ["Owned payment latency reduction (60%)", "Mentored 4 engineers"],
    },
  ],
  cover_letter: "Dear team,\nI'm excited about this role.\nAda",
  match_score: 87,
  matched_skills: ["TypeScript", "Postgres"],
  missing_skills: ["Kafka"],
  recommended_skills_to_add: ["Kafka"],
};

test("renderCv produces valid HTML for all four templates", () => {
  for (const tpl of ["modern", "classic", "creative", "minimal"]) {
    const html = renderCv({
      profile: sampleProfile,
      tailored: sampleTailored,
      template: tpl,
      watermark: false,
    });
    assert.ok(html.startsWith("<!DOCTYPE html>"), `${tpl} starts with doctype`);
    assert.ok(html.includes("Ada Lovelace"), `${tpl} contains name`);
    assert.ok(html.includes("Senior Engineer"), `${tpl} contains job title`);
    assert.ok(
      html.includes("Owned payment latency reduction"),
      `${tpl} contains tailored bullet`,
    );
    assert.ok(
      html.includes("University of London"),
      `${tpl} contains education`,
    );
    assert.ok(html.includes("</html>"), `${tpl} closes html`);
  }
});

test("renderCv watermark toggles", () => {
  const withMark = renderCv({
    profile: sampleProfile,
    tailored: sampleTailored,
    template: "modern",
    watermark: true,
  });
  const withoutMark = renderCv({
    profile: sampleProfile,
    tailored: sampleTailored,
    template: "modern",
    watermark: false,
  });
  assert.ok(
    withMark.includes("Generated with Adam Careers"),
    "watermark present when on",
  );
  assert.ok(
    !withoutMark.includes("Generated with Adam Careers"),
    "watermark absent when off",
  );
});

test("htmlToText strips scripts/styles and decodes entities", () => {
  const input = `<html>
<head><style>body { color: red }</style></head>
<body>
  <h1>Senior Engineer</h1>
  <script>alert('hi')</script>
  <p>Salary: 100&nbsp;000&nbsp;EUR</p>
  <p>Build &amp; ship.</p>
</body>
</html>`;
  const text = htmlToText(input);
  assert.ok(!text.includes("<"), "no tags");
  assert.ok(!text.includes("alert"), "scripts removed");
  assert.ok(!text.includes("color: red"), "styles removed");
  assert.ok(text.includes("Senior Engineer"), "headline preserved");
  assert.ok(text.includes("Build & ship."), "entities decoded");
});

test("profile completeness scales with data", () => {
  const empty = {
    basics: {
      full_name: null,
      email: null,
      headline: null,
      location: null,
      summary: null,
      linkedin_url: null,
    },
    experiences: [],
    education: [],
    skills: [],
    links: [],
  };
  assert.equal(profileCompleteness(empty), 0);
  assert.equal(isProfileComplete(empty), false);

  const partial = {
    ...empty,
    basics: { ...empty.basics, full_name: "Ada", email: "a@b.c" },
  };
  assert.ok(profileCompleteness(partial) > 0 && profileCompleteness(partial) < 100);
  assert.equal(isProfileComplete(partial), false);

  assert.ok(profileCompleteness(sampleProfile) >= 70);
  assert.equal(isProfileComplete(sampleProfile), true);
});
