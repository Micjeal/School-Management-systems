import { Card, CardContent } from "@/components/ui/card";

/**
 * Uploads stay unavailable until a domain workflow supplies server-side
 * authorization, metadata creation, and matching private Storage policies.
 * This component intentionally performs no browser-directed bucket upload.
 */
export function FileUploader() {
  return (
    <Card>
      <CardContent className="p-4 text-sm text-slate-600">
        File upload is unavailable. Uploads will be enabled from their owning workflow after the
        private Storage policies and metadata transaction are verified.
      </CardContent>
    </Card>
  );
}
