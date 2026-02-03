"use server";

import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function deleteToken(id: number) {
  try {
    const res = await api(`/api/token/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      revalidatePath("/console/token");
    }
    return data;
  } catch (e) {
    return { success: false, message: "Network Error" };
  }
}

export async function createToken(formData: FormData) {
  // To be implemented
}

export async function updateToken(id: number, data: any) {
  // To be implemented
}
