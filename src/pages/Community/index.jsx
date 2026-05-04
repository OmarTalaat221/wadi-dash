import React, { useState, useEffect, useCallback } from "react";
import PostCard from "../../components/PostCard/PostCard";
import FramerModal from "../../components/FramerModal/FramerModal";
import EditBlogModal from "../../components/EditBlogModal/EditBlogModal"; // ✅ Added
import { Tabs, Badge, message, Pagination, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { useSearchParams } from "react-router-dom";

const { TabPane } = Tabs;
const { confirm } = Modal;

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentLimit = parseInt(searchParams.get("limit") || "10");
  const currentTab = searchParams.get("tab") || "all";

  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // ✅ Added
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const updateParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (key === "page" && value === 1) ||
          (key === "limit" && value === 10) ||
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

  const fetchBlogs = useCallback(
    async (page = currentPage, limit = currentLimit, tab = currentTab) => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (tab === "pending") params.status = "draft";
        else if (tab === "accepted") params.status = "published";
        else if (tab === "rejected") params.status = "hidden";

        const response = await axios.post(
          `${base_url}/admin/blogs/select_blogs.php`,
          null,
          { params }
        );

        if (response.data.status === "success") {
          const transformedBlogs = response.data.message?.map((blog) => ({
            id: blog.blog_id,
            title: blog.title,
            category_name: blog.category_name,
            description: blog.description,
            postImage: blog.cover_image || "",
            profileImage: blog.user_data?.image?.trim() || "",
            pageName: blog.user_data?.full_name || "Unknown User",
            status: transformBlogStatus(blog.status),
            category: blog.category,
            likes: Math.floor(Math.random() * 100),
            comments: blog.comments || [],
            shares: Math.floor(Math.random() * 10),
            createdAt: blog.created_at,
            updatedAt: blog.updated_at,
            quoteText: blog.quote_text,
            quoteAuthor: blog.quote_author,
            originalBlogId: blog.blog_id,
          }));

          setPosts(transformedBlogs || []);
          const pg = response.data.pagination;
          setTotal(pg?.total_items || transformedBlogs?.length || 0);
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

  const transformBlogStatus = (blogStatus) => {
    switch (blogStatus) {
      case "published":
        return "accepted";
      case "draft":
        return "pending";
      case "hidden":
        return "rejected";
      default:
        return "pending";
    }
  };

  useEffect(() => {
    fetchBlogs(currentPage, currentLimit, currentTab);
  }, [currentPage, currentLimit, currentTab]);

  const handleTabChange = (tab) => updateParams({ tab, page: 1 });

  const handlePageChange = (page, pageSize) => {
    updateParams({ page, limit: pageSize });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAccept = async (postId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/blogs/toggle_blog.php`,
        { blog_id: postId, status: "published" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status == "success") {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, status: "accepted" } : post
          )
        );
        message.success("Blog published successfully");
      } else {
        throw new Error("Failed to publish blog");
      }
    } catch (error) {
      console.error("Error publishing blog:", error);
      message.error("Failed to publish blog");
    }
  };

  const handleReject = async (postId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/blogs/toggle_blog.php`,
        { blog_id: postId, status: "hidden" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status == "success") {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, status: "rejected" } : post
          )
        );
        message.warning("Blog hidden");
      } else {
        throw new Error("Failed to hide blog");
      }
    } catch (error) {
      console.error("Error hiding blog:", error);
      message.error("Failed to hide blog");
    }
  };

  const handleDelete = useCallback(
    (postId, postTitle) => {
      confirm({
        title: "Delete Blog",
        icon: <ExclamationCircleOutlined className="!text-red-500" />,
        content: (
          <div>
            <p>
              Are you sure you want to delete <strong>"{postTitle}"</strong>?
            </p>
            <p className="text-red-500 text-sm mt-2">
              ⚠️ This action cannot be undone. All comments will also be
              deleted.
            </p>
          </div>
        ),
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            const response = await axios.post(
              `${base_url}/admin/blogs/delete_blog.php`,
              { blog_id: postId }
            );

            if (response.data.status === "success") {
              setPosts((prev) => prev.filter((post) => post.id !== postId));
              setTotal((prev) => prev - 1);
              message.success("Blog deleted successfully");
              setSelectedPost((prev) => (prev?.id === postId ? null : prev));
            } else {
              message.error(response.data.message || "Failed to delete blog");
            }
          } catch (error) {
            console.error("Error deleting blog:", error);
            message.error("Failed to delete blog");
          }
        },
      });
    },
    [setSelectedPost]
  );

  // ✅ Open edit modal with post data
  const handleEdit = useCallback((post) => {
    setEditingPost(post);
  }, []);

  // ✅ Update post in UI after successful edit
  const handleEditSuccess = useCallback((updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
    );
    // ✅ Sync FramerModal if it's open on the same post
    setSelectedPost((prev) =>
      prev?.id === updatedPost.id ? { ...prev, ...updatedPost } : prev
    );
    setEditingPost(null);
  }, []);

  return (
    <div className="p-4">
      {/* Filter Tabs */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <Tabs
          activeKey={currentTab}
          onChange={handleTabChange}
          type="card"
          className="custom-tabs"
        >
          <TabPane tab={<span>All Blogs ({total})</span>} key="all" />
          <TabPane
            tab={
              <span>
                Draft{" "}
                <Badge
                  count={currentTab === "pending" ? total : undefined}
                  style={{ backgroundColor: "#faad14" }}
                />
              </span>
            }
            key="pending"
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

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(currentLimit)].map((_, i) => (
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
              onAccept={handleAccept}
              onReject={handleReject}
              onDelete={handleDelete}
              onEdit={handleEdit} // ✅ Added
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

      {/* Pagination */}
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
          />
        </div>
      )}

      {/* View Modal */}
      {selectedPost !== null && (
        <FramerModal
          open={selectedPost !== null}
          setOpen={() => setSelectedPost(null)}
          setSelectedPost={setSelectedPost}
          selectedPost={selectedPost}
          onAccept={handleAccept}
          onReject={handleReject}
          onDelete={handleDelete}
          onEdit={handleEdit} // ✅ Added
          fetchBlogs={() => fetchBlogs(currentPage, currentLimit, currentTab)}
        />
      )}

      {/* ✅ Edit Modal */}
      <EditBlogModal
        open={editingPost !== null}
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default Community;
