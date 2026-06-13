import { notFound } from "next/navigation";
import WatchPageClient from "@/components/WatchPageClient";
import MovieDetailClientLoader from "@/components/MovieDetailClientLoader";
import { getChiTietPhim } from "@/lib/api";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  if (!decodedSlug || decodedSlug === "undefined") {
    notFound();
  }

  const movieData = await getChiTietPhim(decodedSlug);

  if (!movieData || !movieData.data || !movieData.data.item) {
    // Fallback client-side NguonC fetch
    return <MovieDetailClientLoader slug={decodedSlug} type="xem-phim" />;
  }

  const movie = movieData.data.item;
  const posterUrl = movie.poster_url.startsWith('http') ? movie.poster_url : `https://img.ophim.live/uploads/movies/${movie.poster_url}`;



  return (
    <>
      <WatchPageClient movie={movie} posterUrl={posterUrl} />


    </>
  );
}
