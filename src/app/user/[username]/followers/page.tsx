import PublicFollowClient from '../public-follow-client';

export default async function UserFollowersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  return <PublicFollowClient username={decodeURIComponent(resolvedParams.username)} kind="followers" />;
}
