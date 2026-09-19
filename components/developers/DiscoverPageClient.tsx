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
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, INTERESTS } from "@/lib/constants";

const filterDefs: FilterDef[] = [
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

  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const values = {
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
      router.push(`/discover?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setDevelopers(null);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (values.role) params.set("role", values.role);
    if (values.experience) params.set("experience", values.experience);
    if (values.availability) params.set("availability", values.availability);
    if (values.interest) params.set("interest", values.interest);
    params.set("page", String(page));

    fetch(`/api/developers?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, values.role, values.experience, values.availability, values.interest, page]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={q}
          onChange={(v) => setParam("q", v)}
          placeholder="Search by name, skill or role..."
          className="sm:max-w-[320px]"
        />
        <FilterPanel filters={filterDefs} values={values} onChange={setParam} />
      </div>

      {!error && developers !== null && (
        <p className="mt-4 text-[13px] text-muted">
          {total} developer{total === 1 ? "" : "s"} found
        </p>
      )}

      <div className="mt-4">
        {error ? (
          <ErrorState onRetry={() => setParam("page", String(page))} />
        ) : developers === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DeveloperCardSkeleton key={i} />
            ))}
          </div>
        ) : developers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No developers found"
            description="Try adjusting your search or filters to find more people."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((dev) => (
                <DeveloperCard key={dev.username} dev={dev} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => setParam("page", String(p))}
            />
          </>
        )}
      </div>
    </div>
  );
}
