import React, { useState } from "react";
import { Modal, Button, message, Popconfirm, Card, Badge, Divider } from "antd";
import {
  FaEye,
  FaEyeSlash,
  FaReply,
  FaTrash,
  FaUser,
  FaCalendar,
} from "react-icons/fa";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const CommentsModal = ({
  open,
  setOpen,
  blogPost,
  setSelectedPost,
  fetchBlogs,
}) => {
  const [loading, setLoading] = useState(false);

  // Toggle comment visibility
  const toggleCommentVisibility = async (commentId, currentStatus) => {
    setLoading(true);
    try {
      const newStatus = currentStatus == "0" ? "1" : "0";
      // console.log(currentStatus);

      // return console.log(newStatus);

      const response = await axios.post(
        `${base_url}/admin/blogs/toggle_comment.php`,
        {
          comment_id: commentId,
          status: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status == "success") {
        // Update the blogPost state
        setSelectedPost((prev) => {
          if (!prev) return prev;

          const updatedComments = prev.comments.map((comment) => {
            if (comment.comment_id === commentId) {
              return { ...comment, hidden: newStatus };
            }

            // Check if the comment has replies and if any reply matches the commentId
            if (comment.replies && comment.replies.length > 0) {
              const hasReplyToUpdate = comment.replies.some(
                (reply) => reply.comment_id === commentId
              );

              if (hasReplyToUpdate) {
                const updatedReplies = comment.replies.map((reply) => {
                  if (reply.comment_id === commentId) {
                    return { ...reply, hidden: newStatus };
                  }
                  return reply;
                });
                return { ...comment, replies: updatedReplies };
              }
            }

            // Return the comment unchanged
            return comment;
          });

          return { ...prev, comments: updatedComments };
        });

        message.success(response.data.message);
        fetchBlogs();
      } else {
        throw new Error("Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      message.error("Failed to update comment visibility");
    } finally {
      setLoading(false);
    }
  };

  // Render individual comment
  const renderComment = (comment, isReply = false) => {
    const isVisible = comment.hidden === "0";

    return (
      <Card
        key={comment.comment_id}
        size="small"
        className={`${isReply ? "ml-6 mt-2" : "mb-4"} ${
          !isVisible ? "opacity-75" : ""
        }`}
        bodyStyle={{ padding: "12px" }}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FaUser className="w-3 h-3 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                User ID: {comment.user_id}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <FaCalendar className="w-3 h-3 mr-1" />
                {new Date(comment.created_at).toLocaleString()}
              </span>
              {isReply && <Badge color="blue" text="Reply" />}
            </div>

            <p
              className={`text-sm ${
                !isVisible ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {comment.comment}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Badge
              status={isVisible ? "success" : "error"}
              text={isVisible ? "Visible" : "Hidden"}
            />

            <Popconfirm
              title={`${isVisible ? "Hide" : "Show"} this comment?`}
              description={`Are you sure you want to ${
                isVisible ? "hide" : "show"
              } this comment?`}
              onConfirm={() =>
                toggleCommentVisibility(comment.comment_id, comment.hidden)
              }
              okText="Yes"
              cancelText="No"
              disabled={loading}
            >
              <Button
                size="small"
                type={isVisible ? "default" : "primary"}
                icon={isVisible ? <FaEyeSlash /> : <FaEye />}
                loading={loading}
              >
                {isVisible ? "Hide" : "Show"}
              </Button>
            </Popconfirm>
          </div>
        </div>
      </Card>
    );
  };

  // Count comments and replies
  const getTotalCommentsCount = () => {
    if (!blogPost?.comments || !Array.isArray(blogPost.comments))
      return { total: 0, visible: 0, hidden: 0 };

    let total = 0;
    let visible = 0;
    let hidden = 0;

    blogPost.comments.forEach((comment) => {
      total += 1;
      comment.hidden === "0" ? visible++ : hidden++;

      if (comment.replies && Array.isArray(comment.replies)) {
        comment.replies.forEach((reply) => {
          total += 1;
          reply.hidden === "0" ? visible++ : hidden++;
        });
      }
    });

    return { total, visible, hidden };
  };

  const commentStats = getTotalCommentsCount();

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <FaReply className="w-5 h-5 mr-2" />
            Comments Management
          </span>
          <div className="flex gap-4 text-sm">
            <Badge status="success" text={`Visible: ${commentStats.visible}`} />
            <Badge status="error" text={`Hidden: ${commentStats.hidden}`} />
            <Badge status="default" text={`Total: ${commentStats.total}`} />
          </div>
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={[
        <Button key="close" onClick={() => setOpen(false)}>
          Close
        </Button>,
      ]}
      width={800}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      {blogPost && (
        <div>
          {/* Blog Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {blogPost.title}
            </h3>
            <p className="text-sm text-gray-600">
              Managing comments for this blog post
            </p>
          </div>

          {/* Comments List */}
          {blogPost.comments && blogPost.comments.length > 0 ? (
            <div className="space-y-2">
              {blogPost.comments.map((comment) => (
                <div key={comment.comment_id}>
                  {renderComment(comment)}

                  {/* Render Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="border-l-2 border-gray-200 ml-4">
                      {comment.replies.map((reply) =>
                        renderComment(reply, true)
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaReply className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No comments found for this blog post</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CommentsModal;
