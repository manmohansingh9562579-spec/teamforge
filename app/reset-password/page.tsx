import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  return (
    <AuthLayout title="Choose a new password" subtitle="Make it strong and unique to your TeamForge account.">
      <ResetPasswordForm token={searchParams?.token ?? ""} />
    </AuthLayout>
  );
}
