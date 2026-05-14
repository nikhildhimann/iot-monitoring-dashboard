import { apiRequest } from "./client";

function pickUser(response) {
  return response?.data?.user || response?.data?.data?.user || response?.data?.data || response?.user || null;
}

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

export async function getMe(token) {
  const response = await apiRequest("/auth/me", {
    token,
  });

  return pickUser(response);
}

export async function updateProfile(payload, token) {
  const response = await apiRequest("/auth/profile", {
    method: "PATCH",
    body: payload,
    token,
  });

  return pickUser(response);
}

export async function changePassword(payload, token) {
  return apiRequest("/auth/change-password", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function uploadProfileImage(file, token) {
  const formData = new FormData();
  formData.append("profileImage", file);

  const response = await apiRequest("/auth/profile-image", {
    method: "PATCH",
    body: formData,
    token,
  });

  return pickUser(response);
}
