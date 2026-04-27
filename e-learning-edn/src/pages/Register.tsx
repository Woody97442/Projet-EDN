import RegisterForm from "@/components/auth/register-form";

/**
 * Register component renders a registration page with a form.
 * Accepts a function prop `onRegister` which is called upon a successful registration.
 *
 * @param {RegisterPageProps} param0 - Props containing the `onRegister` function.
 * @returns A JSX element representing the registration page.
 */

export default function Register() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
