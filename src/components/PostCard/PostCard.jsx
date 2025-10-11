import { Dropdown, Menu, Tooltip, Badge } from "antd";
import React from "react";
import {
  FaHeart,
  FaComment,
  FaShare,
  FaEllipsisH,
  FaGlobe,
  FaCheck,
  FaTimes,
  FaTag,
} from "react-icons/fa";

export default function PostCard({
  post,
  setSelectedPost,
  width = "max-w-sm",
  onAccept,
  onReject,
}) {
  // Status badge styling
  const getStatusBadge = () => {
    switch (post.status) {
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

  // Truncate description for display
  const getTruncatedDescription = (description, maxLength = 100) => {
    if (!description) return "";
    const textOnly = description.replace(/<[^>]*>/g, ""); // Remove HTML tags
    return textOnly.length > maxLength
      ? textOnly.substring(0, maxLength) + "..."
      : textOnly;
  };

  // Count total comments including replies
  const getTotalCommentsCount = () => {
    if (!post.comments || !Array.isArray(post.comments)) return 0;

    let total = 0;
    post.comments.forEach((comment) => {
      total += 1; // Count the main comment
      if (comment.replies && Array.isArray(comment.replies)) {
        total += comment.replies.length; // Count replies
      }
    });
    return total;
  };

  return (
    <div
      className={`${width} cursor-pointer flex flex-col justify-between bg-white rounded-lg shadow-md overflow-hidden`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Tooltip
              title={
                <img
                  src={post.profileImage}
                  alt="author"
                  className="w-full h-full object-cover"
                />
              }
              placement="top"
              arrow={true}
            >
              <div className="w-10 h-10 bg-gray-400 rounded-full overflow-hidden">
                <img
                  src={post.profileImage}
                  alt="author"
                  className="w-full h-full object-cover"
                />
              </div>
            </Tooltip>
            <div>
              <div className="font-semibold text-gray-900">{post.pageName}</div>
              <div className="mt-1 flex items-center gap-2">
                {getStatusBadge()}
                {post.category && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <FaTag className="w-3 h-3 mr-1" />
                    {post.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Tooltip title="More actions">
            <Dropdown
              className=""
              overlay={
                <Menu>
                  <Menu.Item key="view" onClick={() => setSelectedPost(post)}>
                    <span>View Details</span>
                  </Menu.Item>
                  <Menu.Item key="edit">
                    <span>Edit Blog</span>
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
              placement="bottomRight"
            >
              <FaEllipsisH className="w-5 h-5 text-gray-500 cursor-pointer" />
            </Dropdown>
          </Tooltip>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-700 text-sm line-clamp-3">
            {getTruncatedDescription(post.description)}
          </p>
        </div>
      </div>

      <div>
        {/* Image */}
        <div
          className="bg-gray-300 h-64 w-full"
          onClick={() => setSelectedPost(post)}
        >
          <img
            src={post.postImage}
            alt="blog cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Engagement Stats for Published blogs */}
        {post.status === "accepted" && (
          <div className="px-4 py-2 flex items-center justify-end text-sm text-gray-500 border-b border-gray-200">
            <div className="flex space-x-4">
              <span>{getTotalCommentsCount()} Comments</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-3">
          {post.status === "pending" ? (
            <>
              <button
                onClick={() => onAccept && onAccept(post.id)}
                className="flex items-center space-x-2 text-white bg-green-500 hover:bg-green-600 transition-colors flex-1 justify-center py-2 rounded mr-2"
              >
                <FaCheck className="w-4 h-4" />
                <span>Publish</span>
              </button>
              <button
                onClick={() => onReject && onReject(post.id)}
                className="flex items-center space-x-2 text-white bg-red-500 hover:bg-red-600 transition-colors flex-1 justify-center py-2 rounded"
              >
                <FaTimes className="w-4 h-4" />
                <span>Hide</span>
              </button>
            </>
          ) : post.status === "accepted" ? (
            <>
              <button
                onClick={() => setSelectedPost(post)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
              >
                <FaComment className="w-5 h-5" />
                <span>View</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded">
                <FaShare className="w-5 h-5" />
                <span>Share</span>
              </button>
            </>
          ) : (
            <div className="w-full text-center text-gray-500 py-2">
              Blog is hidden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
