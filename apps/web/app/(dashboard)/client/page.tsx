"use client";

import { useEffect, useState } from "react";
import { FileText, ScrollText, CheckCircle, Clock } from "lucide-react";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/lib/store/auth.store";

type Filing = {
  id: number;
  type: string;
  status: string;
  periodFrom: string;
  periodTo: string;
};

type Document = {
  id: number;
  fileName: string;
  fileUrl: string;
  isSigned: boolean;
  createdAt: string;
};

const statusStyle: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  PENDING: { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
  IN_PROGRESS: { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
  COMPLETED: { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
  REJECTED: { bg: "#fff0f0", border: "#fecaca", color: "#dc2626" },
};

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const [filings, setFilings] = useState<Filing[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [filingsRes, docsRes] = await Promise.all([
          api.get("/filings/client/me").catch(() => ({ data: [] })),
          api.get("/documents/my-documents"),
        ]);
        setFilings(filingsRes.data);
        setDocuments(docsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const unsignedDocs = documents.filter((d) => !d.isSigned);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div style={{ fontSize: 13, color: "#aaa" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111",
            letterSpacing: "-0.6px",
            marginBottom: 6,
          }}
        >
          Welcome back 👋
        </h1>
        <p style={{ fontSize: 14, color: "#999" }}>
          Here's an overview of your filings and documents.
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            icon: FileText,
            label: "Total Filings",
            value: filings.length,
            sub: "All time",
          },
          {
            icon: ScrollText,
            label: "Documents",
            value: documents.length,
            sub: `${unsignedDocs.length} pending signature`,
          },
          {
            icon: CheckCircle,
            label: "Completed",
            value: filings.filter((f) => f.status === "COMPLETED").length,
            sub: "Filings done",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#fff",
              border: "1px solid #ececec",
              borderRadius: 14,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: "#999" }}>
                {card.label}
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#f4f4f4",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <card.icon size={15} color="#666" />
              </div>
            </div>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-1px",
                marginBottom: 4,
              }}
            >
              {card.value}
            </p>
            <p style={{ fontSize: 12, color: "#bbb" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Unsigned Documents Alert */}
      {unsignedDocs.length > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Clock size={16} color="#d97706" />
          <p style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>
            {unsignedDocs.length} document{unsignedDocs.length > 1 ? "s" : ""}{" "}
            pending your signature —{" "}
            <a
              href="/client/documents"
              style={{
                color: "#d97706",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign now →
            </a>
          </p>
        </div>
      )}

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Filings */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #ececec",
            borderRadius: 14,
            padding: "22px 24px",
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
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: 3,
                }}
              >
                Recent Filings
              </h3>
              <p style={{ fontSize: 12, color: "#aaa" }}>Your filing history</p>
            </div>
            <a
              href="/client/filings"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#888",
                textDecoration: "none",
                padding: "5px 10px",
                border: "1px solid #ececec",
                borderRadius: 7,
              }}
            >
              View all
            </a>
          </div>

          {filings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                fontSize: 13,
                color: "#bbb",
              }}
            >
              No filings yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filings.slice(0, 4).map((filing) => {
                const s = statusStyle[filing.status] || statusStyle.PENDING;
                return (
                  <div
                    key={filing.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "#fafafa",
                      border: "1px solid #f0f0f0",
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#111",
                          marginBottom: 2,
                        }}
                      >
                        {filing.type}
                      </p>
                      <p style={{ fontSize: 11, color: "#aaa" }}>
                        {new Date(filing.periodFrom).toLocaleDateString(
                          "en-IN",
                          { month: "short", year: "numeric" },
                        )}
                        {" → "}
                        {new Date(filing.periodTo).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: s.color,
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        borderRadius: 6,
                        padding: "3px 8px",
                      }}
                    >
                      {filing.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #ececec",
            borderRadius: 14,
            padding: "22px 24px",
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
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: 3,
                }}
              >
                Documents
              </h3>
              <p style={{ fontSize: 12, color: "#aaa" }}>Sent by your CA</p>
            </div>
            <a
              href="/client/documents"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#888",
                textDecoration: "none",
                padding: "5px 10px",
                border: "1px solid #ececec",
                borderRadius: 7,
              }}
            >
              View all
            </a>
          </div>

          {documents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                fontSize: 13,
                color: "#bbb",
              }}
            >
              No documents yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        background: "#f0f0f0",
                        borderRadius: 7,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={13} color="#888" />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>
                      {doc.fileName}
                    </p>
                  </div>
                  {doc.isSigned ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <CheckCircle size={13} color="#16a34a" />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#16a34a",
                        }}
                      >
                        Signed
                      </span>
                    </div>
                  ) : (
                    <a
                      href="/client/documents"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#d97706",
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: 6,
                        padding: "3px 8px",
                        textDecoration: "none",
                      }}
                    >
                      Sign →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
