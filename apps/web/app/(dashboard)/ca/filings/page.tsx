"use client";

import { useEffect, useState } from "react";
import { Plus, X, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api/axios";

const filingSchema = z.object({
  clientId: z.coerce.number().min(1, "Select a client"),
  type: z.enum(["ITR", "GST", "TDS", "ROC", "DGFT", "MCA"]),
  periodFrom: z.string().min(1, "Required"),
  periodTo: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

type FilingForm = z.infer<typeof filingSchema>;

type Filing = {
  id: number;
  type: string;
  status: string;
  periodFrom: string;
  periodTo: string;
  notes: string | null;
  clientId: number;
  createdAt: string;
};

type Client = { id: number; fullName: string; pan: string; filings: Filing[] };

const statusStyle: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  PENDING: { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
  IN_PROGRESS: { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
  COMPLETED: { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
  REJECTED: { bg: "#fff0f0", border: "#fecaca", color: "#dc2626" },
};

export default function FilingsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED"
  >("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FilingForm>({
    resolver: zodResolver(filingSchema),
  });

  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      const withFilings = await Promise.all(
        res.data.map(async (c: Client) => {
          const fRes = await api.get(`/filings/client/${c.id}`);
          return { ...c, filings: fRes.data };
        }),
      );
      setClients(withFilings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (data: FilingForm) => {
    try {
      setAdding(true);
      setError("");
      await api.post("/filings", data);
      await fetchClients();
      setShowModal(false);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add filing");
    } finally {
      setAdding(false);
    }
  };

  const updateStatus = async (filingId: number, status: string) => {
    try {
      setUpdatingId(filingId);
      await api.patch(`/filings/${filingId}/status`, { status });
      await fetchClients();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const allFilings = clients.flatMap((c) =>
    c.filings.map((f) => ({ ...f, clientName: c.fullName, clientPan: c.pan })),
  );

  const filtered =
    activeTab === "ALL"
      ? allFilings
      : allFilings.filter((f) => f.status === activeTab);

  const tabs = [
    { key: "ALL", label: "All", count: allFilings.length },
    {
      key: "PENDING",
      label: "Pending",
      count: allFilings.filter((f) => f.status === "PENDING").length,
    },
    {
      key: "IN_PROGRESS",
      label: "In Progress",
      count: allFilings.filter((f) => f.status === "IN_PROGRESS").length,
    },
    {
      key: "COMPLETED",
      label: "Completed",
      count: allFilings.filter((f) => f.status === "COMPLETED").length,
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
            Filings
          </h1>
          <p style={{ fontSize: 13, color: "#999" }}>
            {allFilings.length} total filings
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
          <Plus size={15} /> Add Filing
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
              border: "1px solid",
              borderColor: activeTab === tab.key ? "#e0e0e0" : "transparent",
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
            gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1.5fr",
            padding: "12px 20px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          {["Client", "Type", "Period", "Status", "Action"].map((h) => (
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
            <p style={{ fontSize: 14, color: "#bbb" }}>No filings found</p>
          </div>
        ) : (
          filtered.map((filing: any, i) => {
            const s = statusStyle[filing.status] || statusStyle.PENDING;
            return (
              <div
                key={filing.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1.5fr",
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "#f0f0f0",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#666",
                    }}
                  >
                    {filing.clientName[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                      {filing.clientName}
                    </p>
                    <p style={{ fontSize: 11, color: "#bbb" }}>
                      {filing.clientPan}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#444",
                    background: "#f4f4f4",
                    borderRadius: 6,
                    padding: "3px 8px",
                    display: "inline-block",
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
                  }}
                >
                  {filing.status.replace("_", " ")}
                </span>

                <select
                  value={filing.status}
                  disabled={
                    updatingId === filing.id || filing.status === "COMPLETED"
                  }
                  onChange={(e) => updateStatus(filing.id, e.target.value)}
                  style={{
                    height: 32,
                    fontSize: 12,
                    border: "1px solid #e4e4e4",
                    borderRadius: 7,
                    padding: "0 8px",
                    background: "#fafafa",
                    color: "#555",
                    cursor: "pointer",
                    outline: "none",
                    opacity: filing.status === "COMPLETED" ? 0.5 : 1,
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            );
          })
        )}
      </div>

      {/* Add Filing Modal */}
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
                  Add Filing
                </h2>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 3 }}>
                  Create a new filing record
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
                  Filing Type
                </Label>
                <select
                  {...register("type")}
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
                  {["ITR", "GST", "TDS", "ROC", "DGFT", "MCA"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <Label
                    style={{ fontSize: 12, fontWeight: 500, color: "#555" }}
                  >
                    Period From
                  </Label>
                  <Input
                    type="date"
                    {...register("periodFrom")}
                    style={{
                      height: 40,
                      fontSize: 13,
                      borderColor: "#e4e4e4",
                      borderRadius: 9,
                    }}
                  />
                  {errors.periodFrom && (
                    <p style={{ fontSize: 11, color: "#dc2626" }}>
                      {errors.periodFrom.message}
                    </p>
                  )}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <Label
                    style={{ fontSize: 12, fontWeight: 500, color: "#555" }}
                  >
                    Period To
                  </Label>
                  <Input
                    type="date"
                    {...register("periodTo")}
                    style={{
                      height: 40,
                      fontSize: 13,
                      borderColor: "#e4e4e4",
                      borderRadius: 9,
                    }}
                  />
                  {errors.periodTo && (
                    <p style={{ fontSize: 11, color: "#dc2626" }}>
                      {errors.periodTo.message}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                  Notes (optional)
                </Label>
                <Input
                  placeholder="Any notes..."
                  {...register("notes")}
                  style={{
                    height: 40,
                    fontSize: 13,
                    borderColor: "#e4e4e4",
                    borderRadius: 9,
                  }}
                />
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
                  {adding ? "Adding..." : "Add Filing"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
