// components/Faqs/AddEditFaqModal.js
import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;
const { TextArea } = Input;

const AddEditFaqModal = ({
  open,
  setOpen,
  initialData,
  onSave,
  saving = false,
  types = [],
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        ...initialData,
        type: initialData.type, // Use type field
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleCancel = () => {
    if (!saving) {
      setOpen(false);
      form.resetFields();
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const faqData = {
          ...values,
          id: initialData ? initialData.id : Date.now(),
        };

        onSave(faqData);
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  return (
    <Modal
      title={isEditing ? "Edit FAQ" : "Add New FAQ"}
      open={open}
      onCancel={handleCancel}
      width={800}
      confirmLoading={saving}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={saving}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={saving}
          className="bg-blue-600"
        >
          {isEditing ? "Update" : "Add"} FAQ
        </Button>,
      ]}
      centered
      maskClosable={!saving}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: "general",
        }}
        className="pt-4"
      >
        <Form.Item
          name="question"
          label="Question"
          rules={[
            { required: true, message: "Please enter the question" },
            { min: 10, message: "Question must be at least 10 characters" },
            { max: 200, message: "Question must not exceed 200 characters" },
          ]}
        >
          <Input placeholder="Enter FAQ question" disabled={saving} />
        </Form.Item>

        <Form.Item
          name="answer"
          label="Answer"
          rules={[
            { required: true, message: "Please enter the answer" },
            { min: 20, message: "Answer must be at least 20 characters" },
            { max: 1000, message: "Answer must not exceed 1000 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter FAQ answer"
            disabled={saving}
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Please select a type" }]}
        >
          <Select placeholder="Select a type" disabled={saving}>
            {types.map((type) => (
              <Option key={type.key} value={type.key}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditFaqModal;
