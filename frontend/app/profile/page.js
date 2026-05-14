"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import {
  changePassword,
  updateProfile as updateProfileRequest,
  uploadProfileImage,
} from "@/lib/api/auth";

const initialPasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const getInitial = (user) => {
  return (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();
};

const validatePhone = (phone) => {
  if (!phone) {
    return true;
  }

  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^\+?[0-9\s-]+$/.test(phone.trim());
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, logout, token, user, updateUser, refreshUser } = useAuth();
  const [profileValues, setProfileValues] = useState({ name: "", phone: "" });
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });
  const [imageStatus, setImageStatus] = useState({ type: "", message: "" });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser().catch(() => {});
    }
  }, [isAuthenticated, refreshUser]);

  useEffect(() => {
    setProfileValues({
      name: user?.name || "",
      phone: user?.phone || "",
    });
  }, [user?.name, user?.phone]);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedImage]);

  const avatarInitial = useMemo(() => getInitial(user), [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileStatus({ type: "", message: "" });

    if (profileValues.name.trim().length < 2) {
      setProfileStatus({ type: "error", message: "Name must be at least 2 characters." });
      return;
    }

    if (!validatePhone(profileValues.phone)) {
      setProfileStatus({ type: "error", message: "Phone number must contain 7 to 15 digits." });
      return;
    }

    setIsSavingProfile(true);

    try {
      const updatedUser = await updateProfileRequest(
        {
          name: profileValues.name.trim(),
          phone: profileValues.phone.trim(),
        },
        token,
      );
      updateUser(updatedUser);
      setProfileStatus({ type: "success", message: "Profile updated successfully." });
    } catch (error) {
      setProfileStatus({ type: "error", message: error.message || "Profile update failed." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const resetImageInput = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleAvatarClick = () => {
    if (!isUploadingImage) {
      imageInputRef.current?.click();
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    setImageStatus({ type: "", message: "" });

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSelectedImage(null);
      setImageStatus({ type: "error", message: "Use a JPG, PNG, or WEBP image." });
      resetImageInput();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedImage(null);
      setImageStatus({ type: "error", message: "Image must be 5MB or smaller." });
      resetImageInput();
      return;
    }

    setSelectedImage(file);
    setIsUploadingImage(true);

    try {
      const updatedUser = await uploadProfileImage(file, token);
      updateUser(updatedUser);
      setSelectedImage(null);
      setImageStatus({ type: "success", message: "Profile image updated successfully." });
    } catch (error) {
      setSelectedImage(null);
      setImageStatus({ type: "error", message: error.message || "Image upload failed." });
    } finally {
      setIsUploadingImage(false);
      resetImageInput();
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordStatus({ type: "", message: "" });

    if (!passwordValues.currentPassword) {
      setPasswordStatus({ type: "error", message: "Current password is required." });
      return;
    }

    if (passwordValues.newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }

    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(
        {
          currentPassword: passwordValues.currentPassword,
          newPassword: passwordValues.newPassword,
        },
        token,
      );
      setPasswordValues(initialPasswordValues);
      setPasswordStatus({ type: "success", message: "Password changed successfully." });
    } catch (error) {
      setPasswordStatus({ type: "error", message: error.message || "Password change failed." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const confirmLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!isHydrated) {
    return <main className="page-shell">Loading...</main>;
  }

  if (!isAuthenticated) {
    return <main className="page-shell">Redirecting...</main>;
  }

  return (
    <main className="page-shell">
      <div className="profile-page">
        <div className="profile-topbar">
          <div>
            <h1 className="dashboard-title">My Profile</h1>
            <p className="dashboard-subtitle">Manage your account details and password.</p>
          </div>
          <Link href="/dashboard" className="dashboard-button btn-secondary profile-back-link">
            Back to dashboard
          </Link>
        </div>

        <section className="dashboard-card profile-summary-card">
          <div className="profile-avatar-wrap">
            <button
              type="button"
              className="profile-avatar profile-avatar-large profile-avatar-button"
              onClick={handleAvatarClick}
              disabled={isUploadingImage}
              aria-label="Change profile image"
            >
              {previewUrl || user?.profileImageUrl ? (
                <img src={previewUrl || user.profileImageUrl} alt="" />
              ) : (
                <span>{avatarInitial}</span>
              )}
              <span className="profile-avatar-change">Change</span>
              {isUploadingImage ? <span className="profile-avatar-loading">Uploading...</span> : null}
            </button>
            <span className="profile-avatar-edit-badge" aria-hidden="true">+</span>
            <input
              ref={imageInputRef}
              type="file"
              className="profile-image-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={isUploadingImage}
            />
          </div>
          <div className="profile-summary-text">
            <h2 className="profile-summary-name">{user?.name || "User"}</h2>
            <p>{user?.email || "--"}</p>
            <p>{user?.phone || "No phone number added"}</p>
            {imageStatus.message ? (
              <p className={`form-message profile-image-message ${imageStatus.type}`}>
                {imageStatus.message}
              </p>
            ) : null}
          </div>
        </section>

        <div className="profile-grid">
          <section className="dashboard-card profile-section profile-section-wide">
            <h2 className="dashboard-card-title">Edit Profile</h2>
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="auth-field">
                <label htmlFor="profile-name" className="auth-label">Full Name</label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  className="auth-input"
                  value={profileValues.name}
                  onChange={handleProfileChange}
                  disabled={isSavingProfile}
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="profile-phone" className="auth-label">Phone Number</label>
                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  className="auth-input"
                  value={profileValues.phone}
                  onChange={handleProfileChange}
                  disabled={isSavingProfile}
                  placeholder="9876543210"
                />
              </div>
              {profileStatus.message ? (
                <p className={`form-message ${profileStatus.type}`}>{profileStatus.message}</p>
              ) : null}
              <button type="submit" className="dashboard-button" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          <section className="dashboard-card profile-section profile-section-wide">
            <h2 className="dashboard-card-title">Change Password</h2>
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="profile-password-grid">
                <div className="auth-field">
                  <label htmlFor="currentPassword" className="auth-label">Current Password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className="auth-input"
                    value={passwordValues.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={isChangingPassword}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="newPassword" className="auth-label">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className="auth-input"
                    value={passwordValues.newPassword}
                    onChange={handlePasswordChange}
                    disabled={isChangingPassword}
                    minLength={8}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="confirmPassword" className="auth-label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="auth-input"
                    value={passwordValues.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={isChangingPassword}
                    minLength={8}
                    required
                  />
                </div>
              </div>
              {passwordStatus.message ? (
                <p className={`form-message ${passwordStatus.type}`}>{passwordStatus.message}</p>
              ) : null}
              <button type="submit" className="dashboard-button" disabled={isChangingPassword}>
                {isChangingPassword ? "Changing..." : "Change Password"}
              </button>
            </form>
          </section>
        </div>

        <section className="dashboard-card profile-logout-card">
          <div>
            <h2 className="dashboard-card-title">Logout</h2>
            <p>End this session and return to the login screen.</p>
          </div>
          <button
            type="button"
            className="dashboard-button btn-danger profile-logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Logout
          </button>
        </section>
      </div>

      {showLogoutConfirm ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Logout?</h2>
            <p className="modal-message">Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button
                type="button"
                className="dashboard-button btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button type="button" className="dashboard-button btn-danger" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
