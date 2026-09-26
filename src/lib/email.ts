import "server-only";
import { siteConfig } from "./config";
import { formatINR } from "./money";

interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends transactional email through Resend (https://resend.com) when
 * RESEND_API_KEY is set; otherwise logs the message so development works
 * without an email provider. Never throws: a failed email must not fail an order.
 */
export async function sendEmail(mail: Mail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <orders@redbetta.in>`;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "test") {
      console.info(`[email:dev] to=${mail.to} subject="${mail.subject}"`);
    }
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[email] send failed: ${res.status} ${await res.text().catch(() => "")}`);
  } catch (error) {
    console.error("[email] send failed", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

interface OrderMailData {
  orderNumber: string;
  email: string;
  shipName: string;
  total: number;
  paymentMethod: "RAZORPAY" | "COD";
  accessToken: string;
  id: string;
  items: { name: string; size: string; color: string; quantity: number; unitPrice: number }[];
}

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0b0b0c;font-family:Arial,Helvetica,sans-serif;color:#f2f2f2">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 20px">
<tr><td style="font-size:26px;font-weight:900;font-style:italic;color:#e3141b;letter-spacing:1px">RED <span style="color:#f2f2f2;font-style:normal;font-weight:300;letter-spacing:6px;font-size:14px">BETTA</span></td></tr>
<tr><td style="padding-top:24px"><h1 style="font-size:20px;margin:0 0 16px">${title}</h1>${body}</td></tr>
<tr><td style="padding-top:32px;font-size:12px;color:#8a8a8a">${escapeHtml(siteConfig.name)} · ${escapeHtml(siteConfig.tagline)}<br>Questions? Reply to this email or write to ${escapeHtml(siteConfig.supportEmail)}.</td></tr>
</table></body></html>`;
}

export async function sendOrderConfirmation(order: OrderMailData) {
  const url = `${siteConfig.url}/orders/${order.id}?token=${order.accessToken}`;
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escapeHtml(i.name)} <span style="color:#8a8a8a">(${escapeHtml(i.size)} / ${escapeHtml(i.color)}) × ${i.quantity}</span></td><td align="right">${formatINR(i.unitPrice * i.quantity)}</td></tr>`,
    )
    .join("");
  const payment = order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online";
  await sendEmail({
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed | ${siteConfig.name}`,
    html: layout(
      `Thanks, ${escapeHtml(order.shipName)}! Your order is confirmed.`,
      `<p style="color:#bdbdbd">Order <b>${escapeHtml(order.orderNumber)}</b> · ${payment}</p>
<table width="100%" style="font-size:14px;border-top:1px solid #2a2a2a;border-bottom:1px solid #2a2a2a;margin:16px 0">${rows}</table>
<p style="font-size:16px"><b>Total: ${formatINR(order.total)}</b></p>
<p><a href="${url}" style="display:inline-block;background:#e3141b;color:#fff;padding:12px 20px;text-decoration:none;font-weight:bold">View your order</a></p>`,
    ),
    text: `Thanks, ${order.shipName}! Order ${order.orderNumber} is confirmed (${payment}). Total ${formatINR(order.total)}. View it at ${url}`,
  });
}

export async function sendShippingUpdate(order: {
  id: string;
  orderNumber: string;
  email: string;
  shipName: string;
  accessToken: string;
  courier: string | null;
  trackingNumber: string | null;
}) {
  const url = `${siteConfig.url}/orders/${order.id}?token=${order.accessToken}`;
  const tracking =
    order.trackingNumber != null
      ? `<p>Courier: <b>${escapeHtml(order.courier ?? "Our courier partner")}</b><br>Tracking number: <b>${escapeHtml(order.trackingNumber)}</b></p>`
      : "";
  await sendEmail({
    to: order.email,
    subject: `Your order ${order.orderNumber} has shipped`,
    html: layout(
      `Good news, ${escapeHtml(order.shipName)}. It's on the way.`,
      `${tracking}<p><a href="${url}" style="color:#e3141b">Track your order</a></p>`,
    ),
    text: `Your order ${order.orderNumber} has shipped. ${order.trackingNumber ? `Tracking: ${order.courier ?? ""} ${order.trackingNumber}.` : ""} ${url}`,
  });
}
