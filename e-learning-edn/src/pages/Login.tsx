import LoginForm from "@/components/auth/login-form";

export default function Login() {
  return (
    <div className="flex w-full min-h-[calc(100vh-160px)] items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
