import { notFound } from "next/navigation";
import { getChiTietPhim } from "@/lib/api";
import WatchTogetherClient from "@/components/WatchTogetherClient";

interface PageProps {
  params: Promise<{
    movieSlug: string;
    roomId: string;
  }>;
}

export default async function WatchTogetherPage({ params }: PageProps) {
  const { movieSlug, roomId } = await params;
  const decodedSlug = decodeURIComponent(movieSlug);

  if (!decodedSlug || !roomId) {
    notFound();
  }

  const movieData = await getChiTietPhim(decodedSlug);

  if (!movieData || !movieData.data || !movieData.data.item) {
    notFound();
  }

  const movie = movieData.data.item;
  const posterUrl = movie.poster_url.startsWith('http') ? movie.poster_url : `https://img.ophim.live/uploads/movies/${movie.poster_url}`;

  return (
    <WatchTogetherClient movie={movie} posterUrl={posterUrl} roomId={roomId} />
  );
}
