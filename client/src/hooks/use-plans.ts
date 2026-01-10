import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePlanInput } from "@shared/routes";

export function usePlan(id: number | null) {
  return useQuery({
    queryKey: [api.plans.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.plans.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch plan");
      return api.plans.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePlanInput) => {
      // Ensure backend receives clean data matching schema
      const validated = api.plans.create.input.parse(data);
      const res = await fetch(api.plans.create.path, {
        method: api.plans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.plans.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create plan");
      }
      return api.plans.create.responses[201].parse(await res.json());
    },
    // We don't necessarily need to invalidate a list since we don't have a "list all plans" endpoint yet
    // But good practice if we added one later
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: [api.plans.list.path] });
    },
  });
}
