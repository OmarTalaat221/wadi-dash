import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Modal,
  Button,
  Upload,
  message,
  Typography,
  Space,
  Popconfirm,
  Spin,
  Tag,
  Tooltip,
  Input,
  Form,
  Select,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  EditOutlined,
  GlobalOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { AsyncImage } from "loadable-image";
import { Blur } from "transitions-kit";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { uploadImageToServer } from "../../hooks/uploadImage";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

// ─── Skeleton loader (shown while AsyncImage fetches) ─────────────────────────
const ImageSkeleton = memo(() => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "gal-shimmer 1.4s infinite linear",
    }}
  />
));
ImageSkeleton.displayName = "ImageSkeleton";

// ─── Error placeholder ────────────────────────────────────────────────────────
const ImageError = memo(() => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f9fafb",
      color: "#d1d5db",
      gap: 6,
      fontSize: 12,
    }}
  >
    <span style={{ fontSize: 28 }}>🖼️</span>
    <span>Image unavailable</span>
  </div>
));
ImageError.displayName = "ImageError";

// ─── Action button ─────────────────────────────────────────────────────────────
const ActionBtn = memo(
  ({ children, hoverColor, hoverBg, onClick, disabled }) => {
    const [hov, setHov] = useState(false);
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: "9px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          background: hov && !disabled ? hoverBg : "transparent",
          color: hov && !disabled ? hoverColor : "#9ca3af",
          transition: "background 0.15s, color 0.15s",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {children}
      </button>
    );
  }
);
ActionBtn.displayName = "ActionBtn";

// ─── Photo Card ────────────────────────────────────────────────────────────────
const PhotoCard = memo(
  ({
    photo,
    onPreview,
    onEdit,
    onToggle,
    onDelete,
    toggling,
    getCategoryName,
    getCountryName,
  }) => {
    const [hov, setHov] = useState(false);

    const isHidden = photo.hidden === "1";
    const isToggling = toggling === photo.id;

    // All expensive lookups isolated here — won't re-run unless IDs change
    const categoryName = useMemo(
      () => getCategoryName(photo.category_id),
      [photo.category_id, getCategoryName]
    );
    const countryName = useMemo(
      () => getCountryName(photo.country_id),
      [photo.country_id, getCountryName]
    );
    const formattedDate = useMemo(
      () => new Date(photo.created_at).toLocaleDateString(),
      [photo.created_at]
    );

    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          // GPU-promoted layer — hover won't trigger layout
          willChange: "transform",
          transform: hov ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hov
            ? "0 10px 28px rgba(0,0,0,0.11)"
            : "0 1px 4px rgba(0,0,0,0.05)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          // Isolate paint/layout per card
          contain: "layout style paint",
        }}
      >
        {/* ── Image ── */}
        <div
          style={{
            position: "relative",
            height: 192,
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={() => onPreview(photo)}
        >
          {/* AsyncImage handles:
            • Intersection Observer (lazy load)
            • Blur transition on reveal
            • Skeleton while loading
            • Error slot                          */}
          <AsyncImage
            src={photo.image}
            alt={photo.title || "Gallery image"}
            Transition={Blur}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isHidden ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}
            loader={
              <div className="flex justify-center items-center h-full">
                <Spin
                  size="default"
                  className="animate-spin text-2xl !text-green-500"
                />
              </div>
            }
            error={<ImageError />}
          />

          {/* Visibility badge */}
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 9px",
              borderRadius: 999,
              border: `1px solid ${isHidden ? "#fca5a5" : "#86efac"}`,
              background: isHidden
                ? "rgba(254,242,242,0.92)"
                : "rgba(240,253,244,0.92)",
              color: isHidden ? "#dc2626" : "#16a34a",
              backdropFilter: "blur(4px)",
              pointerEvents: "none",
            }}
          >
            {isHidden ? "Hidden" : "Visible"}
          </span>

          {/* Category / Country pills */}
          {(photo.category_id || photo.country_id) && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                pointerEvents: "none",
              }}
            >
              {photo.category_id && (
                <span style={pillStyle("#7c3aed")}>
                  <FolderOutlined style={{ fontSize: 9 }} />
                  {categoryName}
                </span>
              )}
              {photo.country_id && (
                <span style={pillStyle("#2563eb")}>
                  <GlobalOutlined style={{ fontSize: 9 }} />
                  {countryName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Meta ── */}
        <div style={{ padding: "10px 12px", flex: 1 }}>
          <Tooltip title={photo.title || "No title"}>
            <p style={metaTitle}>{photo.title || "Untitled"}</p>
          </Tooltip>
          <p style={metaSub}>
            {formattedDate} · ID: {photo.id}
          </p>
        </div>

        {/* ── Actions ── */}
        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          <Tooltip title="Preview">
            <ActionBtn
              hoverColor="#3b82f6"
              hoverBg="#eff6ff"
              onClick={() => onPreview(photo)}
            >
              <EyeOutlined />
            </ActionBtn>
          </Tooltip>

          <Tooltip title="Edit">
            <ActionBtn
              hoverColor="#22c55e"
              hoverBg="#f0fdf4"
              onClick={() => onEdit(photo)}
            >
              <EditOutlined />
            </ActionBtn>
          </Tooltip>

          <Tooltip title={isHidden ? "Show" : "Hide"}>
            <ActionBtn
              hoverColor="#f59e0b"
              hoverBg="#fffbeb"
              onClick={() => onToggle(photo)}
              disabled={isToggling}
            >
              {isToggling ? (
                <Spin size="small" />
              ) : isHidden ? (
                <EyeInvisibleOutlined />
              ) : (
                <EyeOutlined />
              )}
            </ActionBtn>
          </Tooltip>

          <Popconfirm
            title="Delete this photo?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(photo.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <ActionBtn hoverColor="#ef4444" hoverBg="#fef2f2">
                <DeleteOutlined />
              </ActionBtn>
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    );
  }
);
PhotoCard.displayName = "PhotoCard";

