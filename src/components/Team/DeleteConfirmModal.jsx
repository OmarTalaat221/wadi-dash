import React from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const DeleteConfirmModal = ({ open, setOpen, onConfirm, memberName }) => {
  const handleCancel = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    handleCancel();
  };

  return (
    <Modal
      title="Delete Team Member"
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      className="delete-confirm-modal"
    >
      <div className="py-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <ExclamationCircleFilled className="text-red-500 text-2xl" />
          </div>
        </div>

        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{memberName}</span>? This action
          cannot be undone.
        </p>

        <div className="flex justify-center space-x-3">
          <Button onClick={handleCancel} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleConfirm}
            className="px-4 py-2"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
