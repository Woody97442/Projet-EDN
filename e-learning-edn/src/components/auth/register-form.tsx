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
import { Register } from "@/scripts/Api";
import { useAuth } from "@/context/AuthContext";

interface FieldErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  form?: string;
}

function validateForm(
  email: string,
  password: string,
  passwordConfirm: string
): FieldErrors {
  const errs: FieldErrors = {};
  if (!email) {
    errs.email = "L'email est requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = "Format d'email invalide";
  }
  if (!password) {
    errs.password = "Le mot de passe est requis";
  } else if (password.length < 6) {
    errs.password = "Minimum 6 caractères";
  }
  if (!passwordConfirm) {
    errs.passwordConfirm = "Veuillez confirmer le mot de passe";
  } else if (password !== passwordConfirm) {
    errs.passwordConfirm = "Les mots de passe ne correspondent pas";
  }
  return errs;
}

export default function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const errs = validateForm(email, password, passwordConfirm);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    const res = await Register({ email, password });
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
            Remplissez les champs pour créer un nouveau compte
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

            <div className="grid gap-1">
              <Label htmlFor="passwordConfirm" className="text-left text-primary">
                Confirmer le mot de passe
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                aria-invalid={!!errors.passwordConfirm}
              />
              {errors.passwordConfirm && (
                <p className="text-xs text-red-500">{errors.passwordConfirm}</p>
              )}
            </div>

            {errors.form && (
              <p className="text-sm text-red-600 text-center">{errors.form}</p>
            )}

            <Button type="submit" variant="edn_hover" className="w-full" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <p>Vous avez déjà un compte ?</p>
        <Link to="/login" className="text-primary underline">
          Connectez-vous
        </Link>
      </div>
    </div>
  );
}
