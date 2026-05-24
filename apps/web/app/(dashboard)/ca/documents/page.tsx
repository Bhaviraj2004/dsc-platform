"use client";

import { useEffect, useState } from "react";
import { Plus, X, FileText, CheckCircle, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api/axios";

const docSchema = z.object({
  clientId: z.coerce.number().min(1, "Select a client"),
  fileName: z.string().min(1, "File name required"),
  fileUrl: z.string().url("Valid URL required"),
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
  const [activeTab, setActiveTab] = useState<"ALL" | "SIGNED" | "UNSIGNED">(
    "ALL",
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocForm>({
    resolver: zodResolver(docSchema),
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
      await api.post("/documents", data);
      await fetchAll();
      setShowModal(false);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setAdding(false);
    }
  };

  const allDocs = clients.flatMap((c) =>
    c.documents.map((d) => ({
      ...d,
      clientName: c.fullName,
      clientPan: c.pan,
    })),
  );

  const filtered =
    activeTab === "ALL"
      ? allDocs
      : activeTab === "SIGNED"
        ? allDocs.filter((d) => d.isSigned)
        : allDocs.filter((d) => !d.isSigned);

  const tabs = [
    { key: "ALL", label: "All", count: allDocs.length },
    {
      key: "SIGNED",
      label: "Signed",
      count: allDocs.filter((d) => d.isSigned).length,
    },
    {
      key: "UNSIGNED",
      label: "Unsigned",
      count: allDocs.filter((d) => !d.isSigned).length,
    },
  ];

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
            {allDocs.length} total · {allDocs.filter((d) => d.isSigned).length}{" "}
            signed
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
            gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr",
            padding: "12px 20px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          {["Document", "Client", "Uploaded", "Status"].map((h) => (
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
                gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr",
                padding: "14px 20px",
                borderBottom:
                  i < filtered.length - 1 ? "1px solid #f8f8f8" : "none",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "#fafafa")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "transparent")
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
                      color: "#aaa",
                      textDecoration: "none",
                    }}
                  >
                    View file ↗
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

              {/* Status */}
              {doc.isSigned ? (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <CheckCircle size={13} color="#16a34a" />
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}
                  >
                    Signed
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={13} color="#d97706" />
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}
                  >
                    Pending
                  </span>
                </div>
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
                  Send document to client for signing
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
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                  Client
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
                <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                  File Name
                </Label>
                <Input
                  placeholder="ITR_2025_26.pdf"
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

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                  File URL
                </Label>
                <Input
                  placeholder="https://..."
                  {...register("fileUrl")}
                  style={{
                    height: 40,
                    fontSize: 13,
                    borderColor: "#e4e4e4",
                    borderRadius: 9,
                  }}
                />
                {errors.fileUrl && (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.fileUrl.message}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
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
                  {adding ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
