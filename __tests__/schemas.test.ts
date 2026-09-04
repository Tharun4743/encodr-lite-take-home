import { describe, expect, it } from "vitest";
import { createJobSchema, sourceUrlSchema } from "@/lib/schemas";

describe("sourceUrlSchema", () => {
  it("accepts valid https and http URLs with a file path", () => {
    expect(sourceUrlSchema.safeParse("https://cdn.example.com/videos/clip.mp4").success).toBe(true);
    expect(sourceUrlSchema.safeParse("http://media.example.com/a/b/movie.mov").success).toBe(true);
    expect(sourceUrlSchema.safeParse("https://storage.googleapis.com/bucket/sample.mkv").success).toBe(true);
  });

  it("rejects empty strings with 'Source URL is required'", () => {
    const result = sourceUrlSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Source URL is required");
    }
  });

  it("rejects malformed non-URL strings", () => {
    const result = sourceUrlSchema.safeParse("not a url");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter a valid URL");
    }
  });

  it("rejects non-http/https protocols", () => {
    const resultFtp = sourceUrlSchema.safeParse("ftp://cdn.example.com/clip.mp4");
    expect(resultFtp.success).toBe(false);
    if (!resultFtp.success) {
      expect(resultFtp.error.issues[0]?.message).toBe("Only http and https URLs are supported");
    }

    const resultFile = sourceUrlSchema.safeParse("file:///Users/video.mp4");
    expect(resultFile.success).toBe(false);
    if (!resultFile.success) {
      expect(resultFile.error.issues[0]?.message).toBe("Only http and https URLs are supported");
    }
  });

  it("rejects URLs with no path to encode", () => {
    const resultRoot = sourceUrlSchema.safeParse("https://cdn.example.com");
    expect(resultRoot.success).toBe(false);
    if (!resultRoot.success) {
      expect(resultRoot.error.issues[0]?.message).toBe("URL must include a file path to encode");
    }

    const resultSlash = sourceUrlSchema.safeParse("https://cdn.example.com/");
    expect(resultSlash.success).toBe(false);
    if (!resultSlash.success) {
      expect(resultSlash.error.issues[0]?.message).toBe("URL must include a file path to encode");
    }
  });
});

describe("createJobSchema", () => {
  it("validates job creation with valid sourceUrl and optional title", () => {
    const validWithTitle = createJobSchema.safeParse({
      sourceUrl: "https://cdn.example.com/videos/clip.mp4",
      title: "My Clip",
    });
    expect(validWithTitle.success).toBe(true);

    const validWithoutTitle = createJobSchema.safeParse({
      sourceUrl: "https://cdn.example.com/videos/clip.mp4",
    });
    expect(validWithoutTitle.success).toBe(true);
  });
});
