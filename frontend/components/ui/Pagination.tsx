import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPages = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage - delta > 1) {
      pages.unshift("...");
      pages.unshift(1);
    }

    if (currentPage + delta < totalPages) {
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 hover:bg-maroon/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={20} className="text-maroon" />
      </button>

      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
              currentPage === page
                ? "bg-maroon text-white shadow-md"
                : "hover:bg-maroon/10 text-maroon"
            }`}>
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 hover:bg-maroon/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <ChevronRight size={20} className="text-maroon" />
      </button>
    </div>
  );
};
