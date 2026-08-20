/**
 * FileUpload — componente reutilizável de upload de ficheiros para o backoffice
 * Suporta imagens (jpg, png, webp) e documentos (pdf)
 * Converte para base64 e envia via tRPC para S3
 */

import { useState, useRef } from "react";
import { Upload, FileText, Image } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FileUploadProps {
  label: string;
  accept: string; // e.g. "image/*" or ".pdf,application/pdf"
  folder?: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  maxSizeMB?: number;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#6B7280",
  marginBottom: "0.35rem",
};

export function FileUpload({ label, accept, folder = "backoffice", currentUrl, onUpload, maxSizeMB = 10 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMut = trpc.upload.file.useMutation({
    onSuccess: (data) => {
      onUpload(data.url);
      setUploading(false);
      setError(null);
    },
    onError: (err) => {
      setError("Erro ao fazer upload: " + err.message);
      setUploading(false);
    },
  });

  const isImage = accept.includes("image");

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ficheiro demasiado grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    // Preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    // Convert to base64 and upload
    setUploading(true);
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
    const base64 = btoa(binary);

    uploadMut.mutate({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      data: base64,
      folder,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: "2px dashed #D0E2EC",
          borderRadius: "4px",
          padding: "1rem",
          cursor: "pointer",
          background: uploading ? "#F0F7FB" : "white",
          transition: "all 0.2s",
          textAlign: "center",
          minHeight: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        {uploading ? (
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#25749F" }}>
            A fazer upload...
          </div>
        ) : preview && isImage ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxHeight: "120px", maxWidth: "100%", objectFit: "contain", borderRadius: "2px" }}
            />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "#9CA3AF" }}>
              Clique ou arraste para substituir
            </span>
          </div>
        ) : preview && !isImage ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ color: "#25749F" }}><FileText size={32} /></div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "#25749F", wordBreak: "break-all" }}>
              Ficheiro carregado
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.68rem", color: "#9CA3AF" }}>
              Clique ou arraste para substituir
            </span>
          </div>
        ) : (
          <>
            <div style={{ color: "#9CA3AF" }}>{isImage ? <Image size={24} /> : <FileText size={24} />}</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B7280" }}>
              Clique ou arraste o ficheiro aqui
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.68rem", color: "#9CA3AF" }}>
              {isImage ? "JPG, PNG, WEBP" : "PDF"} · Máx. {maxSizeMB}MB
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {/* Current URL display */}
      {currentUrl && !preview?.startsWith("data:") && (
        <div style={{ marginTop: "0.4rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.68rem", color: "#9CA3AF", wordBreak: "break-all" }}>
          URL atual: {currentUrl.length > 60 ? currentUrl.substring(0, 60) + "..." : currentUrl}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "0.4rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "#DC2626" }}>
          {error}
        </div>
      )}
    </div>
  );
}
