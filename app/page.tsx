import { PeterDemo } from "@/components/PeterDemo";
import { getConfiguredSnapshots, hasGithubConnection } from "@/lib/githubIncredibuild";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshots = await getConfiguredSnapshots();
  const defaultOrg = hasGithubConnection() ? "incredibuild" : "supabase";

  return <PeterDemo defaultOrg={defaultOrg} snapshots={snapshots} />;
}
