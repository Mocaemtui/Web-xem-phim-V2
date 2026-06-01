import MovieCardWrapper from "@/components/MovieCardWrapper";
import SectionTitle from "@/components/SectionTitle";
import {
  getPhimMoi,
  getPhimBo,
  getPhimLe,
  getDanhSach,
} from "@/lib/api";

export default async function Home() {
  const [
    phimMoiData,
    phimBoData,
    phimLeData,
    phimVietData,
    phimAuMyData,
    phimHanData,
    phimNhatData,
    phimTrungData,
  ] = await Promise.all([
    getPhimMoi(1, 12),
    getPhimBo(1, 12),
    getPhimLe(1, 12),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "viet-nam" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "au-my" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "han-quoc" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "nhat-ban" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "trung-quoc" }),
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

      {/* Phim Lẻ Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Lẻ" viewAllLink="/phim-le" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimLeData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* Phim Việt Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Việt" viewAllLink="/phim-viet" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimVietData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* Phim Âu Mỹ Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Âu Mỹ" viewAllLink="/phim-au-my" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimAuMyData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* Phim Hàn Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Hàn" viewAllLink="/phim-han" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimHanData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* Phim Nhật Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Nhật" viewAllLink="/phim-nhat" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimNhatData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* Phim Trung Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Trung" viewAllLink="/phim-trung" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimTrungData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>
    </div>
  );
}
