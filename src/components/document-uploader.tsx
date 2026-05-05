"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 10 * 1024 * 1024;

export function DocumentUploader() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setStatus(`File too large (max ${MAX_BYTES / 1024 / 1024} MB)`);
      return;
    }

    setLoading(true);
    setStatus("Uploading...");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "bin";
      const filePath = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(filePath, file, {
          upsert: false,
          contentType:
            file.type ||
            (ext === "pdf" ? "application/pdf" : "application/octet-stream"),
        });

      if (uploadError) throw uploadError;

      const type =
        ext.toLowerCase() === "pdf"
          ? "cv_pdf"
          : ext.toLowerCase() === "docx" || ext.toLowerCase() === "doc"
            ? "cv_word"
            : "other";

      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        name: file.name,
        type,
        file_path: filePath,
        size_bytes: file.size,
      });

      if (dbError) throw dbError;

      setStatus("Uploaded successfully.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center text-sm ${
          isDragActive
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-300 bg-gray-50 text-gray-600"
        }`}
      >
        <input {...getInputProps()} />
        {loading
          ? "Uploading file..."
          : "Drop your PDF/DOCX CV here, or click to select"}
      </div>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </div>
  );
}
