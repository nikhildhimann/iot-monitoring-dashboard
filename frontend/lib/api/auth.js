import { apiRequest } from "./client";

export async function signupUser(formValues) {
  const response = await apiRequest("/auth/signup", {
    method: "POST",
    body: formValues,
  });

  return response.data.user;
}

export async function loginUser(formValues) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: formValues,
  });

  return response.data;
}
