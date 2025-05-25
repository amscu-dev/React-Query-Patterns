import { fetchData, postData } from "@/lib/fetch-utils";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Comment } from "../api/comments/data";
import { CommentsResponse } from "../api/comments/route";

const queryKey: QueryKey = ["comments"];

export function useCommentsQuery() {
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchData<CommentsResponse>(
        `/api/comments?${pageParam ? `cursor=${pageParam}` : ""}`
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newComment: { text: string }) =>
      postData<{ comment: Comment }>("/api/comments", newComment),
    onSuccess: async ({ comment }) => {
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<
        InfiniteData<CommentsResponse, number | undefined>
      >(queryKey, (oldData) => {
        const firstPage = oldData?.pages[0];

        if (firstPage) {
          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                totalComments: firstPage.totalComments + 1,
                comments: [comment, ...firstPage.comments],
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      });
      // return force to remain in laoding state
      /*
      La finalizarea mutationFn și după orice Promise returnat din onSuccess (dacă există) -> React Query marchează mutația ca terminată:
      isLoading devine false
      isSuccess devine true
      queryClient.invalidateQueries returnează o Promise
      
      return queryClient.invalidateQueries({ queryKey: ["comments"] });
      */
    },
  });
}
