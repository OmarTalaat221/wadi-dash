import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import PostCard from "./../PostCard/PostCard";

const FramerModal = ({ open, setOpen, setSelectedPost, selectedPost ,  }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  const closeModal = () => {
    setOpen(false);
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div>
      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="  fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 "
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants || null}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <PostCard
                post={selectedPost}
                setSelectedPost={setSelectedPost}
                width="w-full px-4"
              />

              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3">Comments</h4>
                <div className="space-y-4">
                  {selectedPost?.commentsData.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2">
                          <p className="font-semibold text-sm text-gray-900">
                            {comment.user.name}
                          </p>
                          <p className="text-gray-800">{comment.text}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{comment.time}</span>
                          {/* <button className="hover:underline">Like</button>
                      <button className="hover:underline">Reply</button> */}
                          {/* <span>{comment.likes} likes</span> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* <div className="flex flex-col gap-5 p-5 ">
                {selectedPost?.likedBy.map((like) => (
                  <div key={like.name} className="flex items-center gap-2 border-b border-gray-200 pb-5">
                    <img
                      src={like.avatar}
                      alt={like.name}
                      className="w-[50px] h-[50px] rounded-full"
                    />
                    <p>{like.name}</p>
                  </div>
                ))}
              </div> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FramerModal;
