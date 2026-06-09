import MovieCardWrapper from "@/components/MovieCardWrapper";
import SectionTitle from "@/components/SectionTitle";
import HomeHistorySection from "@/components/HomeHistorySection";
import { getPhimMoi, getDanhSach } from "@/lib/api";

export default async function Home() {
  const [
    phimMoiData,
    phimVietData,
    phimAuMyData,
    phimHanData,
    phimNhatData,
    phimTrungData,
    animeData,
    cartoonData,
    longTiengData,
    thuyetMinhData,
  ] = await Promise.all([
    getPhimMoi(1, 12),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "viet-nam" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "au-my" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "han-quoc" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "nhat-ban" }),
    getDanhSach("phim-moi", { page: 1, limit: 12, country: "trung-quoc" }),
    getDanhSach("hoat-hinh", { page: 1, limit: 12, country: "nhat-ban" }),
    getDanhSach("hoat-hinh", { page: 1, limit: 12, country: "au-my" }),
    getDanhSach("phim-long-tieng", { page: 1, limit: 12 }),
    getDanhSach("phim-thuyet-minh", { page: 1, limit: 12 }),
  ]);

  if (!phimMoiData) {
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
      {/* 1. Lịch Sử Section (Client-side) */}
      <HomeHistorySection />

      {/* 2. Anime Section */}
      <section className="mb-12">
        <SectionTitle title="Anime" viewAllLink="/anime" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animeData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 3. Cartoon Section */}
      <section className="mb-12">
        <SectionTitle title="Cartoon" viewAllLink="/cartoon" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cartoonData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 4. Phim Mới Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Mới" viewAllLink="/phim-moi" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimMoiData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 5. Phim Việt Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Việt" viewAllLink="/phim-viet" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimVietData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 6. Phim Âu Mỹ Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Âu Mỹ" viewAllLink="/phim-au-my" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimAuMyData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 7. Phim Nhật Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Nhật" viewAllLink="/phim-nhat" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimNhatData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 8. Phim Hàn Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Hàn" viewAllLink="/phim-han" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimHanData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 9. Phim Trung Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Trung" viewAllLink="/phim-trung" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phimTrungData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 10. Phim Thuyết Minh Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Thuyết Minh" viewAllLink="/phim-thuyet-minh" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {thuyetMinhData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>

      {/* 11. Phim Lồng Tiếng Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Lồng Tiếng" viewAllLink="/phim-long-tieng" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {longTiengData?.data?.items?.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          )) || []}
        </div>
      </section>
    </div>
  );
}
