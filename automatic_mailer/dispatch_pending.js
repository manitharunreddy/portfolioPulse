/**
 * dispatch_pending.js
 * On-demand dispatcher for leads accumulated in pending_leads.json.
 * 
 * Usage:
 *   node dispatch_pending.js           -> Previews pending leads without sending
 *   node dispatch_pending.js --preview -> Previews pending leads without sending
 *   node dispatch_pending.js --send    -> Dispatches pending leads with resume attachment & anti-spam pacing
 */

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { generateEmailDraft } = require("./lead_sourcer");

const PENDING_FILE = path.join(__dirname, "pending_leads.json");
const HISTORY_FILE = path.join(__dirname, "sent_history.json");
const RESUME_FILE = path.join(__dirname, "manitharunreddy_resume_full_stack_developer.pdf");

const SENDER_EMAIL = process.env.SENDER_EMAIL || process.env.EMAIL_USER || "manitharunreddy@gmail.com";
const SENDER_PASS = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
const SENDER_NAME = "Manitharun Reddy";

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

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

function previewPending() {
  const pending = loadJson(PENDING_FILE, []);
  if (pending.length === 0) {
    console.log("\n📭 The pending queue (pending_leads.json) is currently empty.");
    console.log("Run: `npm run source-leads` or start the daemon with `npm run sourcer-daemon` to accumulate leads.\n");
    return;
  }

  console.log(`\n===============================================================`);
  console.log(`📋 PENDING LEADS QUEUE (${pending.length} leads ready for dispatch)`);
  console.log(`===============================================================`);
  console.log("Candidate: Manitharun Reddy (4 Yrs Full-Stack / React / Node.js Developer)");
  console.log(`Resume: ${fs.existsSync(RESUME_FILE) ? "FOUND (manitharunreddy_resume_full_stack_developer.pdf)" : "NOT FOUND"}\n`);

  pending.slice(0, 20).forEach((lead, idx) => {
    const toEmail = lead.to || lead.email;
    const draft = lead.plainText ? lead : generateEmailDraft(lead.company, lead.role, lead.location);
    console.log(`[${idx + 1}/${pending.length}] ${lead.company}`);
    console.log(`     Role:     ${lead.role || "Full-Stack Developer"}`);
    console.log(`     To:       ${toEmail}`);
    if (lead.cc) console.log(`     CC:       ${lead.cc}`);
    console.log(`     Location: ${lead.location || "Pan-India / Remote"}`);
    console.log(`     Subject:  ${draft.subject}\n`);
  });

  if (pending.length > 20) {
    console.log(`... and ${pending.length - 20} more leads in queue.`);
  }

  console.log(`---------------------------------------------------------------`);
  console.log(`💡 To dispatch these emails now, run:`);
  console.log(`   npm run send-pending`);
  console.log(`   OR: node dispatch_pending.js --send`);
  console.log(`===============================================================\n`);
}

async function dispatchPending() {
  const pending = loadJson(PENDING_FILE, []);
  if (pending.length === 0) {
    console.log("\n📭 No leads pending in queue. Nothing to send.");
    return;
  }

  if (!fs.existsSync(RESUME_FILE)) {
    console.error(`❌ ERROR: Resume PDF not found at: ${RESUME_FILE}`);
    process.exit(1);
  }

  if (!SENDER_EMAIL || !SENDER_PASS || SENDER_PASS === "your_16_digit_app_password") {
    console.error("❌ ERROR: SENDER_EMAIL and GMAIL_APP_PASSWORD must be configured in .env");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASS.replace(/\s+/g, ""),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 25000,
  });

  console.log(`\n🚀 Starting dispatch of ${pending.length} pending leads from ${SENDER_EMAIL}...\n`);

  const history = loadJson(HISTORY_FILE, []);
  const remaining = [];
  let sentCount = 0;

  for (let i = 0; i < pending.length; i++) {
    const lead = pending[i];
    const toEmail = lead.to || lead.email;
    const draft = (lead.plainText && lead.plainText.includes("Manitharun")) 
      ? lead 
      : generateEmailDraft(lead.company, lead.role, lead.location);

    console.log(`[${i + 1}/${pending.length}] Sending to ${lead.company} -> ${toEmail} ${lead.cc ? `(CC: ${lead.cc})` : ""}...`);

    const mailOptions = {
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: toEmail,
      subject: draft.subject,
      text: draft.plainText,
      html: draft.html,
      attachments: [
        {
          filename: "manitharunreddy_resume_full_stack_developer.pdf",
          path: RESUME_FILE,
          contentType: "application/pdf",
        },
      ],
    };

    if (lead.cc) {
      mailOptions.cc = lead.cc;
    }

    let sent = false;
    for (let attempt = 1; attempt <= 2 && !sent; attempt++) {
      try {
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SMTP socket timeout")), 25000)
        );
        const info = await Promise.race([sendPromise, timeoutPromise]);

        console.log(`   ✔ SENT! Message ID: ${info.messageId}`);
        sentCount++;
        sent = true;

        history.push({
          timestamp: new Date().toISOString(),
          recipientEmail: toEmail.toLowerCase().trim(),
          company: lead.company,
          role: lead.role || "Full-Stack Developer",
          status: "SENT",
          messageId: info.messageId,
          ...(lead.cc ? { cc: lead.cc } : {}),
        });
        saveJson(HISTORY_FILE, history);

        // Anti-spam jitter pacing (4 - 6 seconds)
        if (i < pending.length - 1) {
          const jitter = (Math.random() * 2000 + 4000).toFixed(0);
          console.log(`   ⏳ Pacing ${(jitter / 1000).toFixed(1)}s...`);
          await sleep(parseInt(jitter, 10));
        }
      } catch (err) {
        if (attempt === 1) {
          console.warn(`   ⚠️ Attempt 1 failed (${err.message}). Retrying in 3s...`);
          await sleep(3000);
        } else {
          console.error(`   ❌ Failed sending to ${lead.company}: ${err.message}`);
          remaining.push(lead);
        }
      }
    }
  }

  // Update pending file with remaining unsent leads (if any failed)
  saveJson(PENDING_FILE, remaining);

  console.log(`\n===============================================================`);
  console.log(`🎉 DISPATCH COMPLETE!`);
  console.log(`   Successfully Sent: ${sentCount} applications`);
  console.log(`   Remaining in Queue: ${remaining.length}`);
  console.log(`   History Logged: ${HISTORY_FILE}`);
  console.log(`===============================================================\n`);
}

// Entrypoint
const isSend = process.argv.includes("--send");
if (isSend) {
  dispatchPending();
} else {
  previewPending();
}
