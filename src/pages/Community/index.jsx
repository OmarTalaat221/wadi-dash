import React, { useState, useEffect } from "react";
import PostCard from "../../components/PostCard/PostCard";
import FramerModal from "../../components/FramerModal/FramerModal";
import { Tabs, Badge, message } from "antd";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { TabPane } = Tabs;

const Community = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/blogs/select_blogs.php`
      );

      if (response.data.status === "success") {
        const transformedBlogs = response?.data.message?.map((blog) => ({
          id: blog.blog_id,
          title: blog.title,
          category_name: blog.category_name,

          description: blog.description,
          postImage: blog.cover_image,
          profileImage: blog.user_data.image,
          pageName: blog.user_data.full_name,
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
        setPosts(transformedBlogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

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
    fetchBlogs();
  }, []);

  // Filter posts based on active tab
  const filteredPosts =
    activeTab === "all"
      ? posts
      : posts.filter((post) => post.status === activeTab);

  // Count posts by status
  const pendingCount = posts.filter((post) => post.status === "pending").length;
  const acceptedCount = posts.filter(
    (post) => post.status === "accepted"
  ).length;
  const rejectedCount = posts.filter(
    (post) => post.status === "rejected"
  ).length;

  // Handle accept blog
  const handleAccept = async (postId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/blogs/toggle_blog.php`,
        {
          blog_id: postId,
          status: "published",
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status == "success") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
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

  // Handle reject blog
  const handleReject = async (postId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/blogs/toggle_blog.php`,
        {
          blog_id: postId,
          status: "hidden",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status == "success") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, status: "rejected" } : post
          )
        );
        message.error("Blog hidden");
      } else {
        throw new Error("Failed to hide blog");
      }
    } catch (error) {
      console.error("Error hiding blog:", error);
      message.error("Failed to hide blog");
    }
  };

  return (
    <div className="p-4">
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
                Draft{" "}
                <Badge
                  count={pendingCount}
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
                  count={acceptedCount}
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
                  count={rejectedCount}
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
          <div className="col-span-3 text-center py-10 text-gray-500">
            Loading blogs...
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              setSelectedPost={setSelectedPost}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-10 text-gray-500">
            No blogs found in this category
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Community;
