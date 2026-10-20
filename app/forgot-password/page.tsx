import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot your password?" subtitle="We’ll email you a secure link to choose a new one.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
