import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";

const GalleryModal = ({ open, setOpen, children }) => {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                opacity: modalVariants.hidden.opacity,
                scale: modalVariants.hidden.scale,
                y: modalVariants.hidden.y,
              }}
              animate={{
                opacity: modalVariants.visible.opacity,
                scale: modalVariants.visible.scale,
                y: modalVariants.visible.y,
                transition: {
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                },
              }}
              exit={{
                opacity: modalVariants.exit.opacity,
                scale: modalVariants.exit.scale,
                y: modalVariants.exit.y,
                transition: {
                  duration: 0.2,
                },
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryModal;
