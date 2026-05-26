'use client';

import { useState } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import NominatimSearch from './NominatimSearch';

const MapPicker = dynamic(() => import('./MapPicker'), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <span className="text-sm font-medium">Memuat Peta...</span>
    </div>
  )
});

interface LocationPickerModalProps {
  onClose: () => void;
  onSave: (lat: number, lng: number, placeName: string) => void;
  initialLat: number;
  initialLng: number;
}

export default function LocationPickerModal({ onClose, onSave, initialLat, initialLng }: LocationPickerModalProps) {
  const [center, setCenter] = useState({ lat: initialLat, lng: initialLng });
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handlePlaceSelect = (lat: number, lng: number, name: string) => {
    setCenter({ lat, lng });
    setSelectedPlaceName(name);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCenter({ lat, lng });
    setSelectedPlaceName("Lokasi Pilihan");
  };

  const getUserLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          setSelectedPlaceName("Lokasi Saat Ini");
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Gagal mendapatkan lokasi. Pastikan izin lokasi browser Anda aktif.");
          setIsGettingLocation(false);
        }
      );
    } else {
      alert("Geolocation tidak didukung oleh browser anda");
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh] text-white">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold font-sans">Pengaturan Lokasi</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-4 overflow-hidden relative">
          
          <div className="flex flex-col md:flex-row gap-4 mb-2 z-20">
            <NominatimSearch onPlaceSelect={handlePlaceSelect} />
            <button 
              onClick={getUserLocation}
              disabled={isGettingLocation}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
            >
              {isGettingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
              Gunakan Lokasi Saat Ini
            </button>
          </div>

          <div className="flex-1 w-full bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 relative z-0">
            <MapPicker 
              center={center} 
              onLocationSelect={handleMapClick} 
            />
          </div>

          <div className="mt-2 text-sm text-zinc-400 flex flex-col md:flex-row justify-between gap-1">
            <span>Anda dapat memilih lokasi secara manual dengan mengklik pada peta.</span>
            <span className="font-mono text-emerald-400 shrink-0">
              Lat: {center.lat.toFixed(5)}, Lng: {center.lng.toFixed(5)} {selectedPlaceName ? `(${selectedPlaceName})` : ''}
            </span>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-4 bg-zinc-950">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 text-white transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => onSave(center.lat, center.lng, selectedPlaceName)}
            className="px-8 py-3 bg-[#D4AF37] text-zinc-950 rounded-lg text-sm font-bold hover:bg-[#FBE18D] transition-colors shadow-none"
          >
            Simpan Lokasi
          </button>
        </div>

      </div>
    </div>
  );
}
