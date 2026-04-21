import React, { useState, useEffect, useCallback } from "react";
import PostCard from "../../components/PostCard/AdminPostCard";
import FramerModal from "../../components/FramerModal/FramerModal";
import {
  Tabs,
  Badge,
  message,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Spin,
  Select,
  Pagination,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { useSearchParams } from "react-router-dom";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Read from URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentLimit = parseInt(searchParams.get("limit") || "10");
  const currentTab = searchParams.get("tab") || "all";

  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Add / Edit modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);

  // Image previews & upload loading states
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // ✅ Update URL params helper
  const updateParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (key === "page" && String(value) === "1") ||
          (key === "limit" && String(value) === "10") ||
          (key === "tab" && value === "all")
        ) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // ── Helpers ──
  const transformBlogStatus = (hidden) => {
    if (hidden === "0" || hidden === 0) return "accepted";
    return "rejected";
  };

  // ── Fetch Categories ──
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/admin_blogs/select_blog_categories.php`
      );
      if (response.data?.status === "success") {
        setCategories(response.data.message || []);
      } else {
        message.error("Failed to fetch categories");
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // ✅ Fetch blogs with pagination + tab filter
  const fetchBlogs = useCallback(
    async (
      page = currentPage,
      limit = currentLimit,
      tab = currentTab,
      showLoading = true
    ) => {
      if (showLoading) setLoading(true);
      try {
        const params = { page, limit };

        // ✅ Map tab to API hidden param
        if (tab === "accepted") params.hidden = "0";
        else if (tab === "rejected") params.hidden = "1";

        const response = await axios.post(
          `${base_url}/admin/admin_blogs/select_blogs.php`,
          null,
          { params }
        );

        if (response.data.status === "success") {
          const transformedBlogs =
            response.data.message?.map((blog) => ({
              id: blog.blog_id,
              title: blog.title,
              description: blog.description,
              postImage: blog.cover_image,
              category_name: blog.category_name,
              status: transformBlogStatus(blog.hidden),
              hidden: blog.hidden,
              category: blog.category,
              likes: Math.floor(Math.random() * 100),
              comments: blog.comments || [],
              shares: Math.floor(Math.random() * 10),
              createdAt: blog.created_at,
              updatedAt: blog.updated_at,
              quoteText: blog.quote_text,
              quoteAuthor: blog.quote_author,
              originalBlogId: blog.blog_id,
            })) || [];

          setPosts(transformedBlogs);

          const pg = response.data.pagination;
          setTotal(pg?.total_items || transformedBlogs.length || 0);
        } else {
          message.error("Failed to fetch blogs");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        message.error("Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, currentLimit, currentTab]
  );

  // ✅ Fetch when URL changes
  useEffect(() => {
    fetchBlogs(currentPage, currentLimit, currentTab);
  }, [currentPage, currentLimit, currentTab]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Tab change → reset page to 1
  const handleTabChange = (tab) => {
    updateParams({ tab, page: 1 });
  };

  // ✅ Pagination change
  const handlePageChange = (page, pageSize) => {
    updateParams({ page, limit: pageSize });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleCategories = categories.filter(
    (cat) => cat.hidden === "0" || cat.hidden === 0
  );

  // ── Toggle Status ──
  const handleToggleStatus = async (post) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/admin_blogs/toggle_blog.php`,
        { blog_id: post.id },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        const isCurrentlyAccepted = post.status === "accepted";
        const newStatus = isCurrentlyAccepted ? "rejected" : "accepted";
        const newHidden = isCurrentlyAccepted ? "1" : "0";

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? { ...p, status: newStatus, hidden: newHidden }
              : p
          )
        );

        message.success(
          isCurrentlyAccepted
            ? "Blog hidden successfully"
            : "Blog published successfully"
        );
      } else {
        throw new Error("Failed to toggle blog status");
      }
    } catch (error) {
      console.error("Error toggling blog:", error);
      message.error("Failed to update blog status");
    }
  };

  // ── Delete ──
  const handleDeletePost = async (post) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/admin_blogs/delete_blog.php`,
        { blog_id: post.id },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        if (selectedPost?.id === post.id) setSelectedPost(null);

        // ✅ If last item on page > go back
        if (posts.length === 1 && currentPage > 1) {
          updateParams({ page: currentPage - 1 });
        } else {
          fetchBlogs(currentPage, currentLimit, currentTab, false);
        }

        message.success("Blog deleted successfully");
      } else {
        throw new Error("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      message.error("Failed to delete blog");
    }
  };

  const handleAccept = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post && post.status !== "accepted") {
      await handleToggleStatus(post);
    }
  };

  const handleReject = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post && post.status !== "rejected") {
      await handleToggleStatus(post);
    }
  };

  // ── File Validation ──
  const validateFile = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }
    return true;
  };

  // ── Image Upload ──
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axios.post(
      `${base_url}/user/item_img_uploader.php`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  };

  // ── Add Modal ──
  const openAddModal = () => {
    addForm.resetFields();
    setAddImagePreview(null);
    setIsAddModalOpen(true);
  };

  const handleAddImageChange = async (info) => {
    const { file } = info;
    if (!file || file.status === "removed") return;
    const fileObj = file.originFileObj || file;
    if (!fileObj || !fileObj.type) return;
    if (!validateFile(fileObj)) return;

    setUploadingAdd(true);
    try {
      const responseData = await uploadImage(fileObj);
      if (responseData) {
        setAddImagePreview(responseData);
        addForm.setFieldsValue({ cover_image: responseData });
        message.success("Image uploaded successfully");
      } else {
        message.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Failed to upload image");
    } finally {
      setUploadingAdd(false);
    }
  };

  const handleAddSubmit = async (values) => {
    try {
      setSaving(true);
      const response = await axios.post(
        `${base_url}/admin/admin_blogs/add_blog.php`,
        values,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        message.success("Blog added successfully");
        setIsAddModalOpen(false);
        // ✅ Go to page 1 after adding
        updateParams({ page: 1 });
        fetchBlogs(1, currentLimit, currentTab, false);
      } else if (response.data?.status === "found") {
        message.warning(response.data.message || "Blog already exists");
      } else {
        throw new Error("Failed to add blog");
      }
    } catch (error) {
      console.error("Error adding blog:", error);
      message.error("Failed to add blog");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Modal ──
  const openEditModal = (post) => {
    setEditingPost(post);
    setEditImagePreview(post.postImage || null);
    editForm.setFieldsValue({
      title: post.title,
      cover_image: post.postImage || "",
      description: post.description,
      quote_text: post.quoteText,
      quote_author: post.quoteAuthor,
      category: post.category,
    });
    setIsEditModalOpen(true);
  };

  const handleEditImageChange = async (info) => {
    const { file } = info;
    if (!file || file.status === "removed") return;
    const fileObj = file.originFileObj || file;
    if (!fileObj || !fileObj.type) return;
    if (!validateFile(fileObj)) return;

    setUploadingEdit(true);
    try {
      const responseData = await uploadImage(fileObj);
      if (responseData) {
        setEditImagePreview(responseData);
        editForm.setFieldsValue({ cover_image: responseData });
        message.success("Image uploaded successfully");
      } else {
        message.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Failed to upload image");
    } finally {
      setUploadingEdit(false);
    }
  };

  const handleEditSubmit = async (values) => {
    if (!editingPost) return;
    try {
      setSaving(true);
      const payload = { blog_id: editingPost.id, ...values };
      const response = await axios.post(
        `${base_url}/admin/admin_blogs/edit_blog.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        message.success("Blog updated successfully");
        setIsEditModalOpen(false);
        fetchBlogs(currentPage, currentLimit, currentTab, false);
      } else if (response.data?.status === "found") {
        message.warning(
          response.data.message || "Another blog with same title exists"
        );
      } else {
        throw new Error("Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      message.error("Failed to update blog");
    } finally {
      setSaving(false);
    }
  };

  // ── Upload Button ──
  const UploadButton = ({ loading: btnLoading }) => (
    <div>
      {btnLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {btnLoading ? "Uploading..." : "Upload"}
      </div>
    </div>
  );

  const handleRemoveAddImage = () => {
    setAddImagePreview(null);
    addForm.setFieldsValue({ cover_image: "" });
  };

  const handleRemoveEditImage = () => {
    setEditImagePreview(null);
    editForm.setFieldsValue({ cover_image: "" });
  };

  // ── Category Select ──
  const CategorySelectInput = () => (
    <Select
      placeholder="Select a category"
      loading={categoriesLoading}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option?.children?.toLowerCase().includes(input.toLowerCase())
      }
      notFoundContent={
        categoriesLoading ? <Spin size="small" /> : "No categories found"
      }
    >
      {visibleCategories.map((category) => (
        <Option key={category.category_id} value={category.category_id}>
          {category.category_name}
        </Option>
      ))}
    </Select>
  );

  return (
    <div className="p-4">
      {/* ── Header ── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Blogs Management</h2>
        <Button type="primary" onClick={openAddModal}>
          Add Blog
        </Button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <Tabs
          activeKey={currentTab}
          onChange={handleTabChange}
          type="card"
          className="custom-tabs"
        >
          <TabPane
            tab={<span>All Blogs ({currentTab === "all" ? total : ""})</span>}
            key="all"
          />
          <TabPane
            tab={
              <span>
                Published{" "}
                <Badge
                  count={currentTab === "accepted" ? total : undefined}
                  style={{ backgroundColor: "#52c41a" }}
                />
              </span>
            }
            key="accepted"
          />
          <TabPane
            tab={
              <span>
                Hidden{" "}
                <Badge
                  count={currentTab === "rejected" ? total : undefined}
                  style={{ backgroundColor: "#f5222d" }}
                />
              </span>
            }
            key="rejected"
          />
        </Tabs>
      </div>

      {/* ── Posts Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // ✅ Skeleton loading
          [...Array(currentLimit > 6 ? 6 : currentLimit)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              setSelectedPost={setSelectedPost}
              onEdit={openEditModal}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-16">
            <div className="text-gray-300 text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg font-medium">
              No blogs found in this category
            </p>
          </div>
        )}
      </div>

      {/* ✅ Pagination */}
      {!loading && total > currentLimit && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            pageSize={currentLimit}
            total={total}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["6", "9", "12", "24"]}
            showTotal={(t, range) => `${range[0]}-${range[1]} of ${t} blogs`}
            showQuickJumper
          />
        </div>
      )}

      {/* ── Framer Modal ── */}
      {selectedPost?.status !== null && (
        <FramerModal
          open={selectedPost !== null}
          setOpen={() => setSelectedPost(null)}
          setSelectedPost={setSelectedPost}
          selectedPost={selectedPost}
          onAccept={handleAccept}
          onReject={handleReject}
          fetchBlogs={() =>
            fetchBlogs(currentPage, currentLimit, currentTab, false)
          }
        />
      )}

      {/* ══════════════════════════════
          ADD BLOG MODAL
      ══════════════════════════════ */}
      <Modal
        title="Add Blog"
        open={isAddModalOpen}
        onCancel={() => {
          if (!uploadingAdd) setIsAddModalOpen(false);
        }}
        okText="Add"
        onOk={() => addForm.submit()}
        confirmLoading={saving}
        okButtonProps={{ disabled: uploadingAdd }}
        destroyOnClose
        width={600}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddSubmit}
          preserve={false}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter blog title" }]}
          >
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <CategorySelectInput />
          </Form.Item>

          <Form.Item
            label="Cover Image"
            required
            rules={[{ required: true, message: "Please upload a cover image" }]}
          >
            <div className="relative">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAddImageChange}
                accept="image/*"
                disabled={uploadingAdd}
              >
                {addImagePreview ? (
                  <img
                    src={addImagePreview}
                    alt="cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <UploadButton loading={uploadingAdd} />
                )}
              </Upload>
              {addImagePreview && !uploadingAdd && (
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={handleRemoveAddImage}
                  style={{ marginTop: 4 }}
                >
                  Remove Image
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="cover_image"
            hidden
            rules={[{ required: true, message: "Please upload a cover image" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter blog description" />
          </Form.Item>

          <Form.Item label="Quote Text" name="quote_text">
            <TextArea rows={2} placeholder="Enter quote text (optional)" />
          </Form.Item>

          <Form.Item label="Quote Author" name="quote_author">
            <Input placeholder="Enter quote author (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ══════════════════════════════
          EDIT BLOG MODAL
      ══════════════════════════════ */}
      <Modal
        title="Edit Blog"
        open={isEditModalOpen}
        onCancel={() => {
          if (!uploadingEdit) setIsEditModalOpen(false);
        }}
        okText="Update"
        onOk={() => editForm.submit()}
        confirmLoading={saving}
        okButtonProps={{ disabled: uploadingEdit }}
        destroyOnClose
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          preserve={false}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter blog title" }]}
          >
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <CategorySelectInput />
          </Form.Item>

          <Form.Item label="Cover Image">
            <div className="relative">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleEditImageChange}
                accept="image/*"
                disabled={uploadingEdit}
              >
                {editImagePreview ? (
                  <img
                    src={editImagePreview}
                    alt="cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <UploadButton loading={uploadingEdit} />
                )}
              </Upload>
              {editImagePreview && !uploadingEdit && (
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={handleRemoveEditImage}
                  style={{ marginTop: 4 }}
                >
                  Remove Image
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item name="cover_image" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter blog description" />
          </Form.Item>

          <Form.Item label="Quote Text" name="quote_text">
            <TextArea rows={2} placeholder="Enter quote text (optional)" />
          </Form.Item>

          <Form.Item label="Quote Author" name="quote_author">
            <Input placeholder="Enter quote author (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Blogs;
