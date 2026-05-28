'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface NominatimSearchProps {
  onPlaceSelect: (lat: number, lng: number, name: string) => void;
}

export default function NominatimSearch({ onPlaceSelect }: NominatimSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        // Query local proxy API to comply with OpenStreetMap User-Agent policy
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Location search error:", e);
      } finally {
        setLoading(false);
      }
    }, 400); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Reset keyboard focus whenever search results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [results]);

  const selectItem = (item: any) => {
    const displayNameParts = item.display_name.split(',');
    const shortName = displayNameParts[0];
    onPlaceSelect(parseFloat(item.lat), parseFloat(item.lon), shortName);
    setResults([]);
    setQuery(shortName);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        selectItem(results[focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setResults([]);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="relative w-full z-20">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {loading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
      </div>
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={results.length > 0}
        aria-controls="nominatim-search-results"
        className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 outline-none font-sans"
        placeholder="Cari nama kota atau tempat di Indonesia (misal: Cikarang)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {results.length > 0 && (
        <div 
          id="nominatim-search-results"
          role="listbox"
          className="absolute top-full mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-30 max-h-60 overflow-y-auto"
        >
          {results.map((item, idx) => {
            const displayNameParts = item.display_name.split(',');
            const shortName = displayNameParts[0];
            const contextText = displayNameParts.slice(1).join(',').trim();
            const isFocused = idx === focusedIndex;

            return (
              <button
                key={idx}
                type="button"
                role="option"
                aria-selected={isFocused}
                className={`w-full text-left px-4 py-3 text-sm border-b border-zinc-700 last:border-b-0 transition-colors block text-white ${
                  isFocused ? 'bg-zinc-700' : 'hover:bg-zinc-700/60'
                }`}
                onClick={() => selectItem(item)}
              >
                <div className="font-semibold">{shortName}</div>
                <div className="text-xs text-zinc-400 truncate mt-1">{contextText}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
