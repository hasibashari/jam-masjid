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

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=id&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Nominatim search error:", e);
      } finally {
        setLoading(false);
      }
    }, 400); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative w-full z-20">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {loading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
      </div>
      <input
        type="text"
        className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 outline-none font-sans"
        placeholder="Cari nama kota atau tempat di Indonesia (misal: Cikarang)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-30 max-h-60 overflow-y-auto">
          {results.map((item, idx) => {
            const displayNameParts = item.display_name.split(',');
            const shortName = displayNameParts[0];
            const contextText = displayNameParts.slice(1).join(',').trim();
            return (
              <button
                key={idx}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-zinc-700 text-sm border-b border-zinc-700 last:border-b-0 transition-colors block text-white"
                onClick={() => {
                  onPlaceSelect(parseFloat(item.lat), parseFloat(item.lon), shortName);
                  setResults([]);
                  setQuery(shortName);
                }}
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
