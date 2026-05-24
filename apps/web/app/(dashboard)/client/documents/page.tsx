"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api/axios";

type Document = {
  id: number;
  fileName: string;
  fileUrl: string;
  isSigned: boolean;
  signedAt: string | null;
  createdAt: string;
};

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "SIGNED" | "UNSIGNED">(
    "ALL",
  );

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

  const handleSign = async () => {
    if (!selectedDoc || !otp) return;
    try {
      setSigning(true);
      setError("");
      await api.patch(`/documents/${selectedDoc.id}/sign`, { aadhaarOtp: otp });
      setSuccess("Document signed successfully!");
      setSelectedDoc(null);
      setOtp("");
      await fetchDocs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Signing failed");
    } finally {
      setSigning(false);
    }
  };

  const filtered =
    activeTab === "ALL"
      ? documents
      : activeTab === "SIGNED"
        ? documents.filter((d) => d.isSigned)
        : documents.filter((d) => !d.isSigned);

  const tabs = [
    { key: "ALL", label: "All", count: documents.length },
    {
      key: "UNSIGNED",
      label: "Pending Signature",
      count: documents.filter((d) => !d.isSigned).length,
    },
    {
      key: "SIGNED",
      label: "Signed",
      count: documents.filter((d) => d.isSigned).length,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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
          Documents sent by your CA for review and signing
        </p>
      </div>

      {/* Success */}
      {success && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
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
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "#111" : "#888",
              background: activeTab === tab.key ? "#f0f0f0" : "transparent",
              border: `1px solid ${activeTab === tab.key ? "#e0e0e0" : "transparent"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: activeTab === tab.key ? "#fff" : "#f0f0f0",
                color: "#888",
                borderRadius: 100,
                padding: "1px 7px",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Documents Grid */}
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
              {/* File Icon */}
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

              {/* File Name */}
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

              {/* Date */}
              <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>
                Uploaded{" "}
                {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              {/* Status + Action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {doc.isSigned ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <CheckCircle size={14} color="#16a34a" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#16a34a",
                      }}
                    >
                      Signed{" "}
                      {doc.signedAt
                        ? new Date(doc.signedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Clock size={14} color="#d97706" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#d97706",
                      }}
                    >
                      Pending signature
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
                  {!doc.isSigned && (
                    <button
                      onClick={() => setSelectedDoc(doc)}
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

      {/* Sign Modal */}
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
                marginBottom: 24,
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

            <div
              style={{
                background: "#f8f8f8",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                Enter your Aadhaar OTP to digitally sign this document. This
                signature is legally binding.
              </p>
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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 20,
              }}
            >
              <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                Aadhaar OTP
              </Label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{
                  height: 42,
                  fontSize: 14,
                  borderColor: "#e4e4e4",
                  borderRadius: 9,
                  letterSpacing: "4px",
                  textAlign: "center",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Button
                type="button"
                onClick={() => {
                  setSelectedDoc(null);
                  setOtp("");
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
                disabled={signing || otp.length < 4}
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
