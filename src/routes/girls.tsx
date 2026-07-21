import { createFileRoute } from "@tanstack/react-router";
import { AudiencePage } from "@/components/AudiencePage";

export const Route = createFileRoute("/girls")({
  head: () => ({
    meta: [
      { title: "For Girls & Teens — MrsAnonymous" },
      { name: "description", content: "A safe, anonymous space for girls and teens. We see you, we hear you, we believe you." },
      { property: "og:title", content: "For Girls & Teens — MrsAnonymous" },
      { property: "og:description", content: "A safe, anonymous space for girls and teens." },
    ],
  }),
  component: GirlsPage,
});

function GirlsPage() {
  return <AudiencePage audience="girls" />;
}
