"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, X, Filter } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            <Link href="/filter" className="text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
              <Filter size={16} />
              Bộ lọc
            </Link>
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
