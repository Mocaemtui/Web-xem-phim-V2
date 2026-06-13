import { notFound } from "next/navigation";
import MovieDetail from "@/components/MovieDetail";
import MovieDetailClientLoader from "@/components/MovieDetailClientLoader";
import { getChiTietPhim, getHinhAnhPhim, getPeoplesPhim } from "@/lib/api";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MoviePage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  if (!decodedSlug || decodedSlug === "undefined") {
    notFound();
  }

  const [movieData, imagesData, peoplesData] = await Promise.all([
    getChiTietPhim(decodedSlug),
    getHinhAnhPhim(decodedSlug),
    getPeoplesPhim(decodedSlug),
  ]);

  if (!movieData || !movieData.data || !movieData.data.item) {
    // If server fails (due to Vercel blocking NguonC), fallback to client-side loading
    return <MovieDetailClientLoader slug={decodedSlug} type="phim" />;
  }

  const movie = movieData.data.item;



  return (
    <>
      <MovieDetail
        movie={movie}
        images={imagesData?.data || { images: [] }}
        peoples={peoplesData?.data || { peoples: [] }}
      />


    </>
  );
}
