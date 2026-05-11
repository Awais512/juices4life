"use client";

import { useState, useCallback, useRef } from "react";
import { useTaskStore, getTaskComments } from "@/lib/store/task-store";
import { getMockUserById } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reply, MessageSquare } from "lucide-react";

interface TaskCommentsProps {
  taskId: string;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CommentThread({
  comment,
  replies,
  taskId,
}: {
  comment: { id: string; authorId: string; content: string; createdAt: Date; updatedAt: Date; taskId?: string };
  replies: { id: string; authorId: string; content: string; createdAt: Date; updatedAt: Date }[];
  taskId: string;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const addComment = useTaskStore((s) => s.addComment);
  const inputRef = useRef<HTMLInputElement>(null);
  const author = getMockUserById(comment.authorId);

  function handleReply() {
    if (!replyText.trim()) return;
    addComment(taskId, replyText.trim(), comment.id);
    setReplyText("");
    setReplying(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2.5">
        <Avatar className="size-7 shrink-0 mt-0.5">
          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
            {author?.avatar ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {author?.name ?? "Unknown"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          <button
            onClick={() => {
              setReplying(!replying);
              if (!replying) setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-1 transition-colors"
          >
            <Reply className="size-3" />
            Reply
          </button>
        </div>
      </div>

      {replying && (
        <div className="flex gap-2 ml-9">
          <input
            ref={inputRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
            placeholder="Write a reply..."
            className="flex-1 h-8 rounded-md border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            disabled={!replyText.trim()}
            onClick={handleReply}
          >
            Reply
          </Button>
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-9 border-l-2 border-border/50 pl-3 space-y-3">
          {replies.map((reply) => {
            const replyAuthor = getMockUserById(reply.authorId);
            return (
              <div key={reply.id} className="flex gap-2.5">
                <Avatar className="size-6 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                    {replyAuthor?.avatar ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {replyAuthor?.name ?? "Unknown"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const comments = useTaskStore((s) => s.comments);
  const addComment = useTaskStore((s) => s.addComment);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const taskComments = getTaskComments(comments, taskId);
  const topLevel = taskComments.filter((c) => c.parentId === null);
  const threadReplies = (parentId: string) =>
    taskComments.filter((c) => c.parentId === parentId);

  async function handleSubmit() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    addComment(taskId, newComment.trim());
    setNewComment("");
    setSubmitting(false);
  }

  return (
    <div className="space-y-4 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">
          Comments
        </span>
        {taskComments.length > 0 && (
          <span className="text-xs text-muted-foreground/60">
            ({taskComments.length})
          </span>
        )}
      </div>

      {taskComments.length === 0 && (
        <p className="text-xs text-muted-foreground/60 text-center py-4">
          No comments yet. Start the discussion.
        </p>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto pb-1">
        {topLevel.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            replies={threadReplies(comment.id)}
            taskId={taskId}
          />
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Write a comment..."
          className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          size="sm"
          className="h-9 px-4 text-xs"
          disabled={!newComment.trim() || submitting}
          onClick={handleSubmit}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
