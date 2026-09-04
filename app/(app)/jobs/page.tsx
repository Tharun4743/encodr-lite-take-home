"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, type CreateJobInput } from "@/lib/schemas";
import { useCreateJob, useJobs } from "@/lib/client/hooks";
import { ApiError } from "@/lib/client/api";
import { StatusBadge } from "@/components/status-badge";

export default function JobsPage() {
  const jobs = useJobs();
  const createJob = useCreateJob();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      sourceUrl: "",
      title: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createJob.mutateAsync(values);
      reset({ sourceUrl: "", title: "" });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof CreateJobInput, {
              type: "server",
              message: messages[0],
            });
          }
        }
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to create job");
      }
    }
  });

  const isPending = isSubmitting || createJob.isPending;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Jobs Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Create and monitor your media transcoding jobs.</p>
      </div>

      <section>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Create encode job</h2>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="sourceUrl" className="mb-1 block text-sm font-medium text-neutral-800">
                Source URL <span className="text-red-500">*</span>
              </label>
              <input
                id="sourceUrl"
                {...register("sourceUrl")}
                type="url"
                placeholder="https://cdn.example.com/videos/nature.mp4"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                disabled={isPending}
              />
              {errors.sourceUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.sourceUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-800">
                Title <span className="text-xs font-normal text-neutral-500">(optional — derived from filename if empty)</span>
              </label>
              <input
                id="title"
                {...register("title")}
                type="text"
                placeholder="e.g. Nature Documentary 4K"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                disabled={isPending}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Creating job…" : "Create encode job"}
            </button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Your Jobs</h2>

        {jobs.isLoading && <p className="text-sm text-neutral-500">Loading jobs…</p>}

        {jobs.isError && (
          <div className="text-sm text-red-600">
            Couldn’t load jobs.{" "}
            <button onClick={() => jobs.refetch()} className="underline">
              Retry
            </button>
          </div>
        )}

        {jobs.data?.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
            <p className="text-sm font-medium text-neutral-700">No encode jobs yet</p>
            <p className="mt-1 text-xs text-neutral-500">Create your first encode job above to get started.</p>
          </div>
        )}

        {jobs.data && jobs.data.length > 0 && (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white shadow-xs">
            {jobs.data.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">{job.title}</p>
                    <p className="truncate text-xs text-neutral-500">{job.sourceUrl}</p>
                  </div>
                  <StatusBadge value={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

