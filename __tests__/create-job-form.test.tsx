import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JobsPage from "@/app/(app)/jobs/page";
import { api } from "@/lib/client/api";

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("JobsPage Create Job Form component", () => {
  it("displays inline validation error on invalid URL and does not call API", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValue({});
    const user = userEvent.setup();

    renderWithClient(<JobsPage />);

    const urlInput = screen.getByLabelText(/source url/i);
    const submitButton = screen.getByRole("button", { name: /create encode job/i });

    await user.type(urlInput, "not-a-valid-url");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/enter a valid url/i)).toBeInTheDocument();
    });

    expect(postSpy).not.toHaveBeenCalled();
    postSpy.mockRestore();
  });

  it("submits valid form to API and resets input on success", async () => {
    const newJob = {
      id: "j_12345",
      title: "Sample Video",
      sourceUrl: "https://cdn.example.com/videos/sample.mp4",
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
    const postSpy = vi.spyOn(api, "post").mockResolvedValue(newJob);
    const user = userEvent.setup();

    renderWithClient(<JobsPage />);

    const urlInput = screen.getByLabelText(/source url/i);
    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole("button", { name: /create encode job/i });

    await user.type(urlInput, "https://cdn.example.com/videos/sample.mp4");
    await user.type(titleInput, "Sample Video");
    await user.click(submitButton);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/api/jobs", {
        sourceUrl: "https://cdn.example.com/videos/sample.mp4",
        title: "Sample Video",
      });
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("");
      expect(titleInput).toHaveValue("");
    });

    postSpy.mockRestore();
  });
});
