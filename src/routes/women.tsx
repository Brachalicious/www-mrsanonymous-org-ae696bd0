import { createFileRoute } from "@tanstack/react-router";
import { AudiencePage } from "@/components/AudiencePage";

export const Route = createFileRoute("/women")({
  head: () => ({
    meta: [
      { title: "For Women — MrsAnonymous" },
      { name: "description", content: "A private space for women to be heard, on their terms. Anonymous support, resources, and tools." },
      { property: "og:title", content: "For Women — MrsAnonymous" },
      { property: "og:description", content: "A private space for women to be heard, on their terms." },
    ],
  }),
  component: WomenPage,
});

function WomenPage() {
  return <AudiencePage audience="women" />;
}
