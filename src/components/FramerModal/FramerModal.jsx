import React, { useState } from "react";
import { Modal, Badge, Divider, Button } from "antd";
import {
  FaTag,
  FaUser,
  FaCalendar,
  FaQuoteLeft,
  FaComment,
  FaTimes,
} from "react-icons/fa";
import CommentsModal from "./CommentsModal";

const FramerModal = ({
  open,
  setOpen,
  setSelectedPost,
  selectedPost,
  onAccept,
  onReject,
  fetchBlogs,
}) => {
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);

  const closeModal = () => {
    setOpen(false);
  };

  const getStatusBadge = () => {
    switch (selectedPost?.status) {
      case "pending":
        return <Badge status="warning" text="Draft" />;
      case "accepted":
        return <Badge status="success" text="Published" />;
      case "rejected":
        return <Badge status="error" text="Hidden" />;
      default:
        return null;
    }
  };

  // Count total comments including replies
  const getTotalCommentsCount = () => {
    if (!selectedPost?.comments || !Array.isArray(selectedPost.comments))
      return 0;

    let total = 0;
    selectedPost.comments.forEach((comment) => {
      total += 1; // Count the main comment
      if (comment.replies && Array.isArray(comment.replies)) {
        total += comment.replies.length; // Count replies
      }
    });
    return total;
  };

  const handleAcceptAndClose = () => {
    onAccept && onAccept(selectedPost.id);
    closeModal();
  };

  const handleRejectAndClose = () => {
    onReject && onReject(selectedPost.id);
    closeModal();
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={selectedPost?.profileImage}
                alt="author"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <span className="font-semibold">{selectedPost?.pageName}</span>
                <div className="text-sm text-gray-500">
                  {selectedPost?.category && (
                    <span className="flex items-center">
                      <FaTag className="w-3 h-3 mr-1" />
                      {selectedPost.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        }
        open={open}
        onCancel={closeModal}
        footer={
          selectedPost?.status === "pending"
            ? [
                <Button
                  key="reject"
                  danger
                  onClick={handleRejectAndClose}
                  icon={<FaTimes />}
                >
                  Hide Blog
                </Button>,
                <Button
                  key="accept"
                  type="primary"
                  onClick={handleAcceptAndClose}
                >
                  Publish Blog
                </Button>,
              ]
            : selectedPost?.status === "accepted"
            ? [
                <Button
                  key="manage-comments"
                  type="primary"
                  onClick={() => setCommentsModalOpen(true)}
                  icon={<FaComment />}
                >
                  Manage Comments
                </Button>,
                <Button key="close" onClick={closeModal}>
                  Close
                </Button>,
              ]
            : [
                <Button key="close" onClick={closeModal}>
                  Close
                </Button>,
              ]
        }
        width={900}
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "75vh",
          overflowY: "auto",
          padding: 0,
        }}
        destroyOnClose
      >
        {selectedPost && (
          <div>
            {/* Header Image */}
            <div className="relative">
              <img
                src={selectedPost.postImage}
                alt="blog cover"
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Author Info with Date */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <FaUser className="w-4 h-4 mr-2" />
                      {selectedPost.pageName}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaCalendar className="w-3 h-3 mr-1" />
                        {new Date(selectedPost.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedPost.title}
              </h1>

              {/* Description */}
              <div
                className="prose max-w-none text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ __html: selectedPost.description }}
              />

              {/* Quote Section */}
              {selectedPost.quoteText && (
                <>
                  <Divider />
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <FaQuoteLeft className="w-6 h-6 text-blue-500 mb-2" />
                    <blockquote className="text-lg italic text-gray-700 mb-2">
                      "{selectedPost.quoteText}"
                    </blockquote>
                    {selectedPost.quoteAuthor && (
                      <cite className="text-sm text-gray-600">
                        — {selectedPost.quoteAuthor}
                      </cite>
                    )}
                  </div>
                </>
              )}

              {/* Comments Section for Published blogs */}
              {selectedPost.status === "accepted" && (
                <>
                  <Divider />
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                      <FaComment className="w-5 h-5 mr-2" />
                      Comments ({getTotalCommentsCount()})
                    </h3>

                    {/* Comments Preview */}
                    {selectedPost.comments &&
                    selectedPost.comments.length > 0 ? (
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {selectedPost.comments.slice(0, 3).map((comment) => (
                          <div
                            key={comment.comment_id}
                            className="border-l-2 border-blue-200 pl-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                  {comment.comment}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    comment.created_at
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    comment.hidden === "0"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {comment.hidden === "0"
                                    ? "Visible"
                                    : "Hidden"}
                                </span>
                              </div>
                            </div>

                            {/* Replies Preview */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-4 mt-2 space-y-2">
                                {comment.replies.slice(0, 2).map((reply) => (
                                  <div
                                    key={reply.comment_id}
                                    className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                                  >
                                    <p>{reply.comment}</p>
                                    <span
                                      className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                                        reply.hidden === "0"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {reply.hidden === "0"
                                        ? "Visible"
                                        : "Hidden"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        {selectedPost.comments.length > 3 && (
                          <p className="text-center text-gray-500 text-sm">
                            ... and {selectedPost.comments.length - 3} more
                            comments
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No comments yet
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Comments Management Modal */}
      <CommentsModal
        open={commentsModalOpen}
        setOpen={setCommentsModalOpen}
        blogPost={selectedPost}
        setSelectedPost={setSelectedPost}
        fetchBlogs={fetchBlogs}
      />
    </>
  );
};

export default FramerModal;
