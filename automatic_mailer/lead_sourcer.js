/**
 * lead_sourcer.js
 * Automatically sources relevant Frontend / React.js / UI Developer leads
 * for Hyderabad, Bangalore, and Chennai into pending_leads.json.
 * 
 * Rules:
 * - Deduplicates against sent_history.json and existing pending_leads.json
 * - Groups multiple company emails: primary -> To, secondary -> CC
 * - Strictly matches Manitharun's authentic profile (4 yrs exp Full-Stack, React, Node, Electron, POS)
 * - Zero checkmarks, no emojis, clean hyphen bullets
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const PENDING_FILE = path.join(__dirname, "pending_leads.json");
const HISTORY_FILE = path.join(__dirname, "sent_history.json");
const CSV_FILE = path.join(__dirname, "companies_email_leads.csv");

const CONFIG = {
  candidateName: "Manitharun Reddy",
  senderEmail: process.env.SENDER_EMAIL || process.env.EMAIL_USER || "manitharunreddy@gmail.com",
  senderPhone: "+91 9912939402",
  portfolioUrl: "https://manitharunreddy.in",
  githubUrl: "https://github.com/manitharunreddy",
  linkedinUrl: "https://linkedin.com/in/manitharunreddy",
  resumePath: path.join(__dirname, "manitharunreddy_resume_full_stack_developer.pdf"),
};

function loadJson(filePath, defaultVal = []) {
  if (!fs.existsSync(filePath)) return defaultVal;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    return defaultVal;
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function getSentEmails() {
  const history = loadJson(HISTORY_FILE, []);
  const emails = new Set();
  for (const item of history) {
    if (item.recipientEmail) emails.add(item.recipientEmail.toLowerCase().trim());
    if (item.cc) {
      item.cc.split(",").forEach(c => emails.add(c.toLowerCase().trim()));
    }
  }
  return emails;
}

function getQueuedEmails() {
  const pending = loadJson(PENDING_FILE, []);
  const emails = new Set();
  for (const item of pending) {
    if (item.to) emails.add(item.to.toLowerCase().trim());
    if (item.cc) {
      item.cc.split(",").forEach(c => emails.add(c.toLowerCase().trim()));
    }
  }
  return emails;
}

function generateEmailDraft(company, role, location = "Hyderabad / Bangalore") {
  const appliedRole = (!role || role.trim() === "" || role.toLowerCase() === "role") ? "Full-Stack Developer" : role.trim();
  const roleLower = appliedRole.toLowerCase();

  let targetCity = "";
  if (location) {
    const locLower = location.toLowerCase();
    if (locLower.includes("chennai")) targetCity = "Chennai";
    else if (locLower.includes("bangalore") || locLower.includes("bengaluru")) targetCity = "Bangalore";
    else if (locLower.includes("hyderabad")) targetCity = "Hyderabad";
    else if (locLower.includes("pune")) targetCity = "Pune";
    else if (locLower.includes("mumbai")) targetCity = "Mumbai";
  }

  let relocateSuffix = "Ready to Relocate";
  let relocationBullet = "Immediate joiner (0-5 days), based in Hyderabad, ready to relocate / open to Remote.";

  if (targetCity === "Hyderabad") {
    relocateSuffix = "Based in Hyderabad";
    relocationBullet = "Immediate joiner (0-5 days), based locally in Hyderabad.";
  } else if (targetCity) {
    relocateSuffix = `Ready to Relocate to ${targetCity}`;
    relocationBullet = `Immediate joiner (0-5 days), based in Hyderabad and ready to relocate to ${targetCity}.`;
  }

  let roleType = "fullstack";
  if (
    roleLower.includes("frontend") ||
    roleLower.includes("front end") ||
    roleLower.includes("ui") ||
    (roleLower.includes("react") && !roleLower.includes("node") && !roleLower.includes("full")) ||
    roleLower.includes("web developer") ||
    roleLower.includes("javascript")
  ) {
    roleType = "frontend";
  } else if (
    roleLower.includes("backend") ||
    roleLower.includes("back end") ||
    roleLower.includes("node") ||
    roleLower.includes("api")
  ) {
    roleType = "backend";
  }

  let roleIntro = "";
  let techHighlight = "";
  let projectBullets = [];

  if (roleType === "frontend") {
    roleIntro = "Frontend / UI Developer with 4 years of professional experience building scalable, responsive web and desktop applications using React.js and TypeScript";
    techHighlight = "React.js, TypeScript, JavaScript (ES6+), Tailwind CSS, Bootstrap, Electron.js, and REST APIs";
    projectBullets = [
      `Hands-on expertise developing responsive web applications and interactive dashboards using ${techHighlight}.`,
      "Built offline-first desktop POS applications using React, Electron.js, and SQLite, processing 700+ daily transactions across 6 retail outlets with real-time UI status indicators.",
      "Developed high-conversion UI modules for retail checkout, GST calculations, barcode scanning, and multi-tenant B2B ERP portals (RetailSoft).",
      "Engineered silent thermal printing desktop clients (Stealthy Print) and integrated third-party food aggregation workflows.",
    ];
  } else if (roleType === "backend") {
    roleIntro = "Backend / Software Engineer with 4 years of professional experience engineering resilient APIs, microservices, and database architectures using Node.js, Express, and SQL/NoSQL databases";
    techHighlight = "Node.js, Express.js, TypeScript, PostgreSQL, MySQL, MongoDB, SQLite, RESTful APIs, and WebSockets";
    projectBullets = [
      `Extensive experience architecting robust backend services and REST APIs with ${techHighlight}.`,
      "Architected database-per-tenant multi-tenancy for RetailSoft (B2B retail ERP) serving 10+ business tenants with isolated schema security.",
      "Implemented bidirectional WebSocket-based real-time synchronization between offline retail outlet systems and central cloud infrastructure with unique transaction deduplication.",
      "Developed procurement, indent tracking, and RBAC multi-level approval workflows for the Telangana State Forensic Science Laboratory (TGFSL) across 30 district offices.",
    ];
  } else {
    roleIntro = "Full-Stack Software Engineer with 4 years of professional experience building enterprise web platforms, offline-first POS systems, and distributed business applications";
    techHighlight = "React.js, Node.js, Express.js, TypeScript, PostgreSQL, MySQL, MongoDB, SQLite, and Electron.js";
    projectBullets = [
      `Full-lifecycle engineering experience across frontend and backend using ${techHighlight}.`,
      "Contributed to an offline-first retail POS ecosystem (Electron.js, SQLite, WebSockets) supporting 6 outlets and 700+ daily transactions per store with local-to-cloud bidirectional sync.",
      "Built multi-tenant enterprise applications (RetailSoft) using database-per-tenant architecture and government procurement systems (TGFSL) across 30 district offices.",
      "Engineered Stealthy Print (Electron desktop service with embedded Express server for silent thermal printing) and integrated Swiggy/Zomato webhook APIs for restaurant management.",
    ];
  }

  const subject = `${appliedRole} | 4 Yrs Exp | Immediate Joiner (0-5 Days) | ${relocateSuffix} - Manitharun Reddy`;

  const bulletsText = projectBullets.map((b) => `- ${b}`).join("\n");
  const plainText = `Dear Hiring Team,

I hope you are doing well.

My name is Manitharun Reddy, and I am a ${roleIntro}, actively seeking full-time opportunities.

I am reaching out to explore ${appliedRole} openings at ${company}. Based on my hands-on background delivering production-grade applications, I believe my skills are a strong match for your requirements.

A quick summary of my experience:
${bulletsText}
- ${relocationBullet}

Please find my resume attached for your review.

Portfolio: ${CONFIG.portfolioUrl}
GitHub: ${CONFIG.githubUrl}
LinkedIn: ${CONFIG.linkedinUrl}

Thank you for your time and consideration. I would welcome the opportunity to discuss how my background aligns with your team's needs.

Best regards,

Manitharun Reddy
Email: ${CONFIG.senderEmail}
Mobile: ${CONFIG.senderPhone}`;

  const bulletsHtml = projectBullets.map((b) => `    <li>${b}</li>`).join("\n");
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222222; line-height: 1.6; font-size: 14px; margin: 0; padding: 0; }
    p { margin: 0 0 12px 0; }
    ul { margin: 0 0 14px 0; padding-left: 20px; }
    li { margin-bottom: 6px; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .sign { margin-top: 18px; line-height: 1.5; color: #333333; }
  </style>
</head>
<body>
  <p>Dear Hiring Team,</p>

  <p>I hope you are doing well.</p>

  <p>My name is <strong>Manitharun Reddy</strong>, and I am a ${roleIntro}, actively seeking full-time opportunities.</p>

  <p>I am reaching out to explore <strong>${appliedRole}</strong> openings at <strong>${company}</strong>. Based on my hands-on background delivering production-grade applications, I believe my skills are a strong match for your requirements.</p>

  <p><strong>A quick summary of my experience:</strong></p>
  <ul>
${bulletsHtml}
    <li>${relocationBullet}</li>
  </ul>

  <p>Please find my resume attached for your review.</p>

  <p><strong>Portfolio:</strong> <a href="${CONFIG.portfolioUrl}">${CONFIG.portfolioUrl}</a></p>
  <p><strong>GitHub:</strong> <a href="${CONFIG.githubUrl}">${CONFIG.githubUrl}</a></p>
  <p><strong>LinkedIn:</strong> <a href="${CONFIG.linkedinUrl}">${CONFIG.linkedinUrl}</a></p>

  <p>Thank you for your time and consideration. I would welcome the opportunity to discuss how my background aligns with your team's needs.</p>

  <div class="sign">
    <p>Best regards,<br>
    <strong>Manitharun Reddy</strong><br>
    Email: <a href="mailto:${CONFIG.senderEmail}">${CONFIG.senderEmail}</a><br>
    Mobile: ${CONFIG.senderPhone}</p>
  </div>
</body>
</html>`;

  return { subject, plainText, html };
}

/**
 * Loads company leads pool from CSV, grouped by company for CC handling
 */
