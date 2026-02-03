"use server";

import { api } from "@/lib/api";

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const password2 = formData.get("password2") as string;
  const aff_code = formData.get("aff_code") as string;

  if (!username || !password || !password2) {
    return { success: false, message: "请填写所有必填字段" };
  }

  if (password !== password2) {
    return { success: false, message: "两次输入的密码不一致" };
  }

  try {
    const response = await api("/api/user/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        confirm_password: password2,
        aff_code,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (data.success) {
      return { success: true, message: "注册成功" };
    } else {
      return { success: false, message: data.message || "注册失败" };
    }
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "服务器错误，请稍后再试" };
  }
}
