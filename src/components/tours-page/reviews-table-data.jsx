import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Rating,
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import {
  // FaCheckCircle,
  // FaTimesCircle,
  FaEye,
  FaPlay,
  FaStar,
  FaBus,
  FaHotel,
  FaPersonHiking,
  FaClock,
  FaImage,
  FaXmark,
  FaCircleCheck,
  FaCircleXmark,
} from "react-icons/fa6";
import { MdPending } from "react-icons/md";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import Table from "../table";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./style.css";

function ReviewsTableData() {
  const { product_id } = useParams();

  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState([]);
  const [statusModal, setStatusModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");
  const [statusAction, setStatusAction] = useState("");
  const [updating, setUpdating] = useState(false);

  // Fetch Reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/tours/rating/select_tour_rating.php`,
        { tour_id: product_id }
      );

      if (response.data?.status === "success") {
        const reviews = response.data.message?.reviews || [];
        setReviewsData(reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product_id) {
      fetchReviews();
    }
  }, [product_id]);

  // Handle Status Change
  const handleStatusChange = async () => {
    if (!selectedReview || !statusAction) return;

    setUpdating(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/tours/rating/change_status.php`,
        {
          id: selectedReview.rating_id,
          status: statusAction,
        }
      );

      if (response.data?.status === "success") {
        setReviewsData((prev) =>
          prev.map((review) =>
            review.rating_id === selectedReview.rating_id
              ? { ...review, status: statusAction }
              : review
          )
        );
        setStatusModal(false);
        setSelectedReview(null);
        setStatusAction("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Open Status Modal
  const openStatusModal = (review, action) => {
    setSelectedReview(review);
    setStatusAction(action);
    setStatusModal(true);
  };

  // Open Details Modal
  const openDetailsModal = (review) => {
    setSelectedReview(review);
    setDetailsModal(true);
  };

  // Open Image Modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModal(true);
  };

  // Open Video Modal
  const openVideoModal = (videoUrl) => {
    let cleanUrl = videoUrl;
    if (typeof videoUrl === "string") {
      cleanUrl = videoUrl
        .replace(/\\/g, "")
        .replace(/^"/, "")
        .replace(/"$/, "");
      if (cleanUrl === "[]" || cleanUrl === "Array" || cleanUrl === "") {
        return;
      }
    }
    setSelectedVideo(cleanUrl);
    setVideoModal(true);
  };

  // Get Status Chip
  const getStatusChip = (status) => {
    const statusConfig = {
      approved: {
        color: "success",
        label: "Approved",
        icon: <FaCircleCheck className="text-xs" />,
      },
      rejected: {
        color: "error",
        label: "Rejected",
        icon: <FaCircleXmark className="text-xs" />,
      },
      pending: {
        color: "warning",
        label: "Pending",
        icon: <MdPending className="text-xs" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`status-chip ${status}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Check if video is valid
  const isValidVideo = (video) => {
    if (!video || typeof video !== "string") return false;
    const cleanVideo = video
      .replace(/\\/g, "")
      .replace(/^"/, "")
      .replace(/"$/, "");
    return (
      cleanVideo &&
      cleanVideo !== "[]" &&
      cleanVideo !== "Array" &&
      cleanVideo !== ""
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const headers = [
    {
      label: "ID",
      dataIndex: "rating_id",
      render: ({ row }) => (
        <span className="font-medium text-gray-700">#{row.rating_id}</span>
      ),
    },
    {
      label: "Media",
      render: ({ row }) => (
        <div className="flex items-center gap-2">
          {/* Images */}
          {row.images && row.images.length > 0 ? (
            <div className="flex -space-x-2">
              {row.images.slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => openImageModal(img)}
                />
              ))}
              {row.images.length > 3 && (
                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{row.images.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FaImage className="text-gray-300" />
            </div>
          )}

          {/* Video Indicator */}
          {isValidVideo(row.video) && (
            <button
              className="w-8 h-8 rounded-full bg-[#e29b4b]/10 flex items-center justify-center text-[#e29b4b] hover:bg-[#e29b4b]/20 transition-colors"
              onClick={() => openVideoModal(row.video)}
              title="Play Video"
            >
              <FaPlay className="text-xs" />
            </button>
          )}
        </div>
      ),
    },
    {
      label: "Ratings",
      render: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <FaStar className="text-[#e29b4b] text-sm" />
            <span className="text-sm font-semibold">
              {parseFloat(row.overall).toFixed(1)}
            </span>
          </div>
          <div className="flex gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-0.5" title="Transport">
              <FaBus className="text-[10px]" />
              {parseFloat(row.transport).toFixed(0)}
            </span>
            <span className="flex items-center gap-0.5" title="Hotel">
              <FaHotel className="text-[10px]" />
              {parseFloat(row.hotel).toFixed(0)}
            </span>
            <span className="flex items-center gap-0.5" title="Activity">
              <FaPersonHiking className="text-[10px]" />
              {parseFloat(row.activity).toFixed(0)}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Comment",
      render: ({ row }) => (
        <div
          className="max-w-[200px] truncate text-sm text-gray-600 cursor-pointer hover:text-gray-900"
          title={row.comment}
          onClick={() => openDetailsModal(row)}
        >
          {row.comment || "No comment"}
        </div>
      ),
    },
    {
      label: "Date",
      render: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <FaClock className="text-xs" />
          {formatDate(row.created_at)}
        </div>
      ),
    },
    {
      label: "Status",
      render: ({ row }) => getStatusChip(row.status),
    },
    {
      label: "Actions",
      render: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            className="action-btn view"
            onClick={() => openDetailsModal(row)}
            title="View Details"
          >
            <FaEye />
          </button>

          {row.status !== "approved" && (
            <button
              className="action-btn approve"
              onClick={() => openStatusModal(row, "approved")}
              title="Approve"
            >
              <FaCheckCircle />
            </button>
          )}

          {row.status !== "rejected" && (
            <button
              className="action-btn reject"
              onClick={() => openStatusModal(row, "rejected")}
              title="Reject"
            >
              <FaTimesCircle />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-t-4 border-b-4 border-[#295557] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="TableData">
        {/* Summary Cards */}
        <ReviewsSummary reviews={reviewsData} />

        {/* Table */}
        <Table
          title={"Tour Reviews"}
          headers={headers}
          body={reviewsData}
          emptyMessage="No reviews found for this tour"
        />
      </div>

      {/* Status Change Modal */}
      <Dialog
        open={statusModal}
        onClose={() => !updating && setStatusModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: { borderRadius: "16px" },
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {statusAction === "approved" ? (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaTimesCircle className="text-red-500 text-xl" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {statusAction === "approved"
                  ? "Approve Review"
                  : "Reject Review"}
              </h2>
              <p className="text-sm text-gray-500">
                This action will update the review status
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-gray-600">
              Are you sure you want to{" "}
              <strong
                className={
                  statusAction === "approved"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {statusAction}
              </strong>{" "}
              this review?
            </p>
            {selectedReview && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-sm ${
                          star <= parseFloat(selectedReview.overall)
                            ? "text-[#e29b4b]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({selectedReview.overall})
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  "{selectedReview.comment}"
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setStatusModal(false)}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${
                statusAction === "approved"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={handleStatusChange}
              disabled={updating}
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {statusAction === "approved" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaTimesCircle />
                  )}
                  {statusAction === "approved" ? "Approve" : "Reject"}
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Details Modal */}
      <Dialog
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { borderRadius: "16px" },
        }}
      >
        <div className="relative">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Review Details
            </h2>
            <button
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              onClick={() => setDetailsModal(false)}
            >
              <FaXmark />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {selectedReview && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-gray-500">
                      Review #{selectedReview.rating_id}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                      <FaClock className="text-xs" />
                      {formatDate(selectedReview.created_at)}
                    </div>
                  </div>
                  {getStatusChip(selectedReview.status)}
                </div>

                {/* Ratings Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rating-card overall">
                    <FaStar className="rating-icon" />
                    <div className="rating-value">
                      {parseFloat(selectedReview.overall).toFixed(1)}
                    </div>
                    <div className="rating-label">Overall</div>
                  </div>
                  <div className="rating-card transport">
                    <FaBus className="rating-icon" />
                    <div className="rating-value">
                      {parseFloat(selectedReview.transport).toFixed(1)}
                    </div>
                    <div className="rating-label">Transport</div>
                  </div>
                  <div className="rating-card hotel">
                    <FaHotel className="rating-icon" />
                    <div className="rating-value">
                      {parseFloat(selectedReview.hotel).toFixed(1)}
                    </div>
                    <div className="rating-label">Hotel</div>
                  </div>
                  <div className="rating-card activity">
                    <FaPersonHiking className="rating-icon" />
                    <div className="rating-value">
                      {parseFloat(selectedReview.activity).toFixed(1)}
                    </div>
                    <div className="rating-label">Activity</div>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Comment
                  </h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                    {selectedReview.comment || "No comment provided"}
                  </p>
                </div>

                {/* Images */}
                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Photos ({selectedReview.images.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedReview.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Review ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                          onClick={() => openImageModal(img)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {isValidVideo(selectedReview.video) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Video
                    </h4>
                    <div
                      className="relative w-48 h-32 bg-gray-900 rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => openVideoModal(selectedReview.video)}
                    >
                      <video
                        src={selectedReview.video
                          .replace(/\\/g, "")
                          .replace(/^"/, "")
                          .replace(/"$/, "")}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <FaPlay className="text-white text-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            {selectedReview && selectedReview.status !== "approved" && (
              <button
                className="px-4 py-2 rounded-lg bg-green-500 text-white flex items-center gap-2 hover:bg-green-600 transition-colors"
                onClick={() => {
                  setDetailsModal(false);
                  openStatusModal(selectedReview, "approved");
                }}
              >
                <FaCheckCircle />
                Approve
              </button>
            )}
            {selectedReview && selectedReview.status !== "rejected" && (
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white flex items-center gap-2 hover:bg-red-600 transition-colors"
                onClick={() => {
                  setDetailsModal(false);
                  openStatusModal(selectedReview, "rejected");
                }}
              >
                <FaTimesCircle />
                Reject
              </button>
            )}
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setDetailsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog
        open={imageModal}
        onClose={() => setImageModal(false)}
        maxWidth="lg"
        PaperProps={{
          style: { borderRadius: "16px", overflow: "hidden" },
        }}
      >
        <div className="relative">
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            onClick={() => setImageModal(false)}
          >
            <FaXmark />
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
      </Dialog>

      {/* Video Preview Modal */}
      <Dialog
        open={videoModal}
        onClose={() => {
          setVideoModal(false);
          setSelectedVideo("");
        }}
        maxWidth="lg"
        PaperProps={{
          style: {
            borderRadius: "16px",
            overflow: "hidden",
            background: "#000",
          },
        }}
      >
        <div className="relative">
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            onClick={() => {
              setVideoModal(false);
              setSelectedVideo("");
            }}
          >
            <FaXmark />
          </button>
          {selectedVideo && (
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="max-w-full max-h-[80vh]"
              style={{ display: "block" }}
            />
          )}
        </div>
      </Dialog>
    </>
  );
}

// Summary Component
const ReviewsSummary = ({ reviews }) => {
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + parseFloat(r.overall), 0) /
          totalReviews
        ).toFixed(1)
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="summary-card">
        <div className="summary-icon total">
          <FaStar />
        </div>
        <div className="summary-info">
          <span className="summary-value">{totalReviews}</span>
          <span className="summary-label">Total Reviews</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon rating">
          <FaStar />
        </div>
        <div className="summary-info">
          <span className="summary-value">{averageRating}</span>
          <span className="summary-label">Avg. Rating</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon approved">
          <FaCheckCircle />
        </div>
        <div className="summary-info">
          <span className="summary-value">{approvedCount}</span>
          <span className="summary-label">Approved</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon pending">
          <FaClock />
        </div>
        <div className="summary-info">
          <span className="summary-value">{pendingCount}</span>
          <span className="summary-label">Pending</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon rejected">
          <FaTimesCircle />
        </div>
        <div className="summary-info">
          <span className="summary-value">{rejectedCount}</span>
          <span className="summary-label">Rejected</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewsTableData;
