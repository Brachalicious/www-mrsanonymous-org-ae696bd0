import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — MrsANONymous.org" },
      { name: "description", content: "Log in to your anonymous MrsANONymous.org account." },
      { property: "og:title", content: "Log in — MrsANONymous.org" },
      { property: "og:description", content: "Log in to your anonymous MrsANONymous.org account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-10">
      <h1 className="font-serif text-3xl text-ink-900">Log in</h1>
      <p className="mt-4 text-sm text-ink-500">
        Enter your anonymous nickname and password. No email required.
      </p>
      <p className="mt-6 text-sm text-ink-500">
        No account yet?{" "}
        <Link to="/signup" className="font-semibold text-rose-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
