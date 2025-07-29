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
        return <Badge status="warning" text="Pending" />;
      case "accepted":
        return <Badge status="success" text="Accepted" />;
      case "rejected":
        return <Badge status="error" text="Rejected" />;
      default:
        return null;
    }
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
                  alt="post"
                  className="w-full h-full object-cover"
                />
              }
              placement="top"
              arrow={true}
            >
              <div className="w-10 h-10 bg-gray-400 rounded-full overflow-hidden">
                <img
                  src={post.profileImage}
                  alt="post"
                  className="w-full h-full object-cover"
                />
              </div>
            </Tooltip>
            <div>
              <div className="font-semibold text-gray-900">{post.pageName}</div>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
          </div>
          <Tooltip title="More actions">
            <Dropdown
              className=""
              overlay={
                <Menu>
                  <Menu.Item key="delete" onClick={() => setSelectedPost(post)}>
                    <span>Delete post</span>
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
        <div className="px-4 pb-3 text-sm">
          <p
            title={post.description}
            className="text-gray-700 mb-3 line-clamp-2"
          >
            {post.description}
          </p>
        </div>
      </div>

      <div>
        {/* Image Placeholder */}
        <div
          className="bg-gray-300 h-64 w-full "
          onClick={() => setSelectedPost(post)}
        >
          <img
            src={post.postImage}
            alt="post"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Website Link */}

        {/* Engagement Stats */}
        {post.status === "accepted" && (
          <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <FaHeart className="w-3 h-3 text-white fill-current" />
                </div>
              </div>
              <span className="">{post.likes}</span>
            </div>
            <div className="flex space-x-4">
              <span>{post.comments} Comments</span>
              <span>{post.shares} Shares</span>
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
                <span>Accept</span>
              </button>
              <button
                onClick={() => onReject && onReject(post.id)}
                className="flex items-center space-x-2 text-white bg-red-500 hover:bg-red-600 transition-colors flex-1 justify-center py-2 rounded"
              >
                <FaTimes className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          ) : post.status === "accepted" ? (
            <>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded">
                <FaComment className="w-5 h-5" />
                <span>Comments</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded">
                <FaShare className="w-5 h-5" />
                <span>Sharings</span>
              </button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
