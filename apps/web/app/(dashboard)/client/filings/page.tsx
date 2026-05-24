"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import api from "@/lib/api/axios";

type Filing = {
  id: number;
  type: string;
  status: string;
  periodFrom: string;
  periodTo: string;
  notes: string | null;
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

export default function ClientFilingsPage() {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED"
  >("ALL");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/filings/client/me");
        setFilings(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered =
    activeTab === "ALL"
      ? filings
      : filings.filter((f) => f.status === activeTab);

  const tabs = [
    { key: "ALL", label: "All", count: filings.length },
    {
      key: "PENDING",
      label: "Pending",
      count: filings.filter((f) => f.status === "PENDING").length,
    },
    {
      key: "IN_PROGRESS",
      label: "In Progress",
      count: filings.filter((f) => f.status === "IN_PROGRESS").length,
    },
    {
      key: "COMPLETED",
      label: "Completed",
      count: filings.filter((f) => f.status === "COMPLETED").length,
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
          My Filings
        </h1>
        <p style={{ fontSize: 13, color: "#999" }}>
          Track all your tax filings and their status
        </p>
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
            gridTemplateColumns: "1fr 1.5fr 1fr 1.5fr",
            padding: "12px 20px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          {["Type", "Period", "Status", "Notes"].map((h) => (
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
            <div
              style={{
                width: 44,
                height: 44,
                background: "#f4f4f4",
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <FileText size={20} color="#ccc" />
            </div>
            <p style={{ fontSize: 14, color: "#bbb" }}>No filings found</p>
          </div>
        ) : (
          filtered.map((filing, i) => {
            const s = statusStyle[filing.status] || statusStyle.PENDING;
            return (
              <div
                key={filing.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.5fr 1fr 1.5fr",
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
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#444",
                    background: "#f4f4f4",
                    borderRadius: 6,
                    padding: "3px 8px",
                    display: "inline-block",
                    width: "fit-content",
                  }}
                >
                  {filing.type}
                </span>

                <div>
                  <p style={{ fontSize: 12, color: "#555" }}>
                    {new Date(filing.periodFrom).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
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
                    display: "inline-block",
                    width: "fit-content",
                  }}
                >
                  {filing.status.replace("_", " ")}
                </span>

                <p style={{ fontSize: 12, color: "#aaa" }}>
                  {filing.notes || "—"}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
