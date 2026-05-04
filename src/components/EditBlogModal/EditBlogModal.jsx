// src/components/EditBlogModal/EditBlogModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Image,
  Spin,
} from "antd";
import { UploadOutlined, FolderOutlined } from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { uploadImageToServer } from "../../hooks/uploadImage";
// import { uploadImageToServer } from "../../utils/uploadImageToServer"; // adjust path if needed

const { TextArea } = Input;
const { Option } = Select;

const EditBlogModal = ({ open, post, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const coverImageValue = Form.useWatch("cover_image", form);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/blogs/select_blog_categories.php`
      );

      if (response.data.status === "success") {
        const cats = response.data.message || response.data.data || [];

        const visibleCats = cats.filter(
          (c) => c.hidden !== 1 && c.hidden !== "1" && c.hidden !== true
        );

        setCategories(visibleCats);
      } else {
        message.error(response.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Error fetching categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (open && post) {
      fetchCategories();

      form.setFieldsValue({
        title: post.title || "",
        description: post.description || "",
        quote_text: post.quoteText || "",
        quote_author: post.quoteAuthor || "",
        category: post.category ? String(post.category) : undefined,
        cover_image: post.postImage || "",
      });
    }
  }, [open, post, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const extractImageUrl = (uploadResponse) => {
    if (!uploadResponse) return "";

    if (typeof uploadResponse === "string") return uploadResponse;

    return (
      uploadResponse.url ||
      uploadResponse.image ||
      uploadResponse.image_url ||
      uploadResponse.imageUrl ||
      uploadResponse.file_url ||
      uploadResponse.fileUrl ||
      uploadResponse.data?.url ||
      uploadResponse.data?.image ||
      uploadResponse.data?.image_url ||
      uploadResponse.data?.file_url ||
      ""
    );
  };

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingImage(true);

      const result = await uploadImageToServer(file);
      const imageUrl = extractImageUrl(result);

      if (!imageUrl) {
        throw new Error("Image uploaded but no image URL was returned");
      }

      form.setFieldsValue({ cover_image: imageUrl });
      message.success("Image uploaded successfully");

      if (onSuccess) onSuccess(result);
    } catch (error) {
      console.error("Image upload error:", error);
      message.error("Failed to upload image");
      if (onError) onError(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type?.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed");
      return Upload.LIST_IGNORE;
    }

    const isUnder5MB = file.size / 1024 / 1024 < 5;
    if (!isUnder5MB) {
      message.error("Image must be smaller than 5MB");
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        blog_id: post.id,
        title: values.title,
        cover_image: values.cover_image || "",
        description: values.description,
        quote_text: values.quote_text || "",
        quote_author: values.quote_author || "",
        category: values.category,
      };

      const response = await axios.post(
        `${base_url}/admin/blogs/edit_blog.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        const selectedCategory = categories.find(
          (cat) => String(cat.category_id) === String(values.category)
        );

        const updatedPost = {
          ...post,
          title: values.title,
          description: values.description,
          quoteText: values.quote_text || "",
          quoteAuthor: values.quote_author || "",
          category: values.category,
          category_name: selectedCategory?.category_name || post.category_name,
          postImage: values.cover_image || post.postImage,
        };

        message.success("Blog updated successfully");
        onSuccess(updatedPost);
        handleClose();
      } else {
        message.error(response.data.message || "Failed to update blog");
      }
    } catch (error) {
      if (error?.errorFields) return;
      console.error("Error updating blog:", error);
      message.error("Failed to update blog");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Blog"
      onCancel={handleClose}
      width={700}
      centered
      // maskClosable={false}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={handleClose} disabled={submitting || uploadingImage}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={uploadingImage}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        requiredMark="optional"
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: "Title is required" },
            { min: 5, message: "Title must be at least 5 characters" },
            { max: 200, message: "Title cannot exceed 200 characters" },
          ]}
        >
          <Input placeholder="Enter blog title" maxLength={200} showCount />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select
            placeholder={
              categoriesLoading ? "Loading categories..." : "Select a category"
            }
            loading={categoriesLoading}
            showSearch
            optionFilterProp="children"
            notFoundContent={
              categoriesLoading ? (
                <div className="flex justify-center py-3">
                  <Spin size="small" />
                </div>
              ) : (
                "No categories found"
              )
            }
          >
            {categories.map((cat) => (
              <Option key={cat.category_id} value={String(cat.category_id)}>
                {cat.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Description is required" },
            { min: 20, message: "Description must be at least 20 characters" },
          ]}
        >
          <TextArea
            placeholder="Enter blog description"
            rows={5}
            maxLength={5000}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Cover Image Link"
          name="cover_image"
          rules={[
            { required: true, message: "Please provide a cover image link" },
          ]}
        >
          <Input
            placeholder="Paste image link or upload an image below"
            allowClear
          />
        </Form.Item>

        <Form.Item label="OR Upload Cover Image">
          <div className="flex flex-col gap-3">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={handleImageUpload}
              maxCount={1}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadingImage}
                disabled={uploadingImage}
              >
                Upload Image
              </Button>
            </Upload>

            <div className="text-xs text-gray-500">
              Allowed formats: JPG, PNG, WEBP. Maximum size: 5MB.
            </div>
          </div>
        </Form.Item>

        {coverImageValue ? (
          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Image Preview</div>
            <Image
              src={coverImageValue}
              alt="Cover Preview"
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: 8,
              }}
              preview={false}
              fallback="https://placehold.co/600x220?text=No+Image"
            />
          </div>
        ) : null}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Quote Information
          </div>

          <Form.Item
            label="Quote Text"
            name="quote_text"
            className="!mb-3"
            rules={[
              { max: 500, message: "Quote text cannot exceed 500 characters" },
            ]}
          >
            <TextArea
              placeholder="Enter quote text"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Quote Author"
            name="quote_author"
            className="!mb-0"
            rules={[
              {
                max: 100,
                message: "Quote author cannot exceed 100 characters",
              },
            ]}
          >
            <Input placeholder="Enter quote author" maxLength={100} showCount />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default EditBlogModal;
