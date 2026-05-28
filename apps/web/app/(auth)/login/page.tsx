"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { loginSchema, LoginSchema } from "@/lib/validations/auth.schema";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      setLoading(true);
      setError("");

      const res = await authApi.login(data);

      localStorage.setItem("access_token", res.access_token);

      const me = await authApi.me();

      const user = {
        ...me,
        totpEnabled: me.totpEnabled ?? false,
      };

      setAuth(user, res.access_token);

      router.push(user.role === "CA" ? "/ca" : "/client");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
      localStorage.removeItem("access_token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* LEFT */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-50 border-r border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900">
            DSC Platform
          </span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-500 font-medium">
              All systems operational
            </span>
          </div>

          <h1 className="text-4xl font-bold text-zinc-900 leading-tight tracking-tight mb-4">
            Manage clients,
            <br />
            <span className="text-zinc-400">not paperwork.</span>
          </h1>

          <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mb-10">
            A modern platform for CAs to track DSC tokens, file returns, and
            manage client documents — securely.
          </p>

          <div className="space-y-4">
            {[
              {
                icon: "🔐",
                title: "DSC Token Tracking",
                desc: "Expiry alerts & renewal reminders",
              },
              {
                icon: "📋",
                title: "Filing History",
                desc: "ITR, GST, TDS, ROC — all in one place",
              },
              {
                icon: "✍️",
                title: "Remote Signing",
                desc: "Clients sign documents from anywhere",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-base shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800">
                    {f.title}
                  </p>
                  <p className="text-xs text-zinc-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-300">
          © 2026 DSC Platform. All rights reserved.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Card className="border-zinc-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-zinc-900 tracking-tight">
                Sign in
              </CardTitle>
              <CardDescription>
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-sm text-red-600 mb-4">
                  {error}
                </div>
              )}

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 text-xs text-zinc-500 mb-4 leading-relaxed">
                <span className="font-semibold text-zinc-800 block mb-1">
                  🔑 Client Login Details
                </span>
                Clients can sign in using{" "}
                <code className="bg-zinc-200 px-1 py-0.5 rounded font-mono text-zinc-700 font-semibold">
                  abc@gmail.com
                </code>{" "}
                (e.g.{" "}
                <code className="bg-zinc-200 px-1 py-0.5 rounded font-mono text-zinc-700 font-semibold">
                  abcde@gmail.com
                </code>
                ) and their{" "}
                <code className="bg-zinc-200 px-1 py-0.5 rounded font-mono text-zinc-700 font-semibold">
                  PAN Number
                </code>{" "}
                in uppercase as the password.
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium text-zinc-600"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-10 text-sm"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-zinc-600"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-10 text-sm pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium"
                >
                  {loading ? "Signing in..." : "Continue →"}
                </Button>
              </form>

              <p className="text-center text-xs text-zinc-400 mt-4">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-zinc-700 font-semibold hover:text-zinc-900 transition-colors"
                >
                  Create one
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
