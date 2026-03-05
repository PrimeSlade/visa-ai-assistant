"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPrompt,
  type UpdateConsultantPromptRequest,
  updateConsultantPrompt,
} from "@/lib/prompt.api";

export function useAdminPrompt() {
  return useQuery({
    queryKey: ["admin-prompt"],
    queryFn: getAdminPrompt,
  });
}

export function useUpdateConsultantPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateConsultantPromptRequest) =>
      updateConsultantPrompt(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-prompt"],
      });
    },
  });
}
