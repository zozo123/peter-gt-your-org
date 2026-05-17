import { PeterDemo } from "@/components/PeterDemo";
import { configuredOrgSlug, getConfiguredSnapshots } from "@/lib/liveGithub";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshots = await getConfiguredSnapshots();
  const defaultOrg = configuredOrgSlug() ?? "supabase";

  return <PeterDemo defaultOrg={defaultOrg} snapshots={snapshots} />;
}
