import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const { token } = (await searchParams) ?? {};
  return (
    <AuthLayout title="Choose a new password" subtitle="Make it strong and unique to your TeamForge account.">
      <ResetPasswordForm token={token ?? ""} />
    </AuthLayout>
  );
}
