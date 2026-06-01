import Link from "next/link";

interface SectionTitleProps {
  title: string;
  viewAllLink?: string;
}

export default function SectionTitle({ title, viewAllLink }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Xem thêm
        </Link>
      )}
    </div>
  );
}
