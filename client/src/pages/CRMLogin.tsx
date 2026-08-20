import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CRMLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.crm.auth.login.useMutation({
    onSuccess: () => {
      navigate("/crm");
    },
    onError: (err) => {
      toast.error(err.message || "Credenciais inválidas.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#e85d26] rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
            <span className="text-gray-900 text-2xl font-bold tracking-tight">TEAM 24</span>
          </div>
          <p className="text-gray-400 text-sm tracking-widest uppercase">CRM · Área Comercial</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-gray-900 text-xl font-semibold mb-1">Acesso restrito</h1>
          <p className="text-gray-500 text-sm mb-6">Introduza as suas credenciais para aceder ao CRM.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@team24.pt"
                required
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#e85d26] focus:ring-[#e85d26]/20"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-600 text-xs uppercase tracking-wider mb-1.5 block">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#e85d26] focus:ring-[#e85d26]/20"
              />
            </div>
            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-[#e85d26] hover:bg-[#d14e1a] text-white font-semibold py-2.5 mt-2"
            >
              {login.isPending ? "A entrar..." : "ENTRAR"}
            </Button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">© 2025 TEAM 24 — Área restrita</p>
      </div>
    </div>
  );
}
