import React, { useState, useRef, useCallback } from "react";
import { productService } from "@/services/productService";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImageUpload({ images = [], onChange, maxImages = 10 }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Drag-to-reorder state
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const uploadFiles = useCallback(
    async (files) => {
      const remaining = maxImages - images.length;
      const filesToUpload = Array.from(files).slice(0, remaining);
      if (filesToUpload.length === 0) return;

      setUploading(true);
      try {
        const results = await Promise.all(
          filesToUpload.map((file) => productService.uploadImage(file)),
        );
        const newUrls = results
          .map((r) => r.data?.url || r.url)
          .filter(Boolean);
        onChange([...images, ...newUrls]);
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, maxImages],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) uploadFiles(files);
    },
    [uploadFiles],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files.length > 0) {
        uploadFiles(e.target.files);
      }
      e.target.value = "";
    },
    [uploadFiles],
  );

  const removeImage = useCallback(
    (index) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange],
  );

  // ── Drag-to-reorder handlers ──
  const handleItemDragStart = useCallback((e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    // Set a transparent drag image to avoid default ghost
    const el = e.currentTarget;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  }, []);

  const handleItemDragOver = useCallback((e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIdx(idx);
  }, []);

  const handleItemDragLeaveItem = useCallback(() => {
    setOverIdx(null);
  }, []);

  const handleItemDrop = useCallback(
    (e, toIdx) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragIdx === null || dragIdx === toIdx) {
        setDragIdx(null);
        setOverIdx(null);
        return;
      }
      const reordered = [...images];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(toIdx, 0, moved);
      onChange(reordered);
      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, images, onChange],
  );

  const handleItemDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Thumbnail Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              draggable
              onDragStart={(e) => handleItemDragStart(e, i)}
              onDragOver={(e) => handleItemDragOver(e, i)}
              onDragLeave={handleItemDragLeaveItem}
              onDrop={(e) => handleItemDrop(e, i)}
              onDragEnd={handleItemDragEnd}
              className={cn(
                "relative aspect-square rounded-lg border overflow-hidden group bg-slate-50 cursor-grab active:cursor-grabbing transition-all duration-150",
                dragIdx === i && "opacity-50 scale-95",
                overIdx === i &&
                  dragIdx !== i &&
                  "ring-2 ring-blue-500 ring-offset-1 scale-105",
                dragIdx === null && "border-slate-200",
              )}
            >
              <img
                src={url}
                alt={`Product image ${i + 1}`}
                className="h-full w-full object-cover pointer-events-none"
              />
              {/* Grip handle */}
              <div className="absolute top-1.5 left-1.5 bg-black/40 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50",
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-slate-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Drop images here or{" "}
                  <span className="text-blue-600">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, WEBP up to 5MB each · {images.length}/{maxImages}{" "}
                  uploaded · Drag to reorder
                </p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="image/*"
          />
        </div>
      )}
    </div>
  );
}
