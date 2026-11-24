#!/usr/bin/env node

/**
 * ============================================================
 *  🎯 ATS Resume Generator for Manitharun Reddy
 * ============================================================
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);
function getArg(flag, defaultVal = "") {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultVal;
}

const companyName = getArg("--company", "Target Company");
const targetRole = getArg("--role", "Full-Stack Software Engineer");
const outputFile = getArg("--out", "");

const safeComp = companyName.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
const outputDir = path.join(__dirname, "dist_resumes");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPdf = outputFile || (companyName === "Target Company" 
  ? path.join(__dirname, "manitharunreddy_resume_full_stack_developer.pdf")
  : path.join(outputDir, `Manitharun_Reddy_${safeComp}.pdf`));
const tempHtml = path.join(outputDir, `temp_${safeComp}.html`);

const PROFILE = {
  name: "MANITHARUN REDDY THALLAPUREDDY",
  phone: "+91 9912939402",
  email: "manitharunreddy@gmail.com",
  location: "Hyderabad, Telangana, India",
  portfolio: "https://manitharunreddy.in",
  github: "https://github.com/manitharunreddy",
  linkedin: "https://linkedin.com/in/manitharunreddy",
  role: targetRole || "Full-Stack Software Engineer",
  summary: "Full-Stack Software Engineer with 4 years of professional experience developing and maintaining enterprise web applications, retail management platforms, and offline-first POS systems. Proficient in JavaScript, TypeScript, React.js, Node.js, Express.js, PostgreSQL, MySQL, MongoDB, and SQLite. Experienced in building RESTful APIs, real-time data synchronization, multi-tenant applications, inventory management workflows, and Electron-based desktop applications. Immediate joiner (0–5 days)."
};

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${PROFILE.name} Resume</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      line-height: 1.35;
      font-size: 10.5px;
      padding: 0.35in 0.45in;
      background: #ffffff;
    }
    .header { text-align: center; margin-bottom: 8px; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 5px; }
    .name { font-size: 19px; font-weight: 700; color: #1e3a8a; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
    .contact { font-size: 10px; color: #374151; }
    .contact a { color: #1e3a8a; text-decoration: none; }
    .section-title { font-size: 11.5px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-top: 8px; margin-bottom: 5px; }
    .summary-text { color: #374151; text-align: justify; margin-bottom: 4px; }
    .skills-row { font-size: 10px; margin-bottom: 2.5px; color: #374151; }
    .skills-row strong { color: #111827; }
    .exp-item { margin-bottom: 6px; }
    .exp-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 10.5px; color: #111827; }
    .exp-company { color: #1e3a8a; }
    .project-title { font-weight: 700; font-size: 10px; color: #1e3a8a; margin-top: 3px; margin-bottom: 2px; }
    ul { padding-left: 15px; margin-top: 2px; }
    li { margin-bottom: 2.5px; color: #374151; }
    .edu-row { display: flex; justify-content: space-between; font-size: 10px; color: #374151; }
  </style>
</head>
<body>

  <div class="header">
    <div class="name">${PROFILE.name}</div>
    <div class="contact">
      ${PROFILE.phone} &nbsp;|&nbsp; 
      <a href="mailto:${PROFILE.email}">${PROFILE.email}</a> &nbsp;|&nbsp; 
      ${PROFILE.location} &nbsp;|&nbsp;
      <a href="${PROFILE.portfolio}">Portfolio</a> &nbsp;|&nbsp;
      <a href="${PROFILE.github}">GitHub</a> &nbsp;|&nbsp;
      <a href="${PROFILE.linkedin}">LinkedIn</a>
    </div>
  </div>

  <div class="section-title">Professional Summary</div>
  <div class="summary-text">${PROFILE.summary}</div>

  <div class="section-title">Technical Skills</div>
  <div class="skills-row"><strong>Programming Languages:</strong> JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3</div>
  <div class="skills-row"><strong>Frontend Development:</strong> React.js, React Hooks, Context API, Tailwind CSS, Bootstrap, Handlebars.js</div>
  <div class="skills-row"><strong>Backend Development:</strong> Node.js, Express.js, RESTful APIs, WebSockets</div>
  <div class="skills-row"><strong>Databases:</strong> PostgreSQL, MySQL, MongoDB, SQLite</div>
  <div class="skills-row"><strong>Desktop & Architecture:</strong> Electron.js, Offline-First Architecture, Database-per-Tenant Multi-Tenancy, Real-Time Sync, Silent Printing</div>
  <div class="skills-row"><strong>Tools & Deployment:</strong> Git, GitHub, Postman, Docker, Linux, Nginx, PM2</div>

  <div class="section-title">Professional Experience</div>

  <div class="exp-item">
    <div class="exp-header">
      <span class="exp-company">Young Minds Technology Solutions Pvt. Ltd., Hyderabad, India</span>
      <span>27 Oct 2022 – 2 Nov 2026</span>
    </div>
    <div style="font-style: italic; color: #4b5563; margin-bottom: 3px;">Full-Stack Web Developer (4 Years)</div>

    <div class="project-title">Offline-First Retail POS & Sync Ecosystem (Electron.js, React, Node.js, SQLite, WebSockets)</div>
    <ul>
      <li>Built an offline-first retail POS system supporting 6 retail outlets and processing 700+ daily transactions per store while maintaining local billing functionality during internet outages.</li>
      <li>Implemented bidirectional WebSocket-based synchronization between local POS applications and cloud services with unique transaction deduplication.</li>
      <li>Developed cashier modules, barcode scanning, thermal receipt printing, discount distribution, and GST calculations.</li>
    </ul>

    <div class="project-title">RetailSoft – Multi-Tenant B2B Retail ERP (React.js, Node.js, TypeScript, MySQL)</div>
    <ul>
      <li>Engineered a B2B retail management platform serving 10+ business tenants using a database-per-tenant architecture for secure tenant data isolation.</li>
      <li>Developed full-stack modules for inter-store inventory transfers, stock indents, and multi-stage approval workflows handling 20+ daily indents.</li>
    </ul>

    <div class="project-title">TGFSL – Telangana State Forensic Science Laboratory System (React, Node, Express, MySQL)</div>
    <ul>
      <li>Contributed to the state-wide procurement and inventory management system supporting operations across all 30 Telangana district head offices.</li>
      <li>Implemented role-based access control (RBAC), multi-level approvals, and digital voucher generation (RV/IV).</li>
    </ul>

    <div class="project-title">Stealthy Print – Silent Thermal Printing Desktop Service (Electron.js, Express.js, HTTP APIs)</div>
    <ul>
      <li>Developed a desktop service with embedded Express server enabling web apps to submit HTML print jobs without manual operating system dialogs, featuring printer-specific queues and automatic retry logic.</li>
    </ul>
  </div>

  <div class="section-title">Education</div>
  <div class="edu-row">
    <div><strong>Bachelor of Technology in Electronics and Communication Engineering</strong> | Guru Nanak Technical Campus, Hyderabad</div>
    <div>2018 – 2022</div>
  </div>

</body>
</html>`;

fs.writeFileSync(tempHtml, htmlContent, "utf-8");

try {
  const chromeCmd = `google-chrome --headless --disable-gpu --no-sandbox --print-to-pdf="${outputPdf}" "${tempHtml}"`;
  execSync(chromeCmd, { stdio: "pipe" });

  if (fs.existsSync(outputPdf)) {
    const stats = fs.statSync(outputPdf);
    console.log(`\n✔ Resume PDF generated successfully!`);
    console.log(`  👤 Name:     ${PROFILE.name}`);
    console.log(`  📄 PDF Path: ${outputPdf}`);
    console.log(`  📦 Size:     ${(stats.size / 1024).toFixed(1)} KB`);
  }
} catch (err) {
  const msedgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browserPath = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(msedgePath) ? msedgePath : "");

  if (browserPath) {
    try {
      execSync(`"${browserPath}" --headless --disable-gpu --print-to-pdf="${outputPdf}" "${tempHtml}"`, { stdio: "pipe" });
      if (fs.existsSync(outputPdf)) {
        console.log(`\n✔ Resume PDF generated successfully via browser!`);
        console.log(`  📄 PDF Path: ${outputPdf}`);
      }
    } catch (e) {
      console.error(`✖ PDF rendering error:`, e.message);
    }
  } else {
    console.log(`ℹ Saved HTML preview to: ${tempHtml}`);
  }
} finally {
  if (fs.existsSync(tempHtml)) {
    fs.unlinkSync(tempHtml);
  }
}
