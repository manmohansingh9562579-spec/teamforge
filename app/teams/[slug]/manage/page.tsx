import { redirect } from "next/navigation";
import { requireTeamOwner } from "@/lib/teamAccess";

export default async function ManageTeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireTeamOwner(slug);
  redirect(`/teams/${slug}/workspace`);
}
