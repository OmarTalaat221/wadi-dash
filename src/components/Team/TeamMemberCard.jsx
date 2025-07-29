import React, { useState } from "react";
import { Badge, Tooltip, Tag } from "antd";
import { FaStar, FaEllipsisH } from "react-icons/fa";

const TeamMemberCard = ({ member, onEdit, onDelete, onView }) => {
  const [imgSrc, setImgSrc] = useState(member.profileImage);
  const fallbackImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==";

  const handleImageError = () => {
    setImgSrc(fallbackImage);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Top Member Badge */}
      {member.isTopMember && (
        <div className="absolute top-3 left-3 z-10">
          <Badge
            count={<FaStar className="text-yellow-400" />}
            className="pulse-animation"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          />
        </div>
      )}

      {/* Image */}
      <div className="relative h-64">
        <img
          src={imgSrc}
          alt={member.name}
          className="w-full h-full object-contain"
          onError={handleImageError}
        />

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <Tooltip title="Actions">
            <div
              className="bg-white rounded-full p-2 shadow-md cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const menu = document.getElementById(`menu-${member.id}`);
                menu.classList.toggle("hidden");
              }}
            >
              <FaEllipsisH className="text-gray-600" />
            </div>
          </Tooltip>

          <div
            id={`menu-${member.id}`}
            className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"
          >
            <div className="py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(member);
                }}
              >
                View Details
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(member);
                }}
              >
                Edit
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(member);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-indigo-600 font-medium mb-3">{member.position}</p>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {member.shortDescription}
        </p>

        {/* Best Places */}
        <div className="flex flex-wrap gap-2 mt-3">
          {member.bestPlaces.map((place, index) => (
            <Tag key={index} color="blue" className="rounded-full px-3 py-1">
              {place}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
