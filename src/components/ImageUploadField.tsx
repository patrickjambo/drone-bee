'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { compressImageFile } from '@/lib/image';

export default function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return; }
    setErr('');
    setBusy(true);
    try {
      onChange(await compressImageFile(file));
    } catch {
      setErr('Could not process that image — try another.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
        className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 bg-[#F4F7FE] overflow-hidden flex items-center justify-center cursor-pointer hover:border-amber-400 transition"
      >
        {value ? (
          <>
            <img src={value} alt="Product preview" className="w-full h-full object-cover" />
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition">
              <X size={14} />
            </button>
          </>
        ) : busy ? (
          <div className="text-amber-500 flex flex-col items-center gap-2"><Loader2 size={28} className="animate-spin" /><span className="text-xs font-semibold">Processing…</span></div>
        ) : (
          <div className="text-center text-gray-400 p-4">
            <Upload size={28} className="mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">Upload product photo</p>
            <p className="text-xs">Click or drag a file · or paste a URL below</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
      <input
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://… image URL (optional)"
        className="w-full mt-2 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      {err && <p className="text-xs text-red-500 mt-1.5">{err}</p>}
    </div>
  );
}
