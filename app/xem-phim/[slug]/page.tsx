import { notFound } from "next/navigation";
import WatchPageClient from "@/components/WatchPageClient";
import MovieCardWrapper from "@/components/MovieCardWrapper";
import SectionTitle from "@/components/SectionTitle";
import { getChiTietPhim, getPhimMoi } from "@/lib/api";

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

  const [movieData, phimMoiData] = await Promise.all([
    getChiTietPhim(decodedSlug),
    getPhimMoi(1, 8),
  ]);

  if (!movieData || !movieData.data || !movieData.data.item) {
    notFound();
  }

  const movie = movieData.data.item;
  const posterUrl = movie.poster_url.startsWith('http') ? movie.poster_url : `https://img.ophim.live/uploads/movies/${movie.poster_url}`;

  return (
    <>
      <WatchPageClient movie={movie} posterUrl={posterUrl} />

      {/* Related Movies */}
      <section className="container mx-auto px-4 py-8">
        <SectionTitle title="Phim liên quan" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimMoiData?.data?.items
            ?.filter((item) => item._id !== movie._id)
            ?.slice(0, 8)
            ?.map((movie) => (
              <MovieCardWrapper key={movie._id} movie={movie} />
            )) || []}
        </div>
      </section>
    </>
  );
}
