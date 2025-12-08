import { Dropdown, Menu, Tooltip, Badge, Popconfirm, message } from "antd";
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
  FaTrash, // Added for delete
  FaEdit, // Added for edit
  FaEye, // Added for view
} from "react-icons/fa";

export default function PostCard({
  post,
  setSelectedPost,
  width = "w-full",
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  // Status badge styling
  const getStatusBadge = () => {
    switch (post.status) {
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

  const isPublished = post.status === "accepted";
  const toggleLabel = isPublished ? "Hide blog" : "Publish blog";
  const toggleButtonText = isPublished ? "Hide" : "Publish";

  return (
    <div
      className={`${width} cursor-pointer flex flex-col justify-between bg-white rounded-lg shadow-md overflow-hidden`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {/* <Tooltip
                            title={
                                post.profileImage ? (
                                    <img
                                        src={post.profileImage}
                                        alt="author"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    "Author"
                                )
                            }
                            placement="top"
                            arrow={true}
                        >
                            <div className="w-10 h-10 bg-gray-400 rounded-full overflow-hidden">
                                {post.profileImage && (
                                    <img
                                        src={post.profileImage}
                                        alt="author"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
            </Tooltip> */}
            <div>
              <div className="font-semibold text-gray-900">
                {post.pageName || "Admin"}
              </div>
              <div className="mt-1 flex items-center gap-2">
                {getStatusBadge()}
                {post.category && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <FaTag className="w-3 h-3 mr-1" />
                    {post.category?.replaceAll("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Tooltip title="More actions">
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="view"
                    icon={<FaEye className="text-blue-500" />}
                    onClick={() => setSelectedPost(post)}
                  >
                    <span>View Details</span>
                  </Menu.Item>
                  <Menu.Item
                    key="edit"
                    icon={<FaEdit className="text-orange-500" />}
                    onClick={() => onEdit && onEdit(post)}
                  >
                    <span>Edit Blog</span>
                  </Menu.Item>
                  <Menu.Item
                    key="toggle"
                    icon={
                      isPublished ? (
                        <FaTimes className="text-red-500" />
                      ) : (
                        <FaCheck className="text-green-500" />
                      )
                    }
                  >
                    <Popconfirm
                      title={toggleLabel}
                      description="Are you sure you want to change the status?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => onToggleStatus && onToggleStatus(post)}
                    >
                      <span>{isPublished ? "Hide blog" : "Publish blog"}</span>
                    </Popconfirm>
                  </Menu.Item>
                  <Menu.Divider />
                  {/* DELETE OPTION */}
                  <Menu.Item
                    key="delete"
                    icon={
                      <FaTrash className="text-red-500 hover:!text-white" />
                    }
                    // danger
                  >
                    <Popconfirm
                      title="Delete Blog"
                      description="Are you sure you want to delete this blog? This action cannot be undone."
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => onDelete && onDelete(post)}
                    >
                      <span className="text-red-500">Delete Blog</span>
                    </Popconfirm>
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
          {post.postImage && (
            <img
              src={post.postImage}
              alt="blog cover"
              className="w-full h-full object-cover"
            />
          )}
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
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          {/* View Button */}
          <button
            onClick={() => setSelectedPost(post)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
          >
            <FaComment className="w-5 h-5" />
            <span>View</span>
          </button>

          {/* Publish / Hide Button */}
          <Popconfirm
            title={toggleLabel}
            okText="Yes"
            cancelText="No"
            onConfirm={() => onToggleStatus && onToggleStatus(post)}
          >
            <button
              className={`flex items-center space-x-2 text-white flex-1 justify-center py-2 rounded ${
                isPublished
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isPublished ? (
                <FaTimes className="w-4 h-4" />
              ) : (
                <FaCheck className="w-4 h-4" />
              )}
              <span>{toggleButtonText}</span>
            </button>
          </Popconfirm>

          {/* Delete Button */}
          <Popconfirm
            title="Delete Blog"
            description="This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete && onDelete(post)}
          >
            <button className="flex items-center space-x-2 text-white bg-red-500 hover:bg-red-600 flex-1 justify-center py-2 rounded transition-colors">
              <FaTrash className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}
