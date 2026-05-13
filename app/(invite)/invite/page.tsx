import { getInvitationByToken } from "@/features/auth/actions/invite-actions";
import { AcceptInviteForm } from "@/features/auth/components/accept-invite-form";
import { notFound } from "next/navigation";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Invalid link</h1>
          <p className="text-sm text-muted-foreground">This invitation link is missing.</p>
        </div>
      </div>
    );
  }

  const result = await getInvitationByToken(token);

  if (!result.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Invalid or expired link</h1>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative w-full max-w-md">
        <AcceptInviteForm token={token} email={result.email} />
      </div>
    </div>
  );
}
