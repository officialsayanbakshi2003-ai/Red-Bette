import { toggleMessageRead } from "@/actions/admin";
import { ActionButton } from "@/components/admin/RowActions";
import { AdminHeader, Card } from "@/components/admin/ui";
import { formatDateTime } from "@/components/orders/StatusBadge";
import { db } from "@/lib/db";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: [{ isRead: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <div>
      <AdminHeader title="Messages" description="From the contact form. Reply by email." />
      {messages.length === 0 ? (
        <p className="text-sm text-mist">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={"p-5 " + (m.isRead ? "opacity-70" : "border-l-2 border-l-blood")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{m.subject}</p>
                  <p className="text-xs text-mist">
                    {m.name} ·{" "}
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="text-bone underline underline-offset-2">
                      {m.email}
                    </a>{" "}
                    · {formatDateTime(m.createdAt)}
                  </p>
                </div>
                <ActionButton action={toggleMessageRead.bind(null, m.id)}>{m.isRead ? "Mark unread" : "Mark read"}</ActionButton>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-bone/85">{m.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
