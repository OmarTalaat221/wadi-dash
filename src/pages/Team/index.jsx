// pages/admin/team/index.js
import React, { useState, useEffect } from "react";
import { Button, Tabs, Badge, Input, Empty, message, Spin } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import TeamMemberCard from "../../components/Team/TeamMemberCard";
import AddEditMemberModal from "../../components/Team/AddEditMemberModal";
import DeleteConfirmModal from "../../components/Team/DeleteConfirmModal";
import BreadCrumbs from "../../components/bread-crumbs";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { TabPane } = Tabs;
const MAX_TOP_MEMBERS = 4;

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);

  // Helper function to parse bestPlaces
  const parseBestPlaces = (bestPlacesString) => {
    if (!bestPlacesString) return [];

    try {
      return JSON.parse(bestPlacesString);
    } catch (error) {
      return bestPlacesString
        .split(",")
        .map((place) => place.trim())
        .filter((place) => place.length > 0);
    }
  };

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/team/select_member.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        const transformedMembers = response.data.message.map((member) => ({
          id: member.id,
          name: member.name,
          position: member.role,
          isTopMember: member.is_top === "1",
          profileImage: member.image,
          shortDescription: member.description,
          funFact: member.funFact,
          favoriteQuote: member.favoriteQuote,
          favoriteMemory: member.favoriteMemory,
          bestPlaces: parseBestPlaces(member.bestPlaces), // Use helper function
          ig_link: member.ig_link,
          facebook_link: member.facebook_link,
          hidden: member.hidden === "1",
          is_top: member.is_top,
        }));

        setTeamMembers(transformedMembers);
      } else {
        message.error("Failed to fetch team members");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to load team members. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Count members by status (only count visible members for badges)
  const visibleMembers = teamMembers.filter((member) => !member.hidden);
  const topMembersCount = visibleMembers.filter(
    (member) => member.isTopMember
  ).length;
  const regularMembersCount = visibleMembers.filter(
    (member) => !member.isTopMember
  ).length;

  // Filter members based on active tab and search query
  useEffect(() => {
    let filtered = teamMembers;

    // Filter by tab
    if (activeTab === "top") {
      filtered = filtered.filter((member) => member.isTopMember);
    } else if (activeTab === "regular") {
      filtered = filtered.filter((member) => !member.isTopMember);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.position.toLowerCase().includes(query) ||
          member.shortDescription.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  }, [teamMembers, activeTab, searchQuery]);

  // Handle member actions
  const handleAddMember = () => {
    setMemberToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditMember = (member) => {
    setMemberToEdit(member);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteMember = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleToggleMember = async (member) => {
    setToggling(member.id);
    try {
      const response = await axios.post(
        `${base_url}/admin/team/toggle_member.php`,
        {
          id: parseInt(member.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        const action = member.hidden ? "shown" : "hidden";
        message.success(`Team member ${action} successfully!`);
        await fetchTeamMembers();
      } else {
        throw new Error(response.data?.message || "Failed to toggle member");
      }
    } catch (error) {
      console.error("Error toggling member:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to toggle member visibility. Please try again."
      );
    } finally {
      setToggling(null);
    }
  };

  const handleSaveMember = async (memberData) => {
    // Check if trying to add a new top member when already at max
    if (memberData.isTopMember) {
      const isExistingTopMember = memberToEdit?.isTopMember;
      const topMembersAfterChange = isExistingTopMember
        ? topMembersCount
        : topMembersCount + 1;

      if (!isExistingTopMember && topMembersAfterChange > MAX_TOP_MEMBERS) {
        message.error(
          `You can only have a maximum of ${MAX_TOP_MEMBERS} top team members.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      // Prepare data for API - convert array back to comma-separated string
      const apiData = {
        name: memberData.name,
        image: memberData.profileImage,
        description: memberData.shortDescription,
        funFact: memberData.funFact,
        favoriteQuote: memberData.favoriteQuote,
        role: memberData.position,
        ig_link: memberData.ig_link || "https://www.instagram.com/",
        facebook_link: memberData.facebook_link || "https://www.facebook.com/",
        hidden: "0",
        is_top: memberData.isTopMember ? "1" : "0",
        favoriteMemory: memberData.favoriteMemory,
        bestPlaces: Array.isArray(memberData.bestPlaces)
          ? memberData.bestPlaces.join(",")
          : memberData.bestPlaces || "",
      };

      let response;

      if (memberToEdit) {
        // Update existing member
        response = await axios.post(
          `${base_url}/admin/team/edit_member.php`,
          {
            id: parseInt(memberToEdit.id),
            ...apiData,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Add new member
        response = await axios.post(
          `${base_url}/admin/team/add_member.php`,
          apiData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.data && response.data.status === "success") {
        message.success(
          `Team member successfully ${memberToEdit ? "updated" : "added"}!`
        );
        await fetchTeamMembers();
        setIsAddEditModalOpen(false);
      } else {
        throw new Error(
          response.data?.message ||
            `Failed to ${memberToEdit ? "update" : "add"} member`
        );
      }
    } catch (error) {
      console.error("Error saving member:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${
            memberToEdit ? "update" : "add"
          } team member. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    setSaving(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/team/delete_member.php`,
        {
          id: parseInt(memberToDelete.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Team member successfully deleted!");
        await fetchTeamMembers();
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
      } else {
        throw new Error(response.data?.message || "Failed to delete member");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete team member. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    fetchTeamMembers();
  };

  return (
    <div>
      <BreadCrumbs
        title={"Dashboard / Team"}
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
              onClick={handleAddMember}
              className="bg-blue-600"
            >
              Add Team Member
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-0">
            <TabPane
              tab={
                <span>
                  All Members{" "}
                  <Badge
                    count={visibleMembers.length}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                </span>
              }
              key="all"
            />
            <TabPane
              tab={
                <span>
                  Top Members{" "}
                  <Badge
                    count={topMembersCount}
                    style={{ backgroundColor: "#faad14" }}
                  />
                </span>
              }
              key="top"
            />
            <TabPane
              tab={
                <span>
                  Regular Members{" "}
                  <Badge
                    count={regularMembersCount}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </span>
              }
              key="regular"
            />
          </Tabs>

          <Input
            placeholder="Search team members..."
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
          <Spin size="large" tip="Loading team members..." />
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onToggle={handleToggleMember}
              isToggling={toggling === member.id}
            />
          ))}
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">
              {searchQuery
                ? "No team members found. Try a different search term."
                : "No team members available. Click 'Add Team Member' to create one."}
            </span>
          }
          className="my-12"
        >
          {!searchQuery && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddMember}
              className="bg-blue-600"
            >
              Add Your First Team Member
            </Button>
          )}
        </Empty>
      )}

      {/* Modals */}
      <AddEditMemberModal
        open={isAddEditModalOpen}
        setOpen={setIsAddEditModalOpen}
        initialData={memberToEdit}
        onSave={handleSaveMember}
        saving={saving}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        memberName={memberToDelete?.name}
        deleting={saving}
      />
    </div>
  );
};

export default Team;
