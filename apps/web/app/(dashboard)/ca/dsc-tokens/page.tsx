"use client";

import { useEffect, useState } from "react";
import { Plus, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api/axios";

const tokenSchema = z.object({
  clientId: z.number().min(1, "Select a client"),
  tokenBrand: z.string().min(1, "Token brand required"),
  expiryDate: z.string().min(1, "Expiry date required"),
  isHeldByCA: z.boolean().optional(),
  notes: z.string().optional(),
});

type TokenForm = z.infer<typeof tokenSchema>;

type Client = { id: number; fullName: string; pan: string };
type DscToken = {
  id: number;
  tokenBrand: string;
  expiryDate: string;
  isHeldByCA: boolean;
  notes: string | null;
  clientId: number;
  client?: { fullName: string; pan: string; phone: string };
};

export default function DscTokensPage() {
  const [tokens, setTokens] = useState<DscToken[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expiring, setExpiring] = useState<DscToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TokenForm>({
    resolver: zodResolver(tokenSchema),
  });

  const fetchAll = async () => {
    try {
      const [clientsRes, expiringRes] = await Promise.all([
        api.get("/clients"),
        api.get("/dsc-tokens/expiring-soon"),
      ]);
      setClients(clientsRes.data);
      setExpiring(expiringRes.data);

      // fetch tokens for each client
      const allTokens: DscToken[] = [];
      for (const client of clientsRes.data) {
        const res = await api.get(`/dsc-tokens/client/${client.id}`);
        res.data.forEach((t: DscToken) => {
          allTokens.push({
            ...t,
            client: { fullName: client.fullName, pan: client.pan, phone: "" },
          });
        });
      }
      setTokens(allTokens);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onSubmit = async (data: TokenForm) => {
    try {
      setAdding(true);
      setError("");
      await api.post("/dsc-tokens", data);
      await fetchAll();
      setShowModal(false);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add token");
    } finally {
      setAdding(false);
    }
  };

  const daysUntil = (date: string) =>
    Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getStatusStyle = (days: number) => {
    if (days <= 7)
      return {
        bg: "#fff0f0",
        border: "#fecaca",
        color: "#dc2626",
        label: "Critical",
      };
    if (days <= 30)
      return {
        bg: "#fff8f0",
        border: "#fed7aa",
        color: "#f97316",
        label: "Expiring Soon",
      };
    return {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      color: "#16a34a",
      label: "Active",
    };
  };

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
            DSC Tokens
          </h1>
          <p style={{ fontSize: 13, color: "#999" }}>
            {tokens.length} total tokens · {expiring.length} expiring soon
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
          <Plus size={15} /> Add Token
        </Button>
      </div>

      {/* Alert Banner */}
      {expiring.length > 0 && (
        <div
          style={{
            background: "#fff8f0",
            border: "1px solid #fed7aa",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <AlertTriangle size={16} color="#f97316" />
          <p style={{ fontSize: 13, color: "#c2410c", fontWeight: 500 }}>
            {expiring.length} token{expiring.length > 1 ? "s" : ""} expiring
            within 30 days — renew soon!
          </p>
        </div>
      )}

      {/* Tokens Table */}
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
            gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr",
            padding: "12px 20px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          {["Client", "Token Brand", "Expiry", "Held By", "Status"].map((h) => (
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
        ) : tokens.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#bbb" }}>
              No DSC tokens added yet
            </p>
          </div>
        ) : (
          tokens.map((token, i) => {
            const days = daysUntil(token.expiryDate);
            const status = getStatusStyle(days);
            return (
              <div
                key={token.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr",
                  padding: "14px 20px",
                  borderBottom:
                    i < tokens.length - 1 ? "1px solid #f8f8f8" : "none",
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
                    {token.client?.fullName[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                      {token.client?.fullName}
                    </p>
                    <p style={{ fontSize: 11, color: "#bbb" }}>
                      {token.client?.pan}
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>
                  {token.tokenBrand}
                </span>

                <div>
                  <p style={{ fontSize: 13, color: "#444" }}>
                    {new Date(token.expiryDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p style={{ fontSize: 11, color: "#bbb" }}>
                    {days > 0 ? `${days} days left` : "Expired"}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: token.isHeldByCA ? "#6366f1" : "#0891b2",
                    background: token.isHeldByCA ? "#eef2ff" : "#ecfeff",
                    border: `1px solid ${token.isHeldByCA ? "#c7d2fe" : "#a5f3fc"}`,
                    borderRadius: 6,
                    padding: "3px 8px",
                    display: "inline-block",
                  }}
                >
                  {token.isHeldByCA ? "CA" : "Client"}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: status.color,
                    background: status.bg,
                    border: `1px solid ${status.border}`,
                    borderRadius: 6,
                    padding: "3px 8px",
                    display: "inline-block",
                  }}
                >
                  {status.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Add Token Modal */}
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
                  Add DSC Token
                </h2>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 3 }}>
                  Track a new DSC token
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
                   {...register("clientId", {
    valueAsNumber: true,
  })}
                  style={{
                    height: 40,
                    fontSize: 13,
                    borderColor: "#e4e4e4",
                    borderRadius: 9,
                    padding: "0 12px",
                    border: "1px solid #e4e4e4",
                    outline: "none",
                    background: "#fafafa",
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
                  Token Brand
                </Label>
                <Input
                  placeholder="ePass 2003, WD Token..."
                  {...register("tokenBrand")}
                  style={{
                    height: 40,
                    fontSize: 13,
                    borderColor: "#e4e4e4",
                    borderRadius: 9,
                  }}
                />
                {errors.tokenBrand && (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.tokenBrand.message}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                  Expiry Date
                </Label>
                <Input
                  type="date"
                  {...register("expiryDate")}
                  style={{
                    height: 40,
                    fontSize: 13,
                    borderColor: "#e4e4e4",
                    borderRadius: 9,
                  }}
                />
                {errors.expiryDate && (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>
                  Token Held By
                </Label>
                <select
                  {...register("isHeldByCA", {
                    setValueAs: (v) => v === "true",
                  })}
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
                  <option value="true">CA Office</option>
                  <option value="false">Client</option>
                </select>
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
                  {adding ? "Adding..." : "Add Token"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
