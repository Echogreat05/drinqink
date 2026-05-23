// @ts-nocheck
import { useEffect, useState } from "react";
import { MessageSquare, Send, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface DisputeCommentsProps {
  disputeId: string;
}

export function DisputeComments({ disputeId }: DisputeCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [disputeId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("dispute_comments")
      .select("*, profiles(display_name)")
      .eq("dispute_id", disputeId)
      .order("created_at", { ascending: true });

    setComments(data || []);
    setLoading(false);
  };

  const submitComment = async () => {
    if (!newComment.trim() || !user) return;

    const { error } = await supabase.from("dispute_comments").insert({
      dispute_id: disputeId,
      user_id: user.id,
      comment: newComment,
    });

    if (error) {
      toast.error("Failed to submit comment");
    } else {
      setNewComment("");
      loadComments();
      toast.success("Comment added");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Dispute Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Start the discussion.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {comment.profiles?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.profiles?.display_name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      {comment.is_internal && (
                        <Badge variant="secondary" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your message..."
              rows={3}
            />
            <Button onClick={submitComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Resolution Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Dispute Initiated</p>
                <p className="text-muted-foreground">Customer or vendor raises a concern</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Evidence Collection</p>
                <p className="text-muted-foreground">Both parties submit supporting documents</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Admin Review</p>
                <p className="text-muted-foreground">Platform admin investigates the case</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Resolution</p>
                <p className="text-muted-foreground">Decision made and action taken</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
