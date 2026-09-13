import { useRef, useState } from "react";
import { UploadCloud, Camera, ImageOff, X } from "lucide-react";
import Button from "./Button.jsx";

/**
 * Large upload surface for a civic issue photo.
 * Supports click-to-browse, drag & drop, and a "Take Photo" input that
 * hints the device camera via the `capture` attribute on mobile browsers.
 *
 * Props:
 *  - image: { file, url } | null
 *  - onImageSelected(file)
 *  - onClear()
 */
export default function ImageUploader({ image, onImageSelected, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelected(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (image) {
    return (
      <div className="overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-card">
        <div className="relative">
          <img src={image.url} alt="Selected civic issue preview" className="max-h-[420px] w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove selected photo"
            className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-ink-900/70 text-white backdrop-blur hover:bg-ink-900"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <p className="truncate text-sm text-ink-500">{image.file.name}</p>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 cursor-pointer text-sm font-medium text-signal-600 hover:text-signal-700"
          >
            Choose a different photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center rounded-xl2 border-2 border-dashed bg-white px-6 py-16 text-center transition-colors ${
        isDragging ? "border-signal-400 bg-signal-50/50" : "border-ink-100"
      }`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-civic-50 text-civic-600">
        <UploadCloud className="h-6 w-6" strokeWidth={2} />
      </span>

      <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">
        Upload a photo of the civic problem
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">
        Drag and drop an image here, or choose a file. JPG or PNG works best.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="signal" icon={UploadCloud} onClick={() => fileInputRef.current?.click()}>
          Upload Image
        </Button>
        <Button variant="outline" icon={Camera} onClick={() => cameraInputRef.current?.click()}>
          Take Photo
        </Button>
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-xs text-ink-300">
        <ImageOff className="h-3.5 w-3.5" strokeWidth={2} />
        Photos stay on your device for this preview — nothing is uploaded yet.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
