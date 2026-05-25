"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, X, Send, Inbox, ArrowUpRight, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api/axios";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string().min(1, "File name required"),
  fileUrl: z.string().url("Valid URL required"),
});

type UploadForm = z.infer<typeof uploadSchema>;

type Document = {
  id: number;
  fileName: string;
  fileUrl: string;
  isSigned: boolean;
  signedAt: string | null;
  createdAt: string;
  uploadedBy: "CA" | "CLIENT";
  signingMethod: "EMAIL" | "TOTP";
};

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [activeTab, setActiveTab] = useState<"RECEIVED" | "UPLOADS">("RECEIVED");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
  });

  const fetchDocs = async () => {
    try {
      const res = await api.get("/documents/my-documents");
      setDocuments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSendOtp = async () => {
    if (!selectedDoc) return;
    try {
      setSendingOtp(true);
      setError("");
      await api.post(`/documents/${selectedDoc.id}/send-otp`);
      setOtpSent(true);
      setSuccess("Email OTP sent successfully! (Check terminal console for simulated OTP code)");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSign = async () => {
    if (!selectedDoc || !otp) return;
    try {
      setSigning(true);
      setError("");
      await api.patch(`/documents/${selectedDoc.id}/sign`, { code: otp });
      setSuccess("Document signed successfully!");
      setSelectedDoc(null);
      setOtp("");
      setOtpSent(false);
      await fetchDocs();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Signing failed");
    } finally {
      setSigning(false);
    }
  };

  const handleUploadSubmit = async (data: UploadForm) => {
    try {
      setUploading(true);
      setError("");
      await api.post("/documents/client-upload", data);
      setSuccess("Document uploaded and shared with your CA successfully!");
      setShowUploadModal(false);
      reset();
      await fetchDocs();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleCloudinarySuccess = (url: string, name: string) => {
    setValue("fileUrl", url, { shouldValidate: true });
    const defaultName = name.replace(/\.[^/.]+$/, "");
    setValue("fileName", defaultName, { shouldValidate: true });
  };

  const receivedDocs = documents.filter((d) => d.uploadedBy === "CA");
  const myUploads = documents.filter((d) => d.uploadedBy === "CLIENT");

  const filtered = activeTab === "RECEIVED" ? receivedDocs : myUploads;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              letterSpacing: "-0.5px",
              marginBottom: 4,
            }}
          >
            My Documents
          </h1>
          <p style={{ fontSize: 13, color: "#999" }}>
            Manage files received from your CA and upload your own document records.
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          style={{
            height: 38,
            background: "#111",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 9,
            gap: 6,
          }}
        >
          <Plus size={15} /> Upload to CA
        </Button>
      </div>

      {/* Success alert banner */}
      {success && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 13,
            color: "#16a34a",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle size={15} />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid #ececec", paddingBottom: 10 }}>
        <button
          onClick={() => setActiveTab("RECEIVED")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: activeTab === "RECEIVED" ? 600 : 500,
            color: activeTab === "RECEIVED" ? "#111" : "#888",
            background: activeTab === "RECEIVED" ? "#fff" : "transparent",
            border: activeTab === "RECEIVED" ? "1px solid #e0e0e0" : "1px solid transparent",
            boxShadow: activeTab === "RECEIVED" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s",
          }}
        >
          <Inbox size={14} />
          Received from CA
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: activeTab === "RECEIVED" ? "#111" : "#f0f0f0",
              color: activeTab === "RECEIVED" ? "#fff" : "#888",
              borderRadius: 100,
              padding: "1px 6px",
            }}
          >
            {receivedDocs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("UPLOADS")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: activeTab === "UPLOADS" ? 600 : 500,
            color: activeTab === "UPLOADS" ? "#111" : "#888",
            background: activeTab === "UPLOADS" ? "#fff" : "transparent",
            border: activeTab === "UPLOADS" ? "1px solid #e0e0e0" : "1px solid transparent",
            boxShadow: activeTab === "UPLOADS" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s",
          }}
        >
          <ArrowUpRight size={14} />
          My Uploads
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: activeTab === "UPLOADS" ? "#111" : "#f0f0f0",
              color: activeTab === "UPLOADS" ? "#fff" : "#888",
              borderRadius: 100,
              padding: "1px 6px",
            }}
          >
            {myUploads.length}
          </span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            fontSize: 13,
            color: "#bbb",
          }}
        >
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #ececec",
          }}
        >
          <p style={{ fontSize: 14, color: "#bbb" }}>No documents found</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: 14,
                padding: "20px",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 16px rgba(0,0,0,0.06)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")
              }
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#f4f4f4",
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <FileText size={20} color="#888" />
              </div>

              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: 6,
                  letterSpacing: "-0.2px",
                }}
              >
                {doc.fileName}
              </p>

              <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>
                Uploaded{" "}
                {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              {/* Status details & actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {doc.isSigned ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <CheckCircle size={14} color="#16a34a" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#16a34a",
                      }}
                    >
                      {activeTab === "RECEIVED" ? "Signed" : "Uploaded"}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={14} color="#d97706" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#d97706",
                      }}
                    >
                      Pending sign
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      color: "#888",
                      textDecoration: "none",
                      padding: "5px 10px",
                      border: "1px solid #ececec",
                      borderRadius: 7,
                      fontWeight: 500,
                    }}
                  >
                    View
                  </a>
                  {!doc.isSigned && activeTab === "RECEIVED" && (
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setOtp("");
                        setOtpSent(false);
                      }}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#fff",
                        background: "#111",
                        border: "none",
                        borderRadius: 7,
                        padding: "5px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Sign
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal (My Uploads to CA) */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "32px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                  Upload Document
                </h2>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 3 }}>
                  Upload and share a document with your CA
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  reset();
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#aaa",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 9,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#dc2626",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit(handleUploadSubmit)}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                  File Document
                </Label>
                <CloudinaryUploader onUploadSuccess={handleCloudinarySuccess} />
                <input type="hidden" {...register("fileUrl")} />
                {errors.fileUrl && (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.fileUrl.message}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                  File Name Title
                </Label>
                <Input
                  placeholder="PAN_Card_Copy"
                  {...register("fileName")}
                  style={{
                    height: 40,
                    fontSize: 13,
                    borderColor: "#e4e4e4",
                    borderRadius: 9,
                  }}
                />
                {errors.fileName && (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.fileName.message}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <Button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    reset();
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    height: 40,
                    background: "#f4f4f4",
                    color: "#666",
                    fontSize: 13,
                    borderRadius: 9,
                    border: "none",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  style={{
                    flex: 1,
                    height: 40,
                    background: "#111",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 9,
                  }}
                >
                  {uploading ? "Uploading..." : "Share with CA"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Modal (Support Email OTP / Google Authenticator TOTP) */}
      {selectedDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "32px",
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                  Sign Document
                </h2>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 3 }}>
                  {selectedDoc.fileName}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setOtp("");
                  setOtpSent(false);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#aaa",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 9,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#dc2626",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* Email OTP signing flow */}
            {selectedDoc.signingMethod === "EMAIL" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{
                    background: "#fdfaeb",
                    border: "1px solid #fef3c7",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p style={{ fontSize: 12, color: "#b45309", lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                    <Mail size={14} /> Email OTP signature required
                  </p>
                </div>

                {!otpSent ? (
                  <Button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    style={{
                      height: 42,
                      background: "#111",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 9,
                      width: "100%",
                    }}
                  >
                    {sendingOtp ? "Sending code..." : "Request Email OTP Code"}
                  </Button>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                        Enter 6-Digit Email OTP
                      </Label>
                      <Input
                        type="text"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        style={{
                          height: 42,
                          fontSize: 15,
                          borderColor: "#e4e4e4",
                          borderRadius: 9,
                          letterSpacing: "8px",
                          textAlign: "center",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        style={{
                          fontSize: 11,
                          color: "#888",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Google Authenticator TOTP flow */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p style={{ fontSize: 12, color: "#6d28d9", lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={14} /> Google Authenticator signature required
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                    Enter 6-Digit Google Auth Code
                  </Label>
                  <Input
                    type="text"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    style={{
                      height: 42,
                      fontSize: 15,
                      borderColor: "#e4e4e4",
                      borderRadius: 9,
                      letterSpacing: "8px",
                      textAlign: "center",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Button
                type="button"
                onClick={() => {
                  setSelectedDoc(null);
                  setOtp("");
                  setOtpSent(false);
                  setError("");
                }}
                style={{
                  flex: 1,
                  height: 40,
                  background: "#f4f4f4",
                  color: "#666",
                  fontSize: 13,
                  borderRadius: 9,
                  border: "none",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSign}
                disabled={signing || otp.length < 6 || (selectedDoc.signingMethod === "EMAIL" && !otpSent)}
                style={{
                  flex: 1,
                  height: 40,
                  background: "#111",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 9,
                }}
              >
                {signing ? "Signing..." : "Sign Document"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
