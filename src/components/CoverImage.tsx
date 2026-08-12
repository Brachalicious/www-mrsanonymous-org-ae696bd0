import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string>();

/** Renders a cover image stored in the private notebook-covers bucket via a signed URL. */
export function CoverImage({ path, className }: { path: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(cache.get(path) || null);

  useEffect(() => {
    let active = true;
    if (cache.has(path)) {
      setUrl(cache.get(path)!);
      return;
    }
    supabase.storage
      .from("notebook-covers")
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (!active || !data?.signedUrl) return;
        cache.set(path, data.signedUrl);
        setUrl(data.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) return null;
  return <img src={url} alt="" aria-hidden="true" className={className} />;
}