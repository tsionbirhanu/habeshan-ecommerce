import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestions = [],
  placeholder = "Search products...",
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-full border-2 border-gray-200 focus:border-maroon focus:ring-2 focus:ring-maroon/10 transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-maroon transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
          {suggestions
            .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-maroon/5 hover:text-maroon transition-colors border-b border-gray-100 last:border-0">
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
