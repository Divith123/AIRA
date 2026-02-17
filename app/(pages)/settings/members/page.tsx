"use client";

import React, { useState } from "react";
// DashboardLayout removed
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { Card } from "../../../../components/ui/Card";
import { UserPlus, Trash2, Info, ExternalLink } from "lucide-react";
import { getTeamMembers, createTeamMember, deleteTeamMember, getMe, TeamMember } from "../../../../lib/api";

const roleDescriptions: Record<string, string> = {
  Read: "Allow read-only access to the dashboard, excluding billing.",
  Write: "Allow full access to the dashboard and write permissions to settings, excluding billing.",
  Admin: "Allow full access and control, including billing and user management.",
};

import { Skeleton } from "../../../../components/ui/Skeleton";

interface TeamMembersPageProps {
  projectId?: string;
}

export default function TeamMembersPage({ projectId: _projectId }: TeamMembersPageProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Admin");

  const [me, setMe] = useState<any>(null);

  React.useEffect(() => {
    loadMembers();
    getMe().then(setMe).catch(console.error);
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await getTeamMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (email.trim() && password.trim()) {
      try {
        await createTeamMember(email, email.split("@")[0], password, selectedRole);
        await loadMembers();
        setEmail("");
        setPassword("");
        setSelectedRole("Admin");
        setShowInvite(false);
      } catch (error) {
        alert("Failed to create member: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await deleteTeamMember(id);
        await loadMembers();
      } catch (error) {
        alert("Failed to delete member");
      }
    }
  };

  return (
    <>
      <Header
        projectName="Default Project"
        pageName="Members"
        showTimeRange={false}
        actionButton={
          <Button size="sm" onClick={() => setShowInvite(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
            Invite team member
          </Button>
        }
      />

      <div className="p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Team members</h2>
              <p className="text-muted-foreground">Manage project access and roles.</p>
            </div>

            <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border border-border/40 rounded-lg flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No team members yet</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-white dark:bg-surface/30 hover:bg-gray-50 dark:hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                      {(member.name || member.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground font-medium text-sm">{member.name || member.email}</span>
                        {member.id === me?.id && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground">{member.role}</span>
                    {member.id !== me?.id && (
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 rounded-lg text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 border-border/60 bg-linear-to-br from-white to-gray-50/50 dark:from-surface/40 dark:to-surface/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Team Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Total Members</span>
                  <span className="font-bold text-foreground">{members.length} / 20</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Role Distribution</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Admin: {members.filter(m => m.role === "Admin").length}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border/60">
              <h3 className="text-sm font-semibold text-foreground mb-4">Role Definitions</h3>
              <div className="space-y-3">
                {Object.entries(roleDescriptions).map(([role, desc]) => (
                  <div key={role} className="group">
                    <div className="text-[12px] font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{role}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-primary/5 border-primary/10">
              <h3 className="text-sm font-semibold text-primary mb-2">Need Help?</h3>
              <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">
                Invite team members to collaborate on this project. They will receive an email invitation to join.
              </p>
              <a href="#" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" />
                Organization Guide
              </a>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite team members"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!email.trim() || !password.trim()}>
              Invite
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Add a team member to the project.
          </p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@company.com"
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-muted/20 border border-border/60 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-muted/20 border border-border/60 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <label className="block text-sm font-medium text-foreground">User role</label>
            </div>

            <div className="space-y-2">
              {Object.entries(roleDescriptions).map(([role, description]) => (
                <label
                  key={role}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-white dark:bg-muted/10 hover:bg-gray-50 dark:hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4 mt-0.5 cursor-pointer accent-primary"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{role}</div>
                    <div className="text-xs text-muted-foreground mt-1">{description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
