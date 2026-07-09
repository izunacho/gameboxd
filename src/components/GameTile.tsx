import Image from 'next/image';
import Link from 'next/link';
import { LibraryGame } from '@/lib/user-data';

/** Compact game card used in profile libraries (played/wishlist/liked grids). */
export default function GameTile({ game }: { game: LibraryGame }) {
  return (
    <Link href={`/game/${game.igdb_id}`}>
      <div className="card overflow-hidden group cursor-pointer">
        <div className="relative w-full aspect-[3/4] bg-dark-bg">
          {game.background_image ? (
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-dark-text text-xs text-center px-2">No cover</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2">{game.name}</h3>
          {game.released && (
            <p className="text-xs text-dark-text mt-1">
              {new Date(game.released).getFullYear()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
