import React, { useState, useEffect } from "react";
import { Button, Tabs, Badge, Input, Empty, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { faqs as initialFaqs, faqCategories } from "../../data/faqs";
import FaqItem from "../../components/Faqs/FaqItem";
import AddEditFaqModal from "../../components/Faqs/AddEditFaqModal";
import DeleteConfirmModal from "../../components/Faqs/DeleteConfirmModal";
import BreadCrumbs from "../../components/bread-crumbs";

const { TabPane } = Tabs;

const Faqs = () => {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [filteredFaqs, setFilteredFaqs] = useState(initialFaqs);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);

  // Count FAQs by category
  const getCategoryCount = (category) => {
    return category === "all"
      ? faqs.length
      : faqs.filter((faq) => faq.category === category).length;
  };

  // Filter FAQs based on active tab and search query
  useEffect(() => {
    let filtered = faqs;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((faq) => faq.category === activeTab);
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

  // Handle FAQ actions
  const handleAddFaq = () => {
    setFaqToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditFaq = (faq) => {
    setFaqToEdit(faq);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteFaq = (faq) => {
    setFaqToDelete(faq);
    setIsDeleteModalOpen(true);
  };

  const handleSaveFaq = (faqData) => {
    if (faqToEdit) {
      // Update existing FAQ
      setFaqs(faqs.map((faq) => (faq.id === faqData.id ? faqData : faq)));
      message.success("FAQ successfully updated!");
    } else {
      // Add new FAQ
      setFaqs([...faqs, faqData]);
      message.success("FAQ successfully added!");
    }
  };

  const handleConfirmDelete = () => {
    if (faqToDelete) {
      setFaqs(faqs.filter((faq) => faq.id !== faqToDelete.id));
      message.success("FAQ successfully deleted!");
      setFaqToDelete(null);
    }
  };

  return (
    <div>
      <BreadCrumbs
        title={"Dashboard / FAQs"}
        children={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddFaq}
            className="bg-blue-600"
          >
            Add FAQ
          </Button>
        }
      />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-0">
            {faqCategories.map((category) => (
              <TabPane
                key={category.key}
                tab={
                  <span>
                    {category.name}{" "}
                    <Badge
                      count={getCategoryCount(category.key)}
                      style={{
                        backgroundColor:
                          category.key === "all"
                            ? "#1890ff"
                            : category.key === "booking"
                            ? "#faad14"
                            : category.key === "payment"
                            ? "#52c41a"
                            : category.key === "tour"
                            ? "#722ed1"
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
          />
        </div>
      </div>

      {filteredFaqs.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredFaqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              onEdit={handleEditFaq}
              onDelete={handleDeleteFaq}
            />
          ))}
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">
              No FAQs found. {searchQuery && "Try a different search term."}
            </span>
          }
          className="my-12"
        />
      )}

      {/* Modals */}
      <AddEditFaqModal
        open={isAddEditModalOpen}
        setOpen={setIsAddEditModalOpen}
        initialData={faqToEdit}
        onSave={handleSaveFaq}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        faqQuestion={faqToDelete?.question}
      />
    </div>
  );
};

export default Faqs;
