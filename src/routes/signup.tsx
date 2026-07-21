import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — MrsANONymous.org" },
      { name: "description", content: "Create an anonymous account on MrsANONymous.org. No email or personal details required." },
      { property: "og:title", content: "Sign up — MrsANONymous.org" },
      { property: "og:description", content: "Create an anonymous account on MrsANONymous.org. No email or personal details required." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-10">
      <h1 className="font-serif text-3xl text-ink-900">Sign up</h1>
      <p className="mt-4 text-sm text-ink-500">
        Choose an anonymous nickname and a password. We do not ask for your email, phone, or real name.
      </p>
      <p className="mt-6 text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-rose-500 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
