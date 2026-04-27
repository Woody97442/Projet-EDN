import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Login } from "@/scripts/Api";
import { useAuth } from "@/context/AuthContext";

function validateEmail(email: string): string | null {
  if (!email) return "L'email est requis";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format d'email invalide";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Le mot de passe est requis";
  if (password.length < 4) return "Mot de passe trop court (minimum 4 caractères)";
  return null;
}

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }
    setErrors({});
    setLoading(true);

    const res = await Login({ email, password });
    setLoading(false);

    if (res.ok) {
      login(res.token, res.user);
      navigate("/dashboard");
    } else {
      setErrors({ form: res.message });
    }
  }

  return (
    <div>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-secondary text-3xl font-bold text-center">
            Espace E-learning
          </CardTitle>
          <CardDescription>
            Entrez votre email et mot de passe pour vous connecter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-left text-primary">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="password" className="text-left text-primary">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {errors.form && (
              <p className="text-sm text-red-600 text-center">{errors.form}</p>
            )}

            <Button type="submit" variant="edn_hover" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <p>Vous n'avez pas de compte ?</p>
        <Link to="/register" className="text-primary underline">
          Inscrivez-vous
        </Link>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">Compte de test :</p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            type="button"
            onClick={() => { setEmail("usertest@ccir-campus.re"); setPassword("erer"); }}>
            User
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => { setEmail("admin@ccir-campus.re"); setPassword("erer"); }}>
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
