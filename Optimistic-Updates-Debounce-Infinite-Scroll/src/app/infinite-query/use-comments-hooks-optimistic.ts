import { postData } from "@/lib/fetch-utils";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { CommentsResponse } from "../api/comments/route";
import { Comment } from "../api/comments/data";

const queryKey: QueryKey = ["comments"];

export function useCreateCommentMutationOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["new-comment"],
    mutationFn: (newComment: { text: string }) =>
      postData<{ comment: Comment }>("/api/comments", newComment),
    onMutate: async (newCommentData) => {
      await queryClient.cancelQueries({ queryKey });

      const snapshot =
        queryClient.getQueryData<
          InfiniteData<CommentsResponse, number | undefined>
        >(queryKey);

      const optimisticComment: Comment = {
        id: Date.now(),
        text: newCommentData.text,
        user: {
          name: "Currrent User",
          avatar: "CU",
        },
        createdAt: new Date().toISOString(),
      };

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
                comments: [optimisticComment, ...firstPage.comments],
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      });

      return () => {
        queryClient.setQueryData<
          InfiniteData<CommentsResponse, number | undefined>
        >(queryKey, snapshot);
      };
    },
    onError: (error, variables, rollback) => {
      rollback?.();
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ["new-comment"] }) === 1) {
        return queryClient.invalidateQueries({
          queryKey,
        });
      }
    },
  });
}
