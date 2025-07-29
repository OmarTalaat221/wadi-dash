import React, { useState, useEffect } from "react";
import { Button, Tabs, Badge, Input, Empty, message } from "antd";
import { PlusOutlined, SearchOutlined, StarFilled } from "@ant-design/icons";
import { teamMembers as initialTeamMembers } from "../../data/teamMembers";
import TeamMemberCard from "../../components/Team/TeamMemberCard";
import MemberDetailsModal from "../../components/Team/MemberDetailsModal";
import AddEditMemberModal from "../../components/Team/AddEditMemberModal";
import DeleteConfirmModal from "../../components/Team/DeleteConfirmModal";
import BreadCrumbs from "../../components/bread-crumbs";

const { TabPane } = Tabs;
const MAX_TOP_MEMBERS = 4;

const Team = () => {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [filteredMembers, setFilteredMembers] = useState(initialTeamMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Count members by status
  const topMembersCount = teamMembers.filter(
    (member) => member.isTopMember
  ).length;
  const regularMembersCount = teamMembers.filter(
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
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
  };

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

  const handleSaveMember = (memberData) => {
    // Check if trying to add a new top member when already at max
    if (memberData.isTopMember) {
      // If editing an existing top member, it doesn't count toward the limit
      const isExistingTopMember = memberToEdit?.isTopMember;

      // Calculate how many top members we would have after this change
      const topMembersAfterChange = isExistingTopMember
        ? topMembersCount // No change in count if updating existing top member
        : topMembersCount + 1; // Adding one more top member

      // Check if we would exceed the limit
      if (!isExistingTopMember && topMembersAfterChange > MAX_TOP_MEMBERS) {
        message.error(
          `You can only have a maximum of ${MAX_TOP_MEMBERS} top team members.`
        );
        return;
      }
    }

    if (memberToEdit) {
      // Update existing member
      setTeamMembers(
        teamMembers.map((member) =>
          member.id === memberData.id ? memberData : member
        )
      );
    } else {
      // Add new member
      setTeamMembers([...teamMembers, memberData]);
    }

    // Show success message
    message.success(
      `Team member successfully ${memberToEdit ? "updated" : "added"}!`
    );
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      setTeamMembers(
        teamMembers.filter((member) => member.id !== memberToDelete.id)
      );
      setMemberToDelete(null);
    }
  };

  return (
    <div>
      <BreadCrumbs
        title={"Dashboard / Team"}
        children={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMember}
            className="bg-blue-600"
          >
            Add Team Member
          </Button>
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
                    count={teamMembers.length}
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
          />
        </div>
      </div>

      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => handleViewMember(member)}
              className="cursor-pointer"
            >
              <TeamMemberCard
                member={member}
                onView={handleViewMember}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            </div>
          ))}
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">
              No team members found.{" "}
              {searchQuery && "Try a different search term."}
            </span>
          }
          className="my-12"
        />
      )}

      {/* Modals */}
      <MemberDetailsModal
        open={isDetailsModalOpen}
        setOpen={setIsDetailsModalOpen}
        selectedMember={selectedMember}
      />

      <AddEditMemberModal
        open={isAddEditModalOpen}
        setOpen={setIsAddEditModalOpen}
        initialData={memberToEdit}
        onSave={handleSaveMember}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        memberName={memberToDelete?.name}
      />
    </div>
  );
};

export default Team;
