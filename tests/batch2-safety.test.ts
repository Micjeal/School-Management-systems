import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getImplementedProviders } from "@/lib/integrations/providers";

describe("Batch 2 availability guards", () => {
  it("does not advertise an integration provider without a worker adapter", () => {
    expect(getImplementedProviders()).toEqual([]);
  });

  it("does not allow the generic uploader to choose a bucket or upload from the browser", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/forms/file-uploader.tsx"),
      "utf8"
    );

    expect(source).not.toContain("storage.from");
    expect(source).not.toContain("createClient");
    expect(source).toContain("File upload is unavailable");
  });
});