// ── tiny style objects defined outside render (no re-allocation per render) ───
const pillStyle = (bg) => ({
  fontSize: 10,
  fontWeight: 600,
  padding: "2px 8px",
  borderRadius: 999,
  background: bg + "d0", // hex + alpha
  color: "#fff",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const metaTitle = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  color: "#111",
  textAlign: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const metaSub = {
  margin: "4px 0 0",
  fontSize: 11,
  color: "#9ca3af",
  textAlign: "center",
};

// ─── Upload area ──────────────────────────────────────────────────────────────
const UploadArea = memo(({ uploadProps, label = "Select Image" }) => (
  <Upload {...uploadProps}>
    {uploadProps.fileList.length === 0 && (
      <div className="flex flex-col items-center">
        <PlusOutlined className="text-xl text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">{label}</p>
      </div>
    )}
  </Upload>
));
UploadArea.displayName = "UploadArea";

// ─── Shimmer keyframe (injected once, shared by all cards) ───────────────────
const ShimmerStyle = () => (
  <style>{`
    @keyframes gal-shimmer {
      0%   { background-position:  200% 0 }
      100% { background-position: -200% 0 }
    }
  `}</style>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toggling, setToggling] = useState(null);

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // O(1) lookup maps — recomputed only when raw arrays change
  const countryMap = useMemo(() => {
    const m = {};
    countries.forEach((c) => {
      m[c.country_id] = c.country_name;
      m[String(c.country_id)] = c.country_name;
    });
    return m;
  }, [countries]);

  const categoryMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      m[c.category_id] = c.category;
      m[String(c.category_id)] = c.category;
    });
    return m;
  }, [categories]);

  const getCountryName = useCallback(
    (id) => countryMap[id] ?? countryMap[String(id)] ?? "Unknown",
    [countryMap]
  );
  const getCategoryName = useCallback(
    (id) => categoryMap[id] ?? categoryMap[String(id)] ?? "Unknown",
    [categoryMap]
  );

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.hidden === "0"),
    [categories]
  );

  // ── Fetchers ──────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await axios.get(
        `${base_url}/admin/gallary/categories/select_category.php`
      );
      if (data?.status === "success") setCategories(data.message || []);
      else message.error("Failed to fetch categories");
    } catch {
      message.error("Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    setCountriesLoading(true);
    try {
      const { data } = await axios.get(
        `${base_url}/user/countries/select_countries.php`
      );
      if (data?.status === "success") setCountries(data.message || []);
      else message.error("Failed to fetch countries");
    } catch {
      message.error("Failed to load countries.");
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${base_url}/admin/gallary/select_gallary.php`
      );
      if (data?.status === "success") setPhotos(data.message || []);
      else message.error("Failed to fetch gallery");
    } catch {
      message.error("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
    fetchCountries();
    fetchCategories();
  }, [fetchGallery, fetchCountries, fetchCategories]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleAddPhoto = useCallback(() => {
    setFileList([]);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const handleEditPhoto = useCallback(
    (photo) => {
      setCurrentPhoto(photo);
      setEditFileList([]);
      editForm.setFieldsValue({
        title: photo.title,
        country_id: photo.country_id ? String(photo.country_id) : undefined,
        category_id: photo.category_id ? String(photo.category_id) : undefined,
      });
      setEditModalOpen(true);
    },
    [editForm]
  );

  const handleDeletePhoto = useCallback(async (photoId) => {
    try {
      const { data } = await axios.post(
        `${base_url}/admin/gallary/delete_gallary.php`,
        { id: parseInt(photoId) }
      );
      if (data?.status === "success") {
        message.success("Photo deleted");
        setPhotos((prev) => prev.filter((p) => p.id !== photoId)); // optimistic
      } else throw new Error(data?.message);
    } catch (err) {
      message.error(err.message || "Failed to delete.");
    }
  }, []);

  const handleToggleVisibility = useCallback(async (photo) => {
    setToggling(photo.id);
    try {
      const { data } = await axios.post(
        `${base_url}/admin/gallary/toggle_image.php`,
        { id: parseInt(photo.id) }
      );
      if (data?.status === "success") {
        const wasHidden = photo.hidden === "1";
        message.success(`Photo ${wasHidden ? "shown" : "hidden"}`);
        setPhotos(
          (
            prev // optimistic
          ) =>
            prev.map((p) =>
              p.id === photo.id ? { ...p, hidden: wasHidden ? "0" : "1" } : p
            )
        );
      } else throw new Error(data?.message);
    } catch (err) {
      message.error(err.message || "Failed to toggle.");
    } finally {
      setToggling(null);
    }
  }, []);

  const handlePreviewPhoto = useCallback((photo) => {
    setCurrentPhoto({ ...photo });
    setPreviewModalOpen(true);
  }, []);

  const handleUploadPhoto = useCallback(
    async (values) => {
      if (!fileList.length) {
        message.error("Please select an image");
        return;
      }
      setUploading(true);
      try {
        const file = fileList[0].originFileObj || fileList[0];
        message.loading("Uploading…", 0);
        const imageUrl = await uploadImageToServer(file);
        message.destroy();
        if (!imageUrl) throw new Error("No URL returned");

        const { data } = await axios.post(
          `${base_url}/admin/gallary/add_gallary.php`,
          {
            image: imageUrl,
            category_id: parseInt(values.category_id),
            country_id: parseInt(values.country_id),
          }
        );
        if (data?.status === "success") {
          message.success("Photo uploaded!");
          await fetchGallery();
          setModalOpen(false);
          setFileList([]);
          form.resetFields();
        } else throw new Error(data?.message);
      } catch (err) {
        message.destroy();
        message.error(err.message || "Failed to upload.");
      } finally {
        setUploading(false);
      }
    },
    [fileList, fetchGallery, form]
  );

  const handleUpdatePhoto = useCallback(
    async (values) => {
      if (!currentPhoto) return;
      setUpdating(true);
      try {
        let imageUrl = currentPhoto.image;
        if (editFileList.length) {
          const file = editFileList[0].originFileObj || editFileList[0];
          message.loading("Uploading…", 0);
          imageUrl = await uploadImageToServer(file);
          message.destroy();
          if (!imageUrl) throw new Error("No URL returned");
        }
        const { data } = await axios.post(
          `${base_url}/admin/gallary/edit_galary.php`,
          {
            id: parseInt(currentPhoto.id),
            category_id: parseInt(values.category_id),
            country_id: parseInt(values.country_id),
            title: values.title || "",
            image: imageUrl,
          }
        );
        if (data?.status === "success") {
          message.success("Photo updated!");
          setPhotos(
            (
              prev // optimistic
            ) =>
              prev.map((p) =>
                p.id === currentPhoto.id
                  ? {
                      ...p,
                      title: values.title || "",
                      category_id: values.category_id,
                      country_id: values.country_id,
                      image: imageUrl,
                    }
                  : p
              )
          );
          setEditModalOpen(false);
          setEditFileList([]);
          editForm.resetFields();
          setCurrentPhoto(null);
        } else throw new Error(data?.message);
      } catch (err) {
        message.destroy();
        message.error(err.message || "Failed to update.");
      } finally {
        setUpdating(false);
      }
    },
    [currentPhoto, editFileList, editForm]
  );

  const handleCancel = useCallback(() => {
    setModalOpen(false);
    setFileList([]);
    form.resetFields();
  }, [form]);
  const handleEditCancel = useCallback(() => {
    setEditModalOpen(false);
    setEditFileList([]);
    editForm.resetFields();
    setCurrentPhoto(null);
  }, [editForm]);
  const handleRefresh = useCallback(() => {
    fetchGallery();
    fetchCountries();
    fetchCategories();
  }, [fetchGallery, fetchCountries, fetchCategories]);

  // Stable upload props — only recreate when fileList reference changes
  const uploadProps = useMemo(
    () => ({
      onRemove: () => setFileList([]),
      beforeUpload: (file) => {
        if (!file.type.startsWith("image/")) {
          message.error("Images only!");
          return false;
        }
        if (file.size / 1024 / 1024 >= 10) {
          message.error("Max 10MB!");
          return false;
        }
        setFileList([file]);
        return false;
      },
      fileList,
      listType: "picture-card",
      accept: "image/*",
    }),
    [fileList]
  );

  const editUploadProps = useMemo(
    () => ({
      onRemove: () => setEditFileList([]),
      beforeUpload: (file) => {
        if (!file.type.startsWith("image/")) {
          message.error("Images only!");
          return false;
        }
        if (file.size / 1024 / 1024 >= 10) {
          message.error("Max 10MB!");
          return false;
        }
        setEditFileList([file]);
        return false;
      },
      fileList: editFileList,
      listType: "picture-card",
      accept: "image/*",
    }),
    [editFileList]
  );

  // Preview helpers
  const previewVisibility = useMemo(
    () => ({
      color: currentPhoto?.hidden === "1" ? "red" : "green",
      text: currentPhoto?.hidden === "1" ? "Hidden" : "Visible",
    }),
    [currentPhoto?.hidden]
  );

  const previewDate = useMemo(
    () =>
      currentPhoto?.created_at
        ? new Date(currentPhoto.created_at).toLocaleString()
        : "",
    [currentPhoto?.created_at]
  );

  // Country/category select options (stable JSX arrays)
  const countryOptions = useMemo(
    () =>
      countries.map((c) => (
        <Option key={c.country_id} value={c.country_id}>
          {c.country_name}
        </Option>
      )),
    [countries]
  );

  const categoryOptions = useMemo(
    () =>
      visibleCategories.map((c) => (
        <Option key={c.category_id} value={c.category_id}>
          {c.category}
        </Option>
      )),
    [visibleCategories]
  );

  const filterOption = useCallback(
    (input, option) =>
      (option?.children ?? "").toLowerCase().includes(input.toLowerCase()),
    []
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <ShimmerStyle />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Photo Gallery</Title>
          <Space>
            <Button
              type="default"
              icon={<GlobalOutlined />}
              onClick={() => navigate("/gallery/categories")}
            >
              Manage Categories
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPhoto}
            >
              Add Photo
            </Button>
          </Space>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" tip="Loading gallery…" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No photos in gallery yet</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPhoto}
            >
              Add Your First Photo
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
              contain: "layout", // page-level containment
            }}
          >
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onPreview={handlePreviewPhoto}
                onEdit={handleEditPhoto}
                onToggle={handleToggleVisibility}
                onDelete={handleDeletePhoto}
                toggling={toggling}
                getCategoryName={getCategoryName}
                getCountryName={getCountryName}
              />
            ))}
          </div>
        )}

        {/* ── Add Modal ── */}
        <Modal
          title="Add New Photo"
          open={modalOpen}
          onCancel={handleCancel}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUploadPhoto}
            className="py-4"
          >
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select
                placeholder="Select a category"
                loading={categoriesLoading}
                showSearch
                optionFilterProp="children"
                filterOption={filterOption}
              >
                {categoryOptions}
              </Select>
            </Form.Item>
            <Form.Item
              name="country_id"
              label="Country"
              rules={[{ required: true, message: "Please select a country" }]}
            >
              <Select
                placeholder="Select a country"
                loading={countriesLoading}
                showSearch
                optionFilterProp="children"
                filterOption={filterOption}
              >
                {countryOptions}
              </Select>
            </Form.Item>
            <Form.Item label="Select Image" required>
              <UploadArea uploadProps={uploadProps} />
            </Form.Item>
            {fileList.length > 0 && (
              <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
                <p className="font-medium text-blue-800">Upload Info:</p>
                <p>• Max 10MB · JPG, PNG, GIF, WebP</p>
              </div>
            )}
            <Form.Item className="mb-0 mt-6">
              <Space className="flex justify-end">
                <Button onClick={handleCancel} disabled={uploading}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={uploading}
                  disabled={!fileList.length}
                >
                  Upload Photo
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── Edit Modal ── */}
        <Modal
          title="Edit Photo"
          open={editModalOpen}
          onCancel={handleEditCancel}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdatePhoto}
            className="py-4"
          >
            {currentPhoto && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Current Image:
                </p>
                <div
                  style={{
                    height: 160,
                    position: "relative",
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <AsyncImage
                    src={currentPhoto.image}
                    alt="current"
                    Transition={Blur}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    loader={
                      <div className="flex justify-center items-center h-full">
                        <Spin className="animate-spin text-2xl !text-green-500" />
                      </div>
                    }
                    error={<ImageError />}
                  />
                </div>
              </div>
            )}
            <Form.Item name="title" label="Photo Title">
              <Input
                placeholder="Enter a descriptive title"
                showCount
                maxLength={100}
              />
            </Form.Item>
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select
                placeholder="Select a category"
                loading={categoriesLoading}
                showSearch
                optionFilterProp="children"
                filterOption={filterOption}
              >
                {categoryOptions}
              </Select>
            </Form.Item>
            <Form.Item
              name="country_id"
              label="Country"
              rules={[{ required: true, message: "Please select a country" }]}
            >
              <Select
                placeholder="Select a country"
                loading={countriesLoading}
                showSearch
                optionFilterProp="children"
                filterOption={filterOption}
              >
                {countryOptions}
              </Select>
            </Form.Item>
            <Form.Item label="Change Image (Optional)">
              <UploadArea
                uploadProps={editUploadProps}
                label="Select New Image"
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave empty to keep the current image
              </p>
            </Form.Item>
            <Form.Item className="mb-0 mt-6">
              <Space className="flex justify-end">
                <Button onClick={handleEditCancel} disabled={updating}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={updating}>
                  Update Photo
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── Preview Modal ── */}
        <Modal
          title={
            <p className="text-center font-semibold text-base mb-0">
              {currentPhoto?.title || "Untitled"}
            </p>
          }
          open={previewModalOpen}
          onCancel={() => setPreviewModalOpen(false)}
          footer={[
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setPreviewModalOpen(false);
                handleEditPhoto(currentPhoto);
              }}
            >
              Edit
            </Button>,
            <Button key="close" onClick={() => setPreviewModalOpen(false)}>
              Close
            </Button>,
          ]}
          width={900}
          centered
          destroyOnClose
        >
          <div className="flex flex-col items-center gap-4">
            <div
              style={{
                width: "100%",
                maxHeight: "70vh",
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                minHeight: 300,
              }}
            >
              <AsyncImage
                src={currentPhoto?.image}
                alt={currentPhoto?.title || "Preview"}
                Transition={Blur}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  maxHeight: "70vh",
                }}
                loader={
                  <div className="flex justify-center items-center h-full">
                    <Spin className="animate-spin text-2xl !text-green-500" />
                  </div>
                }
                error={<ImageError />}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-center w-full">
              <p className="font-medium text-gray-900 mb-2">
                {currentPhoto?.title || "Untitled"}
              </p>
              <Space wrap className="justify-center mb-2">
                <Tag color={previewVisibility.color}>
                  {previewVisibility.text}
                </Tag>
                {currentPhoto?.category_id && (
                  <Tag color="purple" icon={<FolderOutlined />}>
                    {getCategoryName(currentPhoto.category_id)}
                  </Tag>
                )}
                {currentPhoto?.country_id && (
                  <Tag color="blue" icon={<GlobalOutlined />}>
                    {getCountryName(currentPhoto.country_id)}
                  </Tag>
                )}
              </Space>
              <p className="text-sm text-gray-500">Added: {previewDate}</p>
              <p className="text-xs text-gray-400">ID: {currentPhoto?.id}</p>
              <Button
                type="link"
                size="small"
                onClick={() => window.open(currentPhoto?.image, "_blank")}
              >
                Open Original
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Gallery;
