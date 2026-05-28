"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/store/auth.store";
import api from "@/lib/api/axios";
import {
  User,
  Building2,
  Phone,
  MapPin,
  Globe,
  FileText,
  Shield,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Edit3,
  BadgeCheck,
  Calendar,
  Users,
} from "lucide-react";

const profileSchema = z.object({
  firmName: z.string().min(2, "Firm name must be at least 2 characters"),
  licenseNumber: z.string().min(3, "License number required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  bio: z.string().max(300, "Bio must be under 300 characters").optional(),
  avatarUrl: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface CaProfile {
  id: number;
  firmName: string;
  licenseNumber: string;
  phone: string;
  address: string;
  website?: string;
  bio?: string;
  createdAt: string;
  clients: any[];
  user: {
    id: number;
    email: string;
    totpEnabled: boolean;
    avatarUrl?: string;
    createdAt: string;
  };
}

export default function CaProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<CaProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [bioLength, setBioLength] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const bioValue = watch("bio") || "";
  useEffect(() => {
    setBioLength(bioValue.length);
  }, [bioValue]);

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await api.get("/ca/profile");
        const data: CaProfile = res.data;
        setProfile(data);
        setAvatarUrl(data.user?.avatarUrl);
        setAvatarPreview(data.user?.avatarUrl || null);
        reset({
          firmName: data.firmName,
          licenseNumber: data.licenseNumber,
          phone: data.phone,
          address: data.address,
          website: data.website || "",
          bio: data.bio || "",
          avatarUrl: data.user?.avatarUrl || "",
        });
        setIsNewProfile(false);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setIsNewProfile(true);
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    try {
      if (cloudName && uploadPreset) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        const { default: axios } = await import("axios");
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData,
        );
        setAvatarUrl(res.data.secure_url);
      } else {
        // Simulate upload
        await new Promise((r) => setTimeout(r, 1200));
        setAvatarUrl(
          `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`,
        );
      }
    } catch {
      setSaveStatus("error");
      setSaveMessage("Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const bioRegister = register("bio");

  const onSubmit = async (data: ProfileForm) => {
    try {
      setSaving(true);
      setSaveStatus("idle");

      const payload = {
        ...data,
        website: data.website || undefined,
        bio: data.bio || undefined,
        avatarUrl: avatarUrl,
      };

      if (isNewProfile) {
        const res = await api.post("/ca/profile", payload);
        setProfile({ ...res.data, user: { ...res.data.user, avatarUrl } });
        setIsNewProfile(false);
      } else {
        const res = await api.patch("/ca/profile", payload);
        setProfile((prev) =>
          prev
            ? { ...prev, ...res.data, user: { ...prev.user, avatarUrl } }
            : prev,
        );
      }

      setSaveStatus("success");
      setSaveMessage(
        isNewProfile
          ? "Profile created successfully!"
          : "Profile updated successfully!",
      );
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveMessage(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.firmName
    ? profile.firmName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "CA";

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  if (loadingProfile) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Loader2
            size={28}
            className="spin"
            style={{ color: "#6366f1", animation: "spin 1s linear infinite" }}
          />
          <p style={{ fontSize: 14, color: "#aaa" }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111",
            letterSpacing: "-0.5px",
            marginBottom: 4,
          }}
        >
          {isNewProfile ? "Complete Your Profile" : "My Profile"}
        </h1>
        <p style={{ fontSize: 14, color: "#888" }}>
          {isNewProfile
            ? "Set up your CA profile to start managing clients and documents."
            : "Manage your firm information, contact details, and public profile."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── LEFT CARD: Avatar + Stats ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Avatar Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ececec",
              borderRadius: 20,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div
                onClick={handleAvatarClick}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: avatarPreview
                    ? "transparent"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  border: "3px solid #fff",
                  boxShadow: "0 0 0 3px #6366f120, 0 4px 20px rgba(0,0,0,0.08)",
                  transition: "box-shadow 0.2s",
                  position: "relative",
                }}
                title="Click to change photo"
              >
                {avatarUploading ? (
                  <Loader2
                    size={28}
                    color="#fff"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: -1,
                    }}
                  >
                    {initials}
                  </span>
                )}

                {/* Hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <Camera size={22} color="#fff" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />

              {/* TOTP badge */}
              {profile?.user?.totpEnabled && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    background: "#10b981",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                  }}
                  title="2FA Enabled"
                >
                  <Shield size={11} color="#fff" />
                </div>
              )}
            </div>

            {/* Name & email */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 2,
                }}
              >
                {profile?.firmName || user?.email?.split("@")[0]}
              </p>
              <p style={{ fontSize: 12, color: "#aaa" }}>{user?.email}</p>
              {profile?.licenseNumber && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "#f0f0ff",
                    borderRadius: 100,
                    padding: "3px 10px",
                    marginTop: 8,
                  }}
                >
                  <BadgeCheck size={12} color="#6366f1" />
                  <span
                    style={{ fontSize: 11, fontWeight: 600, color: "#6366f1" }}
                  >
                    {profile.licenseNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Click hint */}
            <p style={{ fontSize: 11, color: "#bbb", textAlign: "center" }}>
              Click on photo to update
            </p>
          </div>

          {/* Stats Card (only when profile exists) */}
          {!isNewProfile && profile && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: 20,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                Account Overview
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Users size={14} color="#6366f1" />
                    <span style={{ fontSize: 13, color: "#666" }}>
                      Total Clients
                    </span>
                  </div>
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: "#111" }}
                  >
                    {profile.clients?.length || 0}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Shield
                      size={14}
                      color={profile.user?.totpEnabled ? "#10b981" : "#ccc"}
                    />
                    <span style={{ fontSize: 13, color: "#666" }}>
                      2FA Security
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 100,
                      background: profile.user?.totpEnabled
                        ? "#ecfdf5"
                        : "#f5f5f5",
                      color: profile.user?.totpEnabled ? "#10b981" : "#999",
                    }}
                  >
                    {profile.user?.totpEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {memberSince && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Calendar size={14} color="#6366f1" />
                      <span style={{ fontSize: 13, color: "#666" }}>
                        Member Since
                      </span>
                    </div>
                    <span
                      style={{ fontSize: 12, fontWeight: 500, color: "#555" }}
                    >
                      {memberSince}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Form ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #ececec",
            borderRadius: 20,
            padding: 32,
          }}
        >
          {/* Save Status Banner */}
          {saveStatus !== "idle" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 12,
                marginBottom: 24,
                background: saveStatus === "success" ? "#ecfdf5" : "#fff5f5",
                border: `1px solid ${saveStatus === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {saveStatus === "success" ? (
                <CheckCircle2 size={16} color="#10b981" />
              ) : (
                <AlertCircle size={16} color="#dc2626" />
              )}
              <span
                style={{
                  fontSize: 13,
                  color: saveStatus === "success" ? "#065f46" : "#dc2626",
                  fontWeight: 500,
                }}
              >
                {saveMessage}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Section: Firm Details */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Building2 size={15} color="#6366f1" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Firm Details
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <FormField
                  id="firmName"
                  label="Firm Name"
                  placeholder="Sharma & Associates"
                  error={errors.firmName?.message}
                  register={register("firmName")}
                />
                <FormField
                  id="licenseNumber"
                  label="License / Membership No."
                  placeholder="ICA123456"
                  error={errors.licenseNumber?.message}
                  register={register("licenseNumber")}
                  disabled={!isNewProfile}
                  hint={
                    !isNewProfile
                      ? "License number cannot be changed"
                      : undefined
                  }
                />
              </div>
            </div>

            <Divider />

            {/* Section: Contact */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Phone size={15} color="#6366f1" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Contact Info
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <FormField
                  id="phone"
                  label="Phone Number"
                  placeholder="9876543210"
                  type="tel"
                  error={errors.phone?.message}
                  register={register("phone")}
                />
                <FormField
                  id="website"
                  label="Website (optional)"
                  placeholder="https://yourfirm.com"
                  type="url"
                  error={errors.website?.message}
                  register={register("website")}
                />
              </div>

              <FormField
                id="address"
                label="Office Address"
                placeholder="123 MG Road, Jaipur, Rajasthan 302001"
                error={errors.address?.message}
                register={register("address")}
              />
            </div>

            <Divider />

            {/* Section: About */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <FileText size={15} color="#6366f1" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  About Your Firm
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label
                    htmlFor="bio"
                    style={{ fontSize: 12, fontWeight: 500, color: "#555" }}
                  >
                    Firm Bio / Description{" "}
                    <span style={{ color: "#ccc" }}>(optional)</span>
                  </label>
                  <span
                    style={{
                      fontSize: 11,
                      color: bioLength > 280 ? "#dc2626" : "#bbb",
                    }}
                  >
                    {bioLength}/300
                  </span>
                </div>
                <textarea
                  id="bio"
                  placeholder="Tell clients about your firm, specializations, years of experience..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${errors.bio ? "#fecaca" : "#e4e4e4"}`,
                    borderRadius: 12,
                    fontSize: 13,
                    color: "#111",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.15s",
                    background: "#fafafa",
                    boxSizing: "border-box",
                  }}
                  {...bioRegister}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#6366f1")
                  }
                  onBlur={(e) => {
                    bioRegister.onBlur(e);
                    e.currentTarget.style.borderColor = errors.bio
                      ? "#fecaca"
                      : "#e4e4e4";
                  }}
                />
                {errors.bio && (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
                paddingTop: 8,
              }}
            >
              {!isNewProfile && isDirty && (
                <p style={{ fontSize: 12, color: "#f59e0b" }}>
                  You have unsaved changes
                </p>
              )}
              <button
                type="submit"
                disabled={saving || avatarUploading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 24px",
                  background:
                    saving || avatarUploading
                      ? "#e5e7eb"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: saving || avatarUploading ? "#9ca3af" : "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving || avatarUploading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    saving || avatarUploading
                      ? "none"
                      : "0 4px 14px rgba(99,102,241,0.3)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Saving...
                  </>
                ) : isNewProfile ? (
                  <>
                    <Edit3 size={16} /> Create Profile
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Reusable Field Component ──
function FormField({
  id,
  label,
  placeholder,
  error,
  register,
  type = "text",
  disabled = false,
  hint,
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  register: any;
  type?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 12, fontWeight: 500, color: "#555" }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          height: 42,
          padding: "0 14px",
          border: `1px solid ${error ? "#fecaca" : "#e4e4e4"}`,
          borderRadius: 12,
          fontSize: 13,
          color: "#111",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          background: disabled ? "#f9f9f9" : "#fafafa",
          cursor: disabled ? "not-allowed" : "text",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = "#6366f1";
        }}
        onBlur={(e) => {
          if (!disabled)
            e.currentTarget.style.borderColor = error ? "#fecaca" : "#e4e4e4";
        }}
        {...register}
      />
      {hint && <p style={{ fontSize: 11, color: "#aaa" }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ height: 1, background: "#f0f0f0", margin: "0 -32px" }} />
  );
}
