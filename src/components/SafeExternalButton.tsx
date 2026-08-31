import { useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { openResourceAndLeave } from "@/lib/safe-open";

type Props = {
  url: string;
  children: ReactNode;
  className?: string;
  /** Short name of the resource, shown in the confirmation. */
  label?: string;
};

/**
 * A button that asks permission before sending the user to an outside
 * resource. If they allow it, the resource opens in a new tab and this tab
 * is replaced with Google for the user's protection.
 */
export function SafeExternalButton({ url, children, className, label }: Props) {
  const [asking, setAsking] = useState(false);

  return (
    <>
      <button
        type="button"
        data-bypass-go="1"
        onClick={() => setAsking(true)}
        className={className ?? "btn-ghost w-full py-2 text-xs"}
      >
        <ExternalLink className="h-3.5 w-3.5" /> {children}
      </button>

      {asking && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-5 text-center shadow-2xl">
            <h2 className="font-serif text-lg text-ink-900">
              Open {label ?? "this resource"} in a new tab?
            </h2>
            <p className="mt-2 text-xs text-ink-600">
              It opens in a separate tab so you can call, text or chat with them.
              For your protection, this tab will switch to Google, so MrsANONymous
              is no longer on screen here.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                data-bypass-go="1"
                onClick={() => openResourceAndLeave(url)}
                className="btn-rose text-xs"
              >
                Allow &amp; open
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
