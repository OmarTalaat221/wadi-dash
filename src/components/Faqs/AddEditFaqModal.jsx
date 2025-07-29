import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { faqCategories } from "../../data/faqs";

const { Option } = Select;
const { TextArea } = Input;

const AddEditFaqModal = ({ open, setOpen, initialData, onSave }) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue(initialData);
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
        const faqData = {
          ...values,
          id: initialData ? initialData.id : Date.now(),
        };

        onSave(faqData);
        handleCancel();
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
          {isEditing ? "Update" : "Add"} FAQ
        </Button>,
      ]}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          category: "tour",
        }}
        className="pt-4"
      >
        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true, message: "Please enter the question" }]}
        >
          <Input placeholder="Enter FAQ question" />
        </Form.Item>

        <Form.Item
          name="answer"
          label="Answer"
          rules={[{ required: true, message: "Please enter the answer" }]}
        >
          <TextArea rows={4} placeholder="Enter FAQ answer" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select a category">
            {faqCategories
              .filter((category) => category.key !== "all")
              .map((category) => (
                <Option key={category.key} value={category.key}>
                  {category.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditFaqModal;
