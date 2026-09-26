// Runs once when the server starts: fail fast on unsafe production config.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;

  const problems: string[] = [];
  if (!process.env.DATABASE_URL) problems.push("DATABASE_URL is not set.");
  const secret = process.env.AUTH_SECRET ?? "";
  if (secret.length < 32 || secret.includes("change-me")) {
    problems.push("AUTH_SECRET must be a random string of at least 32 characters (run: openssl rand -base64 48).");
  }
  if (problems.length) {
    throw new Error(`Red Betta cannot start safely:\n- ${problems.join("\n- ")}`);
  }

  const warnings: string[] = [];
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    warnings.push("Razorpay keys are missing: online payments are disabled, only cash on delivery is offered.");
  }
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    warnings.push("RAZORPAY_WEBHOOK_SECRET is missing: payments rely on the browser callback only.");
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) warnings.push("NEXT_PUBLIC_SITE_URL is not set: links in emails and SEO tags will be wrong.");
  if (!process.env.RESEND_API_KEY) warnings.push("RESEND_API_KEY is missing: order emails are not being sent.");
  if (!process.env.CRON_SECRET) warnings.push("CRON_SECRET is missing: the scheduled order clean-up endpoint is disabled.");
  for (const w of warnings) console.warn(`[config] ${w}`);
}
