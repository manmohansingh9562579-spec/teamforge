"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterPanel, type FilterDef } from "@/components/ui/FilterPanel";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DeveloperCardSkeleton } from "@/components/ui/Skeleton";
import { DeveloperCard, type DeveloperCardData } from "@/components/developers/DeveloperCard";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, INTERESTS, SUGGESTED_SKILLS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const filterDefs: FilterDef[] = [
  { key: "skill", label: "Any skill", options: SUGGESTED_SKILLS },
  { key: "role", label: "Any role", options: ROLES },
  { key: "experience", label: "Any experience", options: EXPERIENCE_LEVELS },
  { key: "availability", label: "Any availability", options: AVAILABILITY },
  { key: "interest", label: "Any interest", options: INTERESTS },
];

export function DiscoverPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [developers, setDevelopers] = useState<DeveloperCardData[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const q = searchParams.get("q") ?? "";
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const values = {
    skill: searchParams.get("skill") ?? "",
    role: searchParams.get("role") ?? "",
    experience: searchParams.get("experience") ?? "",
    availability: searchParams.get("availability") ?? "",
    interest: searchParams.get("interest") ?? "",
  };

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      const query = params.toString();
      router.push(query ? `/discover?${query}` : "/discover");
    },
    [router, searchParams]
  );

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setDevelopers(null);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (values.skill) params.set("skill", values.skill);
    if (values.role) params.set("role", values.role);
    if (values.experience) params.set("experience", values.experience);
    if (values.availability) params.set("availability", values.availability);
    if (values.interest) params.set("interest", values.interest);
    params.set("page", String(page));

    fetch(`/api/developers?${params.toString()}`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load developers");
        return response.json();
      })
      .then((json) => {
        if (cancelled) return;
        setDevelopers(json.data.developers);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
  }, [q, values.skill, values.role, values.experience, values.availability, values.interest, page, retryKey]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={q}
          onChange={(value) => setParam("q", value)}
          placeholder="Search names, skills or roles"
          className="sm:max-w-[360px]"
        />
        <FilterPanel
          filters={filterDefs}
          values={values}
          onChange={setParam}
          onClear={() => router.push("/discover")}
        />
      </div>

      {!error && developers !== null && (
        <p aria-live="polite" className="mt-5 text-sm text-muted">
          {total} developer{total === 1 ? "" : "s"} found
        </p>
      )}

      <div className="mt-5">
        {error ? (
          <ErrorState onRetry={() => setRetryKey((value) => value + 1)} />
        ) : developers === null ? (
          <div aria-label="Loading developers" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <DeveloperCardSkeleton key={index} />)}
          </div>
        ) : developers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No developers found"
            description="Try another name or skill, or clear the filters to see everyone."
            action={<Button variant="secondary" onClick={() => router.push("/discover")}>Clear search and filters</Button>}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((developer) => <DeveloperCard key={developer.username} dev={developer} />)}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(nextPage) => setParam("page", String(nextPage))}
            />
          </>
        )}
      </div>
    </div>
  );
}
