"use client";

import { useEffect, useState } from "react";
import { Plus, X, FileText, CheckCircle, Clock, Send, Inbox, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api/axios";
import CloudinaryUploader from "@/components/CloudinaryUploader";

const docSchema = z.object({
  clientId: z.coerce.number().min(1, "Select a client"),
  fileName: z.string().min(1, "File name required"),
  fileUrl: z.string().url("Valid URL required"),
  signingMethod: z.enum(["EMAIL", "TOTP"]),
});

type DocForm = z.infer<typeof docSchema>;

type Document = {
  id: number;
  fileName: string;
  fileUrl: string;
  isSigned: boolean;
  signedAt: string | null;
  clientId: number;
  createdAt: string;
  uploadedBy: "CA" | "CLIENT";
  signingMethod: "EMAIL" | "TOTP";
};

type Client = {
  id: number;
  fullName: string;
  pan: string;
  documents: Document[];
};

export default function DocumentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"SENT" | "RECEIVED">("SENT");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DocForm>({
    resolver: zodResolver(docSchema),
    defaultValues: {
      signingMethod: "EMAIL",
    },
  });

  const fetchAll = async () => {
    try {
      const res = await api.get("/clients");
      const withDocs = await Promise.all(
        res.data.map(async (c: Client) => {
          const dRes = await api.get(`/documents/client/${c.id}`);
          return { ...c, documents: dRes.data };
        }),
      );
      setClients(withDocs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onSubmit = async (data: DocForm) => {
    try {
      setAdding(true);
      setError("");
      await api.post("/documents", {
        ...data,
        uploadedBy: "CA",
      });
      await fetchAll();
      setShowModal(false);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setAdding(false);
    }
  };

  const handleCloudinarySuccess = (url: string, name: string) => {
    setValue("fileUrl", url, { shouldValidate: true });
    // Remove extension for default name
    const defaultName = name.replace(/\.[^/.]+$/, "");
    setValue("fileName", defaultName, { shouldValidate: true });
  };

  const allDocs = clients.flatMap((c) =>
    c.documents.map((d) => ({
      ...d,
      clientName: c.fullName,
      clientPan: c.pan,
    })),
  );

  const sentDocs = allDocs.filter((d) => d.uploadedBy === "CA");
  const receivedDocs = allDocs.filter((d) => d.uploadedBy === "CLIENT");

  const filtered = activeTab === "SENT" ? sentDocs : receivedDocs;

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
            Documents
          </h1>
          <p style={{ fontSize: 13, color: "#999" }}>
            {sentDocs.length} sent · {receivedDocs.length} received from clients
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
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
          <Plus size={15} /> Upload Document
        </Button>
      </div>

      {/* Main Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid #ececec", paddingBottom: 10 }}>
        <button
          onClick={() => setActiveTab("SENT")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: activeTab === "SENT" ? 600 : 500,
            color: activeTab === "SENT" ? "#111" : "#888",
            background: activeTab === "SENT" ? "#fff" : "transparent",
            border: activeTab === "SENT" ? "1px solid #e0e0e0" : "1px solid transparent",
            boxShadow: activeTab === "SENT" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s",
          }}
        >
          <Send size={14} />
          Sent to Clients
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: activeTab === "SENT" ? "#111" : "#f0f0f0",
              color: activeTab === "SENT" ? "#fff" : "#888",
              borderRadius: 100,
              padding: "1px 6px",
            }}
          >
            {sentDocs.length}
          </span>
        </button>
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
          Received from Clients
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
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ececec",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: activeTab === "SENT" ? "2fr 1.2fr 1fr 1fr 1fr" : "2fr 1.5fr 1.5fr",
            padding: "12px 20px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          {activeTab === "SENT"
            ? ["Document", "Client", "Uploaded Date", "Signing Mode", "Status"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {h}
                </span>
              ))
            : ["Document", "Client Name", "Received Date"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {h}
                </span>
              ))}
        </div>

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              fontSize: 13,
              color: "#bbb",
            }}
          >
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#bbb" }}>No documents found</p>
          </div>
        ) : (
          filtered.map((doc: any, i) => (
            <div
              key={doc.id}
              style={{
                display: "grid",
                gridTemplateColumns: activeTab === "SENT" ? "2fr 1.2fr 1fr 1fr 1fr" : "2fr 1.5fr 1.5fr",
                padding: "14px 20px",
                borderBottom: i < filtered.length - 1 ? "1px solid #f8f8f8" : "none",
                alignItems: "center",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "#fafafa")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "transparent")
              }
            >
              {/* File */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    background: "#f4f4f4",
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={15} color="#888" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                    {doc.fileName}
                  </p>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11,
                      color: "#3b82f6",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    View File ↗
                  </a>
                </div>
              </div>

              {/* Client */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    background: "#f0f0f0",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#666",
                  }}
                >
                  {doc.clientName[0]}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
                    {doc.clientName}
                  </p>
                  <p style={{ fontSize: 11, color: "#bbb" }}>{doc.clientPan}</p>
                </div>
              </div>

              {/* Date */}
              <p style={{ fontSize: 12, color: "#888" }}>
                {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              {/* Sent-only fields */}
              {activeTab === "SENT" && (
                <>
                  {/* Signing Method */}
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: doc.signingMethod === "TOTP" ? "#f5f3ff" : "#f0fdf4",
                        color: doc.signingMethod === "TOTP" ? "#6d28d9" : "#15803d",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {doc.signingMethod === "TOTP" ? "🔑 Google Auth" : "📧 Email OTP"}
                    </span>
                  </div>

                  {/* Status */}
                  {doc.isSigned ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <CheckCircle size={13} color="#16a34a" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
                        Signed
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={13} color="#d97706" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>
                        Pending
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
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
              maxWidth: 460,
              boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
              maxHeight: "90vh",
              overflowY: "auto",
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
                  Send a new document to client for signing
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
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
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              {/* File Uploader */}
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

              {/* Form Input fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                  Client Recipient
                </Label>
                <select
                  {...register("clientId")}
                  style={{
                    height: 40,
                    fontSize: 13,
                    border: "1px solid #e4e4e4",
                    borderRadius: 9,
                    padding: "0 12px",
                    background: "#fafafa",
                    outline: "none",
                  }}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} — {c.pan}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.clientId.message}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                  Document Title / File Name
                </Label>
                <Input
                  placeholder="ITR_Filing_2025-26"
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

              {/* Verification method selection (CA Choice) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                  Required Signature Method
                </Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label
                    style={{
                      border: "1px solid #e4e4e4",
                      borderRadius: 10,
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      cursor: "pointer",
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#111" }}>
                      <input
                        type="radio"
                        value="EMAIL"
                        {...register("signingMethod")}
                        style={{ accentColor: "#111" }}
                      />
                      📧 Email OTP
                    </div>
                    <span style={{ fontSize: 10, color: "#aaa", paddingLeft: 20 }}>
                      Quick 6-digit code sent to client's email.
                    </span>
                  </label>

                  <label
                    style={{
                      border: "1px solid #e4e4e4",
                      borderRadius: 10,
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      cursor: "pointer",
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#111" }}>
                      <input
                        type="radio"
                        value="TOTP"
                        {...register("signingMethod")}
                        style={{ accentColor: "#111" }}
                      />
                      🔑 Google Auth
                    </div>
                    <span style={{ fontSize: 10, color: "#aaa", paddingLeft: 20 }}>
                      Maximum security using Google Authenticator.
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
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
                  disabled={adding}
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
                  {adding ? "Uploading..." : "Upload & Send"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
