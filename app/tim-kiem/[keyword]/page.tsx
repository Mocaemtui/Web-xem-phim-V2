import MovieCardWrapper from "@/components/MovieCardWrapper";
import SectionTitle from "@/components/SectionTitle";
import { searchPhim } from "@/lib/api";

interface PageProps {
  params: Promise<{
    keyword: string;
  }>;
}

export default async function SearchPage({ params }: PageProps) {
  const { keyword } = await params;
  const decodedKeyword = decodeURIComponent(keyword);
  const searchResults = await searchPhim(decodedKeyword);

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle title={`Kết quả tìm kiếm: &ldquo;${decodedKeyword}&rdquo;`} />
      
      {searchResults?.data?.items && searchResults.data.items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {searchResults.data.items.map((movie) => (
            <MovieCardWrapper key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-zinc-400 text-lg">
            Không tìm thấy phim nào với từ khóa &ldquo;{decodedKeyword}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
