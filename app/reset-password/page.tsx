import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/developers/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — TeamForge",
  referrer: "no-referrer",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResetPasswordForm token={typeof searchParams.token === "string" ? searchParams.token : ""} />;
}
