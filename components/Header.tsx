"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, X, Filter, Clock } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pinnedCategories, setPinnedCategories] = useState<{ slug: string; name: string }[]>([]);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Mocaemtui";

  useEffect(() => {
    const loadPinned = () => {
      const stored = localStorage.getItem("pinned_categories");
      if (stored) {
        try {
          setPinnedCategories(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        setPinnedCategories([]);
      }
    };
    loadPinned();
    window.addEventListener("pinned_categories_changed", loadPinned);
    window.addEventListener("storage", loadPinned);
    return () => {
      window.removeEventListener("pinned_categories_changed", loadPinned);
      window.removeEventListener("storage", loadPinned);
    };
  }, []);

  const removePin = (slug: string) => {
    const stored = localStorage.getItem("pinned_categories");
    if (stored) {
      try {
        const current = JSON.parse(stored) as { slug: string; name: string }[];
        const filtered = current.filter(p => p.slug !== slug);
        localStorage.setItem("pinned_categories", JSON.stringify(filtered));
        setPinnedCategories(filtered);
        window.dispatchEvent(new Event("pinned_categories_changed"));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/tim-kiem/${encodeURIComponent(searchKeyword.trim())}`);
      setSearchOpen(false);
      setSearchKeyword("");
    }
  };  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <img src="/icon-192x192.png" alt="Mocaemtui Logo" className="w-8 h-8 rounded-full object-cover" />
            {siteName}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-300 hover:text-white transition-colors">
              Trang chủ
            </Link>
            <Link href="/filter" className="text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
              <Filter size={16} />
              Bộ lọc
            </Link>
            <Link href="/lich-su" className="text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
              <Clock size={16} />
              Lịch sử
            </Link>
            {pinnedCategories.length > 0 && (
              <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 ml-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Đã ghim:</span>
                <div className="flex items-center gap-2 max-w-[300px] overflow-x-auto no-scrollbar">
                  {pinnedCategories.map((cat) => (
                    <div
                      key={cat.slug}
                      className="flex items-center bg-zinc-900 hover:bg-zinc-800 text-yellow-500 border border-zinc-800/80 rounded-full pr-1.5 pl-2 py-0.5 transition-colors gap-1 text-xs whitespace-nowrap font-medium"
                    >
                      <Link href={`/filter?theLoai=${cat.slug}`} className="hover:text-yellow-400">
                        📌 {cat.name}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removePin(cat.slug);
                        }}
                        className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors ml-0.5 text-[10px]"
                        title="Xóa ghim"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Search & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-zinc-800">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-800 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-zinc-800">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Trang chủ
              </Link>
              <Link href="/filter" className="text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
                <Filter size={16} />
                Bộ lọc
              </Link>
              <Link href="/lich-su" className="text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
                <Clock size={16} />
                Lịch sử
              </Link>
              {pinnedCategories.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-3 mt-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Danh mục đã ghim:</span>
                  <div className="flex flex-wrap gap-2">
                    {pinnedCategories.map((cat) => (
                      <div
                        key={cat.slug}
                        className="flex items-center bg-zinc-900 hover:bg-zinc-800 text-yellow-500 border border-zinc-800/80 rounded-full pr-2 pl-3 py-1 transition-colors gap-1.5 text-xs font-medium"
                      >
                        <Link href={`/filter?theLoai=${cat.slug}`} className="hover:text-yellow-400">
                          📌 {cat.name}
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removePin(cat.slug);
                          }}
                          className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors ml-1 text-[11px]"
                          title="Xóa ghim"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
