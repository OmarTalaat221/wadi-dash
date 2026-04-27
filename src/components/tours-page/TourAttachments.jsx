import React, { useRef, useState } from "react";
import { message } from "antd";
import { usePDFUpload } from "../../hooks/usePDFUpload";
import { MdDelete, MdCloudUpload, MdPictureAsPdf } from "react-icons/md";
import { FaDownload, FaEye } from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import { base_url } from "../../utils/base_url";

function TourAttachments({ formData, setFormData }) {
  const fileInputRef = useRef(null);
  const { uploadMultiplePDFs } = usePDFUpload();

  // Each attachment: { id, name, url, size, progress, status, error }
  const [attachments, setAttachments] = useState(formData.attachments || []);

  const syncToFormData = (updated) => {
    setAttachments(updated);
    setFormData((prev) => ({ ...prev, attachments: updated }));
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf"
    );

    if (files.length === 0) {
      message.error("Please select PDF files only");
      return;
    }

    // Add pending entries immediately so user sees them
    const pendingEntries = files.map((file, i) => ({
      id: `pending_${Date.now()}_${i}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
      url: null,
      error: null,
    }));

    setAttachments((prev) => {
      const updated = [...prev, ...pendingEntries];
      setFormData((fd) => ({ ...fd, attachments: updated }));
      return updated;
    });

    // Upload each file progressively
    await uploadMultiplePDFs(files, (fileId, update) => {
      // Match by position using index in pendingEntries
      const pendingEntry = pendingEntries.find(
        (_, idx) =>
          fileId ===
          `pending_${parseInt(fileId.split("_")[1])}_${parseInt(fileId.split("_")[2])}`
      );

      setAttachments((prev) => {
        const updated = prev.map((att) => {
          // Match the pending entry by checking if the id starts with pending_ and ends with the right index
          if (att.id === fileId) {
            return { ...att, ...update };
          }
          return att;
        });

        // Also check for the sequential uploads
        const target = pendingEntries.find((pe) => pe.id === fileId);
        if (!target) {
          // Update by matching pending_ prefix
          const mapped = prev.map((att) => {
            if (att.status === "uploading" && att.id === fileId) {
              return { ...att, ...update };
            }
            return att;
          });
          setFormData((fd) => ({ ...fd, attachments: mapped }));
          return mapped;
        }

        setFormData((fd) => ({ ...fd, attachments: updated }));
        return updated;
      });
    });

    e.target.value = "";
  };

  // Simpler approach - override the upload function to properly track by id
  // inside TourAttachments.jsx
  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (files.length === 0) return;

    // 1. Create entry objects for all selected files first
    const newEntries = files.map((file, i) => ({
      id: `file_${Date.now()}_${i}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
      url: null,
      _file: file, // temporary store to upload
    }));

    // 2. Add to UI immediately
    setAttachments((prev) => {
      const updated = [...prev, ...newEntries];
      setFormData((fd) => ({ ...fd, attachments: updated }));
      return updated;
    });

    // 3. Sequential Loop (For-Each) for Progressive Upload
    for (const entry of newEntries) {
      await uploadSingle(entry);
    }
    e.target.value = "";
  };
  const uploadSingle = async (entry) => {
    const { default: axios } = await import("axios");

    // Create FormData for the request
    const axiosFormData = new FormData();
    axiosFormData.append("pdf", entry._file);

    try {
      // Single Axios call handling both the upload and the progress tracking
      const result = await axios.post(
        `${base_url}/user/item_pdf_uploader.php`,
        axiosFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            updateEntry(entry.id, { progress: percent });
          },
        }
      );

      // Extract URL from your specific API response structure
      const url =
        result.data?.url ||
        result.data?.file_url ||
        result.data?.pdf_url ||
        result.data?.data?.url ||
        result.data?.message;

      // Update the state to 'done' and save the URL
      updateEntry(entry.id, {
        progress: 100,
        status: "done",
        url: url,
        _file: undefined, // Clear the file object from memory
      });

      message.success(`"${entry.name}" uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);

      updateEntry(entry.id, {
        status: "error",
        error:
          error.response?.data?.message || error.message || "Upload failed",
        _file: undefined,
      });

      message.error(`Failed to upload "${entry.name}"`);
    }
  };

  const updateEntry = (id, updates) => {
    setAttachments((prev) => {
      const updated = prev.map((att) =>
        att.id === id ? { ...att, ...updates } : att
      );
      setFormData((fd) => ({ ...fd, attachments: updated }));
      return updated;
    });
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const updated = prev.filter((att) => att.id !== id);
      setFormData((fd) => ({ ...fd, attachments: updated }));
      return updated;
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "uploading":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "done":
        return "Uploaded";
      case "error":
        return "Failed";
      case "uploading":
        return "Uploading...";
      default:
        return "Pending";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Tour Attachments</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload e-books, PDFs, or any documents for this tour
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
          {attachments.filter((a) => a.status === "done").length} uploaded
        </span>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-all duration-200"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter(
            (f) => f.type === "application/pdf"
          );
          if (files.length > 0) {
            const dataTransfer = new DataTransfer();
            files.forEach((f) => dataTransfer.items.add(f));
            fileInputRef.current.files = dataTransfer.files;
            handleFilesUpload({ target: fileInputRef.current });
          } else {
            message.error("Only PDF files are accepted");
          }
        }}
      >
        <MdCloudUpload className="text-5xl text-blue-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold text-base">
          Click to upload or drag & drop PDF files
        </p>
        <p className="text-gray-400 text-sm mt-1">
          PDF files only — you can upload multiple files at once
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFilesUpload}
        />
      </div>

      {/* Files List */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Files ({attachments.length})
          </h4>

          {attachments.map((att) => (
            <div
              key={att.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* PDF Icon */}
                <div className="bg-red-50 p-3 rounded-lg shrink-0">
                  <MdPictureAsPdf className="text-red-500 text-2xl" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {att.name}
                    </p>
                    <span
                      className={`text-xs font-semibold shrink-0 ${getStatusColor(
                        att.status
                      )}`}
                    >
                      {getStatusLabel(att.status)}
                    </span>
                  </div>

                  {att.size && (
                    <p className="text-xs text-gray-400 mb-2">
                      {formatSize(att.size)}
                    </p>
                  )}

                  {/* Progress Bar */}
                  {att.status === "uploading" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-blue-600 font-medium">
                          Uploading...
                        </span>
                        <span className="text-xs text-blue-600 font-bold">
                          {att.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${att.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {att.status === "error" && (
                    <p className="text-xs text-red-500 mt-1">{att.error}</p>
                  )}

                  {/* Success - show URL actions */}
                  {att.status === "done" && att.url && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-gray-50 rounded px-2 py-1 border">
                        <p className="text-xs text-gray-500 truncate">
                          {att.url}
                        </p>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Preview"
                      >
                        <FaEye size={14} />
                      </a>
                      <a
                        href={att.url}
                        download
                        className="text-green-500 hover:text-green-700 transition-colors"
                        title="Download"
                      >
                        <FaDownload size={14} />
                      </a>
                    </div>
                  )}

                  {/* Done progress bar (full green) */}
                  {att.status === "done" && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div className="bg-green-500 h-1.5 rounded-full w-full" />
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  disabled={att.status === "uploading"}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {attachments.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <MdPictureAsPdf className="text-5xl mx-auto mb-2 opacity-30" />
          <p className="text-sm">No attachments yet</p>
        </div>
      )}

      {/* Summary */}
      {attachments.some((a) => a.status === "uploading") && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <CircularProgress size={16} />
          <span className="text-sm text-blue-700 font-medium">
            Uploading{" "}
            {attachments.filter((a) => a.status === "uploading").length} file(s)
            — please do not leave this page
          </span>
        </div>
      )}
    </div>
  );
}

export default TourAttachments;
