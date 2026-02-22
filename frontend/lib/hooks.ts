"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, User, Log, RiskCheckResponse, MeResponse } from "./api";
import { toast } from "sonner";


export const useMe = () => {
  return useQuery<MeResponse & { riskCheck: RiskCheckResponse | null }>({
    queryKey: ["me"],
    queryFn: async () => {
      const storedUser = localStorage.getItem("sabi_user");
      if (!storedUser) throw new Error("Not logged in");
      const user = JSON.parse(storedUser);
      
      const { data: meData } = await api.get<MeResponse>(`/me/${user.id}`);
      
      let riskCheck = null;
      try {
        const { data: riskData } = await api.get<RiskCheckResponse>(`/risk-check/${user.id}`);
        riskCheck = riskData;
      } catch (e) {
        console.error("Risk check failed", e);
      }
      
      return { ...meData, riskCheck };
    },
  });
};

export const useLogSymptoms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const storedUser = localStorage.getItem("sabi_user");
      if (!storedUser) throw new Error("Not logged in");
      const user = JSON.parse(storedUser);
      return api.post("/symptoms", { ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Health status updated!");
    },
    onError: () => {
      toast.error("Failed to log symptoms.");
    }
  });
};

export const useUsers = () => {


  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/users");
      return data;
    },
  });
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post("/register", userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Registration successful!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Registration failed");
    },
  });
};

export const useRiskCheck = (userId: string | null) => {
  return useQuery<RiskCheckResponse>({
    queryKey: ["risk", userId],
    queryFn: async () => {
      const { data } = await api.get(`/risk-check/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};


export const useCallUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.put(`/call-user/${userId}?force=true`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      toast.success("AI Assisted Gemini Voice is initiating a call instance...");
    },
    onError: () => {
      toast.error("Failed to initiate call");
    },
  });
};


export const useLogs = () => {
  return useQuery<Log[]>({
    queryKey: ["logs"],
    queryFn: async () => {
      const { data } = await api.get("/logs");
      return data;
    },
  });
};
