// app/admin/faqs/page.js
import React, { useState, useEffect } from "react";
import { Button, Tabs, Badge, Input, Empty, message, Spin } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FaqItem from "../../components/Faqs/FaqItem";
import AddEditFaqModal from "../../components/Faqs/AddEditFaqModal";
import DeleteConfirmModal from "../../components/Faqs/DeleteConfirmModal";
import ToggleStatusModal from "../../components/Faqs/ToggleStatusModal";
import BreadCrumbs from "../../components/bread-crumbs";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { TabPane } = Tabs;

// FAQ Types
const faqTypes = [
  { key: "all", name: "All" },
  { key: "general", name: "General" },
  { key: "travel_tips", name: "Travel Tips" },
];

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [faqToToggle, setFaqToToggle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch FAQs from API
  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/faqs/select_faqs.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        const transformedFaqs = response.data?.message?.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          type: faq.type,
          hidden: faq.hidden || "0", // Default to visible if not specified
          created_at: faq.created_at,
        }));
        setFaqs(transformedFaqs);
      } else {
        message.error("Failed to fetch FAQs");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to load FAQs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);

  // Count FAQs by type
  const getTypeCount = (type) => {
    return type === "all"
      ? faqs.length
      : faqs.filter((faq) => faq.type === type).length;
  };

  // Filter FAQs based on active tab and search query
  useEffect(() => {
    let filtered = faqs;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((faq) => faq.type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  }, [faqs, activeTab, searchQuery]);

  useEffect(() => {
    console.log(faqs, "faqs");
  }, [faqs]);

  // Handle Add FAQ
  const handleAddFaq = () => {
    setFaqToEdit(null);
    setIsAddEditModalOpen(true);
  };

  // Handle Edit FAQ
  const handleEditFaq = (faq) => {
    setFaqToEdit(faq);
    setIsAddEditModalOpen(true);
    console.log(faq);
  };

  // Handle Delete FAQ
  const handleDeleteFaq = (faq) => {
    setFaqToDelete(faq);
    setIsDeleteModalOpen(true);
  };

  // Handle Toggle Status FAQ
  const handleToggleStatusFaq = (faq) => {
    setFaqToToggle(faq);
    setIsToggleStatusModalOpen(true);
  };

  // Handle Save FAQ (Add or Edit)
  const handleSaveFaq = async (faqData) => {
    console.log(faqData);
    setSaving(true);

    try {
      if (faqToEdit) {
        // Update existing FAQ
        const response = await axios.post(
          `${base_url}/admin/faqs/edit_faq.php`,
          {
            faq_id: faqData.id,
            question: faqData.question,
            answer: faqData.answer,
            type: faqData.type,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.status === "success") {
          message.success("FAQ successfully updated!");
          await fetchFaqs();
        } else {
          throw new Error(response.data?.message || "Failed to update FAQ");
        }
      } else {
        // Add new FAQ
        const response = await axios.post(
          `${base_url}/admin/faqs/add_faq.php`,
          {
            question: faqData.question,
            answer: faqData.answer,
            type: faqData.type,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.status === "success") {
          message.success("FAQ successfully added!");
          await fetchFaqs();
        } else {
          throw new Error(response.data?.message || "Failed to add FAQ");
        }
      }

      setIsAddEditModalOpen(false);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${faqToEdit ? "update" : "add"} FAQ. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;

    setSaving(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/faqs/delete_faq.php`,
        {
          faq_id: String(faqToDelete.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("FAQ successfully deleted!");
        await fetchFaqs();
        setIsDeleteModalOpen(false);
        setFaqToDelete(null);
      } else {
        throw new Error(response.data?.message || "Failed to delete FAQ");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete FAQ. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Confirm Toggle Status
  const handleConfirmToggleStatus = async () => {
    if (!faqToToggle) return;

    setSaving(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/faqs/toggle_hide.php`,
        {
          faq_id: parseInt(faqToToggle.id), // Convert to number as shown in your API
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        const isCurrentlyHidden = faqToToggle.hidden === "1";
        const actionText = isCurrentlyHidden ? "shown" : "hidden";
        message.success(`FAQ successfully ${actionText}!`);

        await fetchFaqs();
        setIsToggleStatusModalOpen(false);
        setFaqToToggle(null);
      } else {
        throw new Error(
          response.data?.message || "Failed to toggle FAQ visibility"
        );
      }
    } catch (error) {
      console.error("Error toggling FAQ visibility:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to toggle FAQ visibility. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Refresh
  const handleRefresh = () => {
    setSearchQuery("");
    fetchFaqs();
  };

  return (
    <div>
      <BreadCrumbs
        title={"Dashboard / FAQs"}
        children={
          <div className="flex gap-2">
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
              onClick={handleAddFaq}
              className="bg-blue-600"
            >
              Add FAQ
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-0">
            {faqTypes.map((type) => (
              <TabPane
                key={type.key}
                tab={
                  <span>
                    {type.name}{" "}
                    <Badge
                      count={getTypeCount(type.key)}
                      style={{
                        backgroundColor:
                          type.key === "all"
                            ? "#1890ff"
                            : type.key === "general"
                            ? "#52c41a"
                            : type.key === "travel_tips"
                            ? "#faad14"
                            : "#f5222d",
                      }}
                    />
                  </span>
                }
              />
            ))}
          </Tabs>

          <Input
            placeholder="Search FAQs..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
            allowClear
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading FAQs..." />
        </div>
      ) : filteredFaqs.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredFaqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              onEdit={handleEditFaq}
              onDelete={handleDeleteFaq}
              onToggleStatus={handleToggleStatusFaq}
            />
          ))}
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">
              {searchQuery
                ? "No FAQs found. Try a different search term."
                : "No FAQs available. Click 'Add FAQ' to create one."}
            </span>
          }
          className="my-12"
        >
          {!searchQuery && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddFaq}
              className="bg-blue-600"
            >
              Add Your First FAQ
            </Button>
          )}
        </Empty>
      )}

      <AddEditFaqModal
        open={isAddEditModalOpen}
        setOpen={setIsAddEditModalOpen}
        initialData={faqToEdit}
        onSave={handleSaveFaq}
        saving={saving}
        types={faqTypes.filter((type) => type.key !== "all")}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        faqQuestion={faqToDelete?.question}
        deleting={saving}
      />

      <ToggleStatusModal
        open={isToggleStatusModalOpen}
        setOpen={setIsToggleStatusModalOpen}
        onConfirm={handleConfirmToggleStatus}
        faqQuestion={faqToToggle?.question}
        currentHidden={faqToToggle?.hidden}
        toggling={saving}
      />
    </div>
  );
};

export default Faqs;
