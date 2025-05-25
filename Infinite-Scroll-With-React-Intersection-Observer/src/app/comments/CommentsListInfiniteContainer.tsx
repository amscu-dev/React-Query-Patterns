"use client";
import ky from "ky";
import { useInfiniteQuery } from "@tanstack/react-query";
import { GetCommentsResponse } from "../api/comments/route";
import { Loader2 } from "lucide-react";
import { Comment } from "./Comment";
import { Button } from "@/components/ui/button";
import { useComments } from "./use-comments-hook";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";

export default function CommentsListInfiniteContainer() {
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
  } = useComments();

  const comments = data?.pages.flatMap((page) => page.comments);

  if (isPending) {
    return <Loader2 className="animate-spin mx-auto" />;
  }
  return (
    <div className="space-y-4 mb-10">
      {comments && comments.length > 0 && (
        <>
          <InfiniteScrollContainer
            onBottomReached={() =>
              hasNextPage && !isFetching && fetchNextPage()
            }
            className="space-y-3"
          >
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
            {isFetchingNextPage && (
              <div className="flex justify-center my-4">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </InfiniteScrollContainer>
        </>
      )}
      {!isError && !comments?.length && (
        <div className="text-center">There are no commnets yer!</div>
      )}
      {isError && (
        <div className="text-center text-red-500">
          Error loading comments : {error.message}
        </div>
      )}
    </div>
  );
}
