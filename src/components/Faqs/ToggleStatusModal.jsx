// components/Faqs/ToggleStatusModal.js
import React from "react";
import { Modal, Button } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const ToggleStatusModal = ({
  open,
  setOpen,
  onConfirm,
  faqQuestion,
  currentHidden,
  toggling = false,
}) => {
  const handleCancel = () => {
    if (!toggling) {
      setOpen(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getStatusInfo = () => {
    const isHidden = currentHidden === "1" || currentHidden === 1;
    return {
      current: isHidden ? "Hidden" : "Visible",
      new: isHidden ? "Visible" : "Hidden",
      color: isHidden ? "text-green-500" : "text-red-500",
      bgColor: isHidden ? "bg-green-100" : "bg-red-100",
      action: isHidden ? "show" : "hide",
      icon: isHidden ? EyeOutlined : EyeInvisibleOutlined,
    };
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  return (
    <Modal
      title="Toggle FAQ Visibility"
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      className="toggle-status-modal"
      maskClosable={!toggling}
    >
      <div className="py-4">
        <div className="flex items-center justify-center mb-4">
          <div className={`${statusInfo.bgColor} rounded-full p-3`}>
            <IconComponent className={`${statusInfo.color} text-2xl`} />
          </div>
        </div>

        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to {statusInfo.action} this FAQ?
          <br />
          <span className="font-semibold italic mt-2 block">
            "{faqQuestion}"
          </span>
          <br />
          <span className="text-sm">
            Visibility will change from{" "}
            <span className="font-semibold">{statusInfo.current}</span> to{" "}
            <span className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.new}
            </span>
          </span>
        </p>

        <div className="flex justify-center space-x-3">
          <Button
            onClick={handleCancel}
            className="px-4 py-2"
            disabled={toggling}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            className={`px-4 py-2 ${
              statusInfo.action === "hide"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } border-none`}
            loading={toggling}
          >
            {statusInfo.action === "hide" ? "Hide FAQ" : "Show FAQ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ToggleStatusModal;
