import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Button } from "antd";

const AddEditMemberModal = ({ open, setOpen, initialData, onSave }) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        ...initialData,
        bestPlaces: initialData.bestPlaces.join(", "),
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // Convert comma-separated string to array
        const bestPlaces = values.bestPlaces
          .split(",")
          .map((place) => place.trim())
          .filter((place) => place);

        const memberData = {
          ...values,
          bestPlaces,
          id: initialData ? initialData.id : Date.now(),
        };

        onSave(memberData);
        handleCancel();
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  return (
    <Modal
      title={isEditing ? "Edit Team Member" : "Add New Team Member"}
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          className="bg-blue-600"
        >
          {isEditing ? "Update" : "Add"} Team Member
        </Button>,
      ]}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isTopMember: false,
          profileImage:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
        }}
        className="pt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: "Please enter the position" }]}
          >
            <Input placeholder="Enter job position" />
          </Form.Item>
        </div>

        <Form.Item
          name="profileImage"
          label="Profile Image URL"
          rules={[{ required: true, message: "Please enter the image URL" }]}
        >
          <Input placeholder="Enter image URL" />
        </Form.Item>

        <Form.Item
          name="shortDescription"
          label="Short Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea rows={2} placeholder="Enter a short description" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="funFact"
            label="Fun Fact"
            rules={[{ required: true, message: "Please enter a fun fact" }]}
          >
            <Input.TextArea rows={2} placeholder="Enter a fun fact" />
          </Form.Item>

          <Form.Item
            name="favoriteQuote"
            label="Favorite Quote"
            rules={[
              {
                required: true,
                message: "Please enter a favorite quote",
              },
            ]}
          >
            <Input.TextArea rows={2} placeholder="Enter a favorite quote" />
          </Form.Item>
        </div>

        <Form.Item
          name="favoriteMemory"
          label="Favorite Travel Memory"
          rules={[
            {
              required: true,
              message: "Please enter a favorite memory",
            },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Enter a favorite travel memory"
          />
        </Form.Item>

        <Form.Item
          name="bestPlaces"
          label="Best Places (comma-separated)"
          rules={[
            {
              required: true,
              message: "Please enter at least one place",
            },
          ]}
        >
          <Input placeholder="e.g. Bali, New York, Paris" />
        </Form.Item>

        <Form.Item
          name="isTopMember"
          label="Top Team Member"
          valuePropName="checked"
          extra={`Only ${4} team members can be marked as top members.`}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditMemberModal;
