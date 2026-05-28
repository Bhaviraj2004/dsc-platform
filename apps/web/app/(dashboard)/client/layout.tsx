"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Shield,
  LayoutDashboard,
  FileText,
  ScrollText,
  LogOut,
  KeyRound,
  QrCode,
  CheckCircle2,
  Lock,
} from "lucide-react";
import api from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/client" },
  { icon: FileText, label: "My Filings", href: "/client/filings" },
  { icon: ScrollText, label: "My Documents", href: "/client/documents" },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, setAuth, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // TOTP setup state
  const [totpQrCode, setTotpQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [setupStep, setSetupStep] = useState(1);
  const [setupError, setSetupError] = useState("");
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    // Wait until Zustand loads from localStorage before checking auth
    if (!_hasHydrated) return;
    if (user === null) router.push("/login");
    else if (user.role !== "CLIENT") router.push("/ca");
  }, [user, router, _hasHydrated]);

  // Fetch TOTP configuration if user is logged in but TOTP is not enabled
  useEffect(() => {
    if (_hasHydrated && user && user.role === "CLIENT" && !user.totpEnabled && totpQrCode === "") {
      const getSetupData = async () => {
        try {
          const res = await api.get("/auth/totp/setup");
          setTotpQrCode(res.data.qrCodeUrl);
          setTotpSecret(res.data.secret);
        } catch (e) {
          console.error("Failed to load TOTP setup", e);
        }
      };
      getSetupData();
    }
  }, [_hasHydrated, user, totpQrCode]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const verifyAndEnableTotp = async () => {
    if (!totpCode || totpCode.length < 6) return;
    try {
      setEnabling(true);
      setSetupError("");
      await api.post("/auth/totp/enable", { code: totpCode });
      
      // Update local auth store state
      if (user) {
        setAuth({ ...user, totpEnabled: true }, token!);
      }
      setSetupStep(3);
    } catch (e: any) {
      setSetupError(e.response?.data?.message || "Invalid authenticator code. Please try again.");
    } finally {
      setEnabling(false);
    }
  };

  // Show nothing while Zustand is hydrating to prevent flash redirect
  if (!_hasHydrated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8f8f8" }}>
        <div style={{ fontSize: 13, color: "#bbb" }}>Loading...</div>
      </div>
    );
  }

  // Force Google Authenticator TOTP configuration on first login
  if (user && user.role === "CLIENT" && !user.totpEnabled) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f4f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 40,
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
            border: "1px solid #e4e4e7",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30, justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111", letterSpacing: "-0.2px" }}>DSC Platform</span>
          </div>

          {setupStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <KeyRound size={26} color="#6d28d9" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#18181b", marginBottom: 8, letterSpacing: "-0.4px" }}>
                Configure Two-Factor Auth
              </h2>
              <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, marginBottom: 24 }}>
                To secure your filings and token documents, we require Google Authenticator 2FA setup on first login.
              </p>

              <div style={{ background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 12, padding: "16px 20px", width: "100%", textAlign: "left", marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#27272a", marginBottom: 6 }}>Requirements:</p>
                <ul style={{ fontSize: 12, color: "#71717a", paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li>Google Authenticator or Microsoft Authenticator app</li>
                  <li>Scan the generated QR Code to bind the account</li>
                  <li>Legally binding digital signature validation</li>
                </ul>
              </div>

              <Button
                onClick={() => setSetupStep(2)}
                style={{ width: "100%", height: 42, background: "#111", color: "#fff", fontWeight: 600, borderRadius: 10 }}
              >
                Set up Google Authenticator →
              </Button>
            </div>
          )}

          {setupStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#18181b", marginBottom: 4, letterSpacing: "-0.3px", textAlign: "center" }}>
                Scan QR Code
              </h2>
              <p style={{ fontSize: 13, color: "#71717a", marginBottom: 20, textAlign: "center" }}>
                Open Authenticator app and scan this QR code
              </p>

              {totpQrCode ? (
                <div style={{ border: "1px solid #e4e4e7", padding: 12, borderRadius: 14, background: "#fff", marginBottom: 16 }}>
                  <img src={totpQrCode} alt="TOTP QR Code" style={{ width: 180, height: 180 }} />
                </div>
              ) : (
                <div style={{ width: 180, height: 180, background: "#fafafa", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: "#bbb animate-pulse" }}>Generating QR...</span>
                </div>
              )}

              {/* Secret key for manual entry */}
              <div style={{ width: "100%", marginBottom: 20, textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "#a1a1aa" }}>Or enter secret key manually:</span>
                <p style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 600, color: "#52525b", background: "#f4f4f5", padding: "6px 12px", borderRadius: 8, marginTop: 4, letterSpacing: "1px" }}>
                  {totpSecret}
                </p>
              </div>

              {setupError && (
                <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#dc2626", marginBottom: 16, width: "100%", textAlign: "center" }}>
                  {setupError}
                </div>
              )}

              {/* Code Verification Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginBottom: 20 }}>
                <Label style={{ fontSize: 12, fontWeight: 600, color: "#52525b" }}>Enter 6-Digit Authenticator Code</Label>
                <Input
                  type="text"
                  placeholder="000 000"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  style={{ height: 42, fontSize: 15, textAlign: "center", letterSpacing: "8px", borderColor: "#e4e4e7", borderRadius: 9 }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <Button
                  onClick={() => setSetupStep(1)}
                  style={{ flex: 1, height: 42, background: "#f4f4f5", color: "#52525b", border: "none", borderRadius: 10 }}
                >
                  Back
                </Button>
                <Button
                  onClick={verifyAndEnableTotp}
                  disabled={totpCode.length < 6 || enabling}
                  style={{ flex: 2, height: 42, background: "#111", color: "#fff", fontWeight: 600, borderRadius: 10 }}
                >
                  {enabling ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <CheckCircle2 size={26} color="#10b981" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#18181b", marginBottom: 8, letterSpacing: "-0.4px" }}>
                Securely Enabled!
              </h2>
              <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, marginBottom: 24 }}>
                Your account is now protected with Google Authenticator. You are ready to log in and sign documents.
              </p>

              <Button
                onClick={() => router.refresh()}
                style={{ width: "100%", height: 42, background: "#10b981", color: "#fff", fontWeight: 600, borderRadius: 10 }}
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          <div style={{ marginTop: 24, borderTop: "1px solid #e4e4e7", paddingTop: 16, textAlign: "center" }}>
            <button
              onClick={handleLogout}
              style={{ background: "none", border: "none", color: "#71717a", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <LogOut size={13} /> Cancel & Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f8f8" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          background: "#fff",
          borderRight: "1px solid #ececec",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 8px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "#111",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={15} color="#fff" />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111",
              letterSpacing: "-0.2px",
            }}
          >
            DSC Platform
          </span>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#111" : "#888",
                  background: isActive ? "#f4f4f4" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "#f8f8f8";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#111";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#888";
                  }
                }}
              >
                <item.icon size={16} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid #ececec", paddingTop: 16 }}>
          <div style={{ padding: "8px 12px", marginBottom: 4 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111",
                marginBottom: 2,
              }}
            >
              {user?.email?.split("@")[0]}
            </p>
            <p style={{ fontSize: 11, color: "#aaa" }}>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "9px 12px",
              borderRadius: 9,
              fontSize: 13,
              color: "#888",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#fff5f5";
              (e.currentTarget as HTMLButtonElement).style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#888";
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <div
        style={{
          marginLeft: 240,
          flex: 1,
          padding: "32px 40px",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}
