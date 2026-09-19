import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileEditForm } from "@/components/developers/ProfileEditForm";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <AppShell>
      <div className="container-page max-w-[720px] py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">Edit profile</h1>
        <p className="mt-1 text-sm text-muted">
          This information is shown on your public profile.
        </p>
        <div className="mt-8">
          <ProfileEditForm user={user} />
        </div>
      </div>
    </AppShell>
  );
}
