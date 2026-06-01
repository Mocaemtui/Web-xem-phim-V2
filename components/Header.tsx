"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "MovieHub";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/tim-kiem/${encodeURIComponent(searchKeyword.trim())}`);
      setSearchOpen(false);
      setSearchKeyword("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            {siteName}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-300 hover:text-white transition-colors">
              Trang chủ
            </Link>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Lọc phim
                <ChevronDown size={16} />
              </button>
              {filterOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-4">
                  <Link
                    href="/the-loai"
                    className="block py-2 text-sm text-zinc-300 hover:text-white transition-colors"
                    onClick={() => setFilterOpen(false)}
                  >
                    Theo thể loại
                  </Link>
                  <Link
                    href="/quoc-gia"
                    className="block py-2 text-sm text-zinc-300 hover:text-white transition-colors"
                    onClick={() => setFilterOpen(false)}
                  >
                    Theo quốc gia
                  </Link>
                  <Link
                    href="/nam"
                    className="block py-2 text-sm text-zinc-300 hover:text-white transition-colors"
                    onClick={() => setFilterOpen(false)}
                  >
                    Theo năm
                  </Link>
                </div>
              )}
            </div>
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
              <Link href="/the-loai" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Theo thể loại
              </Link>
              <Link href="/quoc-gia" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Theo quốc gia
              </Link>
              <Link href="/nam" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Theo năm
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
