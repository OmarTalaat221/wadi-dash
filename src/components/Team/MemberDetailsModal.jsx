import React from "react";
import { Modal, Tag } from "antd";

const MemberDetailsModal = ({ open, setOpen, selectedMember }) => {
  const handleCancel = () => {
    setOpen(false);
  };

  if (!selectedMember) return null;

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      closable={false}
      bodyStyle={{ padding: 0 }}
      className="member-details-modal"
    >
      {/* Header with image */}
      <div className="relative h-64 bg-gradient-to-r from-indigo-500 to-blue-600">
        <button
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
          onClick={handleCancel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-lg">
          <img
            src={selectedMember.profileImage}
            alt={selectedMember.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 px-8 pb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedMember.name}
          </h2>
          <p className="text-xl text-indigo-600 font-medium">
            {selectedMember.position}
          </p>

          {selectedMember.isTopMember && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <svg
                  className="mr-1.5 h-2.5 w-2.5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Top Team Member
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-700">{selectedMember.shortDescription}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fun Fact
            </h3>
            <p className="text-gray-700">{selectedMember.funFact}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Favorite Quote
            </h3>
            <p className="text-gray-700 italic">
              "{selectedMember.favoriteQuote}"
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Favorite Travel Memory
            </h3>
            <p className="text-gray-700">{selectedMember.favoriteMemory}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Best Places
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedMember.bestPlaces.map((place, index) => (
                <Tag key={index} color="blue" className="px-3 py-1 text-base">
                  {place}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MemberDetailsModal;
