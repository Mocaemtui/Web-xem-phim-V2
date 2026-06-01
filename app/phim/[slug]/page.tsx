import { notFound } from "next/navigation";
import MovieDetail from "@/components/MovieDetail";
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
    notFound();
  }

  return (
    <MovieDetail
      movie={movieData.data.item}
      images={imagesData?.data || { images: [] }}
      peoples={peoplesData?.data || { peoples: [] }}
    />
  );
}
