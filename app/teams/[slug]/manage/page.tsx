import { redirect } from "next/navigation";
import { requireTeamOwner } from "@/lib/teamAccess";

export default async function ManageTeamPage({ params }: { params: { slug: string } }) {
  await requireTeamOwner(params.slug);
  redirect(`/teams/${params.slug}/workspace`);
}
