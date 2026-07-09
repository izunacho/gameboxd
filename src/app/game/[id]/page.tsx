import GameDetailClient from './game-detail-client';

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const gameId = resolvedParams.id;

  return <GameDetailClient gameId={gameId} />;
}
