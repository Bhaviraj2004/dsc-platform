"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  FileText,
  ScrollText,
  LogOut,
} from "lucide-react";

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
  const { user, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until Zustand loads from localStorage before checking auth
    if (!_hasHydrated) return;
    if (user === null) router.push("/login");
    else if (user.role !== "CLIENT") router.push("/ca");
  }, [user, router, _hasHydrated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show nothing while Zustand is hydrating to prevent flash redirect
  if (!_hasHydrated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8f8f8" }}>
        <div style={{ fontSize: 13, color: "#bbb" }}>Loading...</div>
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