function loadSourcedPool() {
  if (!fs.existsSync(CSV_FILE)) return [];
  const lines = fs.readFileSync(CSV_FILE, "utf-8").split("\n");
  const companyMap = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",");
    const company = parts[0].trim();
    const email = parts[1] ? parts[1].trim() : "";
    const careerUrl = parts[2] ? parts[2].trim() : "";
    const isHydHub = parts[4] ? parts[4].trim() === "True" : false;

    if (!company || !email || !email.includes("@")) continue;

    if (!companyMap.has(company)) {
      companyMap.set(company, {
        company,
        emails: [],
        careerUrl,
        location: isHydHub ? "Hyderabad" : "Hyderabad / Bangalore / Chennai",
      });
    }
    const entry = companyMap.get(company);
    if (!entry.emails.includes(email.toLowerCase())) {
      entry.emails.push(email.toLowerCase());
    }
  }

  return Array.from(companyMap.values());
}

/**
 * Slices up to maxBatch fresh leads and appends them to pending_leads.json
 */
function sourceFreshLeads(maxBatch = 8) {
  const sentEmails = getSentEmails();
  const queuedEmails = getQueuedEmails();
  const pool = loadSourcedPool();
  const currentPending = loadJson(PENDING_FILE, []);

  const newlyAdded = [];

  for (const item of pool) {
    if (newlyAdded.length >= maxBatch) break;

    // Check if any of this company's emails were sent or queued
    const alreadyContacted = item.emails.some(e => sentEmails.has(e) || queuedEmails.has(e));
    if (alreadyContacted) continue;

    // Separate primary To and CC
    const toEmail = item.emails[0];
    const ccEmail = item.emails.length > 1 ? item.emails.slice(1).join(",") : null;

    const draft = generateEmailDraft(item.company, "Frontend Developer (React.js)", item.location);

    const leadObject = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sourcedAt: new Date().toISOString(),
      company: item.company,
      role: "Frontend Developer (React.js)",
      location: item.location,
      to: toEmail,
      cc: ccEmail,
      careerUrl: item.careerUrl,
      subject: draft.subject,
      plainText: draft.plainText,
      html: draft.html,
      status: "PENDING_REVIEW",
    };

    newlyAdded.push(leadObject);
    queuedEmails.add(toEmail);
    if (ccEmail) {
      ccEmail.split(",").forEach(c => queuedEmails.add(c.trim()));
    }
  }

  if (newlyAdded.length > 0) {
    const updated = [...currentPending, ...newlyAdded];
    saveJson(PENDING_FILE, updated);
  }

  return {
    addedCount: newlyAdded.length,
    totalPending: currentPending.length + newlyAdded.length,
    newLeads: newlyAdded,
  };
}

// CLI Execution
if (require.main === module) {
  const max = parseInt(process.argv[2], 10) || 8;
  console.log(`🔍 Sourcing fresh Frontend Developer leads (Max: ${max})...`);
  const result = sourceFreshLeads(max);
  console.log(`✅ Sourced ${result.addedCount} new leads.`);
  console.log(`📋 Total in queue (pending_leads.json): ${result.totalPending}`);
  if (result.addedCount > 0) {
    console.log("\n--- Newly Added Leads ---");
    result.newLeads.forEach((lead, i) => {
      console.log(`${i + 1}. ${lead.company} | To: ${lead.to} ${lead.cc ? `| CC: ${lead.cc}` : ""} | Loc: ${lead.location}`);
    });
  }
}

module.exports = { sourceFreshLeads, generateEmailDraft, loadJson, saveJson, PENDING_FILE, HISTORY_FILE };
