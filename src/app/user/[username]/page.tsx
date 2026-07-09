import PublicProfileClient from './public-profile-client';

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  return <PublicProfileClient username={decodeURIComponent(resolvedParams.username)} />;
}
