import MovieCardWrapper from "@/components/MovieCardWrapper";
import SectionTitle from "@/components/SectionTitle";
import { getPhimMoi, getPhimBo } from "@/lib/api";

export default async function Home() {
  const [phimMoiData, phimBoData] = await Promise.all([
    getPhimMoi(1, 12),
    getPhimBo(1, 12),
  ]);

  if (!phimMoiData || !phimBoData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-zinc-400 text-lg">
            Không thể tải dữ liệu từ API. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Phim Mới Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Mới" viewAllLink="/phim-moi" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimMoiData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* Phim Bộ Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Bộ" viewAllLink="/phim-bo" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimBoData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>
    </div>
  );
}
