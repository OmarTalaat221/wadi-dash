import React, { useState } from "react";
import PostCard from "../../components/PostCard/PostCard";
import { posts as initialPosts } from "../../data/posts";
import FramerModal from "../../components/FramerModal/FramerModal";
import { Tabs, Badge, message } from "antd";

const { TabPane } = Tabs;

const Community = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState("all");

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

  // Handle accept post
  const handleAccept = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: "accepted" } : post
      )
    );
    message.success("Post accepted successfully");
  };

  // Handle reject post
  const handleReject = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: "rejected" } : post
      )
    );
    message.error("Post rejected");
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
          <TabPane tab={<span>All Posts ({posts.length})</span>} key="all" />
          <TabPane
            tab={
              <span>
                Pending{" "}
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
                Accepted{" "}
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
                Rejected{" "}
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
        {filteredPosts.length > 0 ? (
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
            No posts found in this category
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
        />
      )}
    </div>
  );
};

export default Community;
