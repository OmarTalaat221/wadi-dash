import React, { useState } from "react";
import PostCard from "../../components/PostCard/PostCard";
import { posts } from "../../data/posts";
import FramerModal from "../../components/FramerModal/FramerModal";

const Community = () => {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} setSelectedPost={setSelectedPost} />
      ))}

      <FramerModal
        open={selectedPost !== null}
        setOpen={() => setSelectedPost(null)}
        setSelectedPost={setSelectedPost}
        selectedPost={selectedPost}
      />
    </div>
  );
};

export default Community;
