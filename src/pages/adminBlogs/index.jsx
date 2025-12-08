import React, { useState, useEffect } from "react";
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
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { TabPane } = Tabs;
const { TextArea } = Input;

const Blogs = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(false);

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

    // Map admin_blogs.hidden -> UI status
    const transformBlogStatus = (hidden) => {
        if (hidden === "0" || hidden === 0) return "accepted";
        return "rejected";
    };

    // Fetch blogs from API
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${base_url}/admin/admin_blogs/select_blogs.php`
            );

            if (response.data.status === "success") {
                const transformedBlogs =
                    response?.data.message?.map((blog) => ({
                        id: blog.blog_id,
                        title: blog.title,
                        description: blog.description,
                        postImage: blog.cover_image,
                        // profileImage: blog.user_data?.image,
                        // pageName: blog.user_data?.full_name,
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
            } else {
                message.error("Failed to fetch blogs");
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            message.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Filter posts
    const filteredPosts =
        activeTab === "all"
            ? posts
            : posts.filter((post) => post.status === activeTab);

    const acceptedCount = posts.filter((p) => p.status === "accepted").length;
    const rejectedCount = posts.filter((p) => p.status === "rejected").length;

    // Toggle hidden
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
    const handleDeletePost = async (post) => {
        try {
            const response = await axios.post(
                `${base_url}/admin/admin_blogs/delete_blog.php`,
                { blog_id: post.id },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data?.status === "success") {
                setPosts((e) => e.filter((p) => p.id != post?.id))
                if (selectedPost?.id === post.id) {
                    setSelectedPost(null);
                }

                message.success("Blog deleted successfully");
            } else {
                throw new Error("Failed to toggle blog status");
            }
        } catch (error) {
            console.error("Error toggling blog:", error);
            message.error("Failed to update blog status");
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

    // ========= File Validation =========
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

    // ========= Image Upload Handler (Reusable) =========
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await axios.post(
            `${base_url}/user/item_img_uploader.php`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    };


    // ========= Add Blog Modal =========
    const openAddModal = () => {
        addForm.resetFields();
        setAddImagePreview(null);
        setIsAddModalOpen(true);
    };

    const handleAddImageChange = async (info) => {
        const { file } = info;

        // Only process new file selections
        if (!file || file.status === "removed") return;

        const fileObj = file.originFileObj || file;

        if (!fileObj || !fileObj.type) {
            return;
        }

        // Validate file
        if (!validateFile(fileObj)) {
            return;
        }

        setUploadingAdd(true);

        try {
            const responseData = await uploadImage(fileObj);



            if (responseData) {
                const imageUrl = responseData

                if (!imageUrl) {
                    console.error("Response structure:", responseData);
                    message.error("Upload succeeded but no image URL found in response");
                    return;
                }

                setAddImagePreview(imageUrl);
                addForm.setFieldsValue({ cover_image: imageUrl });
                message.success("Image uploaded successfully");
            } else {
                message.error(responseData?.message || "Failed to upload image");
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
                await fetchBlogs();
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

    // ========= Edit Blog Modal =========
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

        if (!fileObj || !fileObj.type) {
            return;
        }

        if (!validateFile(fileObj)) {
            return;
        }

        setUploadingEdit(true);

        try {
            const responseData = await uploadImage(fileObj);


            if (responseData) {
                const imageUrl = responseData

                if (!imageUrl) {
                    console.error("Response structure:", responseData);
                    message.error("Upload succeeded but no image URL found in response");
                    return;
                }

                setEditImagePreview(imageUrl);
                editForm.setFieldsValue({ cover_image: imageUrl });
                message.success("Image uploaded successfully");
            } else {
                message.error(responseData?.message || "Failed to upload image");
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
            const payload = {
                blog_id: editingPost.id,
                ...values,
            };

            const response = await axios.post(
                `${base_url}/admin/admin_blogs/edit_blog.php`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data?.status === "success") {
                message.success("Blog updated successfully");
                setIsEditModalOpen(false);
                await fetchBlogs();
            } else if (response.data?.status === "found") {
                message.warning(response.data.message || "Another blog with same title exists");
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

    // ========= Upload Button Component =========
    const UploadButton = ({ loading }) => (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>{loading ? "Uploading..." : "Upload"}</div>
        </div>
    );

    // ========= Remove Image Handlers =========
    const handleRemoveAddImage = () => {
        setAddImagePreview(null);
        addForm.setFieldsValue({ cover_image: "" });
    };

    const handleRemoveEditImage = () => {
        setEditImagePreview(null);
        editForm.setFieldsValue({ cover_image: "" });
    };

    return (
        <div className="p-4">
            {/* Header + Add Button */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Blogs Management</h2>
                <Button type="primary" onClick={openAddModal}>
                    Add Blog
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    className="custom-tabs"
                >
                    <TabPane tab={<span>All Blogs ({posts.length})</span>} key="all" />
                    <TabPane
                        tab={
                            <span>
                                Published{" "}
                                <Badge count={acceptedCount} style={{ backgroundColor: "#52c41a" }} />
                            </span>
                        }
                        key="accepted"
                    />
                    <TabPane
                        tab={
                            <span>
                                Hidden{" "}
                                <Badge count={rejectedCount} style={{ backgroundColor: "#f5222d" }} />
                            </span>
                        }
                        key="rejected"
                    />
                </Tabs>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-10 text-gray-500">
                        Loading blogs...
                    </div>
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
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
                    <div className="col-span-3 text-center py-10 text-gray-500">
                        No blogs found in this category
                    </div>
                )}
            </div>

            {/* Framer Modal */}
            {selectedPost?.status === "accepted" && (
                <FramerModal
                    open={selectedPost !== null}
                    setOpen={() => setSelectedPost(null)}
                    setSelectedPost={setSelectedPost}
                    selectedPost={selectedPost}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    fetchBlogs={fetchBlogs}
                />
            )}

            {/* Add Blog Modal */}
            <Modal
                title="Add Blog"
                open={isAddModalOpen}
                onCancel={() => {
                    if (!uploadingAdd) {
                        setIsAddModalOpen(false);
                    }
                }}
                okText="Add"
                onOk={() => addForm.submit()}
                confirmLoading={saving}
                okButtonProps={{ disabled: uploadingAdd }}
                destroyOnClose
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
                        <Input />
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
                                    <div className="relative w-full h-full">
                                        <img
                                            src={addImagePreview}
                                            alt="cover"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
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
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item label="Quote Text" name="quote_text">
                        <TextArea rows={2} />
                    </Form.Item>

                    <Form.Item label="Quote Author" name="quote_author">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Category" name="category">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Blog Modal */}
            <Modal
                title="Edit Blog"
                open={isEditModalOpen}
                onCancel={() => {
                    if (!uploadingEdit) {
                        setIsEditModalOpen(false);
                    }
                }}
                okText="Update"
                onOk={() => editForm.submit()}
                confirmLoading={saving}
                okButtonProps={{ disabled: uploadingEdit }}
                destroyOnClose
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
                        <Input />
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
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item label="Quote Text" name="quote_text">
                        <TextArea rows={2} />
                    </Form.Item>

                    <Form.Item label="Quote Author" name="quote_author">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Category" name="category">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Blogs;