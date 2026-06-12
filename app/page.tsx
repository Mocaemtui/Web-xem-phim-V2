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
    <div className="container mx-auto px-4 py-8 overflow-hidden">
      {/* 1. Lịch Sử Section (Client-side) */}
      <HomeHistorySection />

      {/* 2. Anime Section */}
      <section className="mb-12">
        <SectionTitle title="Anime" viewAllLink="/anime" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {animeData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 3. Cartoon Section */}
      <section className="mb-12">
        <SectionTitle title="Cartoon" viewAllLink="/cartoon" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {cartoonData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 4. Phim Mới Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Mới" viewAllLink="/phim-moi" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {phimMoiData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 5. Phim Việt Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Việt" viewAllLink="/phim-viet" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {phimVietData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 6. Phim Âu Mỹ Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Âu Mỹ" viewAllLink="/phim-au-my" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {phimAuMyData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 7. Phim Nhật Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Nhật" viewAllLink="/phim-nhat" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {phimNhatData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 8. Phim Hàn Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Hàn" viewAllLink="/phim-han" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {phimHanData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 9. Phim Trung Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Trung" viewAllLink="/phim-trung" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {phimTrungData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 10. Phim Thuyết Minh Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Thuyết Minh" viewAllLink="/phim-thuyet-minh" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {thuyetMinhData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>

      {/* 11. Phim Lồng Tiếng Section */}
      <section className="mb-12">
        <SectionTitle title="Phim Lồng Tiếng" viewAllLink="/phim-long-tieng" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth snap-x">
          {longTiengData?.data?.items?.slice(0, 10).map((movie) => (
            <div key={movie._id} className="w-[140px] sm:w-[160px] md:w-[180px] shrink-0 snap-start">
              <MovieCardWrapper movie={movie} />
            </div>
          )) || []}
        </div>
      </section>
    </div>
  );
}
