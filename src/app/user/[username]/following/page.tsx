import PublicFollowClient from '../public-follow-client';

export default async function UserFollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  return <PublicFollowClient username={decodeURIComponent(resolvedParams.username)} kind="following" />;
}
