"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCreateComment } from "./use-comments-hook";
import { toast } from "sonner";

export default function CommentForm() {
  const [commentText, setCommentText] = useState("");

  const mutation = useCreateComment();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!commentText.trim()) return;

    // do something with the input

    mutation.mutate(
      { text: commentText },
      {
        onSuccess: () => {
          setCommentText("");
          toast.success("Comment posted successfully!");
        },
        onError: () => {
          toast.error("Failed to post comment.Please try again!");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1"
        disabled={mutation.isPending}
      />
      <Button
        type="submit"
        disabled={!commentText.trim() || mutation.isPending}
      >
        {mutation.isPending ? "Posting.." : "Post"}
      </Button>
    </form>
  );
}
