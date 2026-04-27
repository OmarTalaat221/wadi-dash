import { useState } from "react";
import axios from "axios";
import { base_url } from "../utils/base_url";

export function usePDFUpload() {
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const uploadPDF = async (file, onProgress) => {
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axios.post(
        `${base_url}/user/item_pdf_uploader.php`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const uploadMultiplePDFs = async (files, onFileUpdate) => {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${Date.now()}_${i}`;

      // Add file to uploading list
      setUploadingFiles((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "uploading",
          url: null,
          error: null,
        },
      ]);

      onFileUpdate(fileId, { status: "uploading", progress: 0 });

      try {
        const result = await uploadPDF(file, (progress) => {
          setUploadingFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
          );
          onFileUpdate(fileId, { progress });
        });

        const url =
          result.url ||
          result.file_url ||
          result.pdf_url ||
          result.data?.url ||
          result.message;

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: "done", url } : f
          )
        );

        onFileUpdate(fileId, { status: "done", progress: 100, url });

        results.push({ fileId, name: file.name, url, success: true });
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "error", error: error.message }
              : f
          )
        );

        onFileUpdate(fileId, {
          status: "error",
          error: error.message || "Upload failed",
        });

        results.push({
          fileId,
          name: file.name,
          url: null,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  };

  return { uploadingFiles, uploadMultiplePDFs };
}
