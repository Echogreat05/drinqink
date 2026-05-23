import { useEffect, useState } from "react";
import { Building2, Users, Mail, Shield, Plus, Trash2, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function CorporateTeamManagement() {
  const { user } = useAuth();
  const [corporateAccount, setCorporateAccount] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCorporateData();
  }, [user]);

  const loadCorporateData = async () => {
    if (!user) return;

    const [accountData, membersData] = await Promise.all([
      supabase.from("corporate_accounts").select("*").eq("owner_id", user.id).maybeSingle(),
      supabase.from("corporate_team_members").select("*, profiles(email, display_name)").eq("corporate_account_id", (await supabase.from("corporate_accounts").select("id").eq("owner_id", user.id).single()).data?.id),
    ]);

    setCorporateAccount(accountData.data);
    setTeamMembers(membersData.data || []);
    setLoading(false);
  };

  const addTeamMember = async () => {
    if (!newMemberEmail.trim() || !corporateAccount) return;

    const { error } = await supabase.from("corporate_team_members").insert({
      corporate_account_id: corporateAccount.id,
      email: newMemberEmail,
      role: newMemberRole,
    });

    if (error) {
      toast.error("Failed to add team member");
    } else {
      setNewMemberEmail("");
      setAddMemberOpen(false);
      loadCorporateData();
      toast.success("Team member added");
    }
  };

  const removeTeamMember = async (memberId: string) => {
    await supabase.from("corporate_team_members").delete().eq("id", memberId);
    loadCorporateData();
    toast.success("Team member removed");
  };

  if (loading) {
    return <div className="text-center py-8">Loading team data...</div>;
  }

  if (!corporateAccount) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Corporate Account</h3>
          <p className="text-muted-foreground mb-4">
            Create a corporate account to manage your team and orders
          </p>
          <Button>Create Corporate Account</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {corporateAccount.company_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Credit Limit</p>
              <p className="text-xl font-bold">₦{corporateAccount.credit_limit?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-xl font-bold">₦{corporateAccount.balance?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="text-xl font-bold">{teamMembers.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={corporateAccount.is_active ? "default" : "secondary"}>
                {corporateAccount.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <Button onClick={() => setAddMemberOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.profiles?.display_name?.charAt(0) || member.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.display_name || member.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                    {member.role === "admin" && <Crown className="h-3 w-3 mr-1" />}
                    {member.role}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTeamMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No team members yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTeamMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
