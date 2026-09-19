"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users2 } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterPanel, type FilterDef } from "@/components/ui/FilterPanel";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TeamCardSkeleton } from "@/components/ui/Skeleton";
import { TeamCard } from "@/components/teams/TeamCard";
import { PROJECT_TYPES, ROLES, TEAM_STATUS } from "@/lib/constants";
import type { ITeam } from "@/models/Team";

const filterDefs: FilterDef[] = [
  { key: "projectType", label: "Any project type", options: PROJECT_TYPES },
  { key: "role", label: "Any role needed", options: ROLES },
  { key: "status", label: "Any status", options: TEAM_STATUS },
];

type TeamListItem = Pick<
  ITeam,
  "slug" | "name" | "projectTitle" | "description" | "requiredRoles" | "requiredSkills" | "teamSize" | "members" | "projectType" | "deadline" | "status"
>;

export function TeamsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [teams, setTeams] = useState<TeamListItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(false);

  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const values = {
    projectType: searchParams.get("projectType") ?? "",
    role: searchParams.get("role") ?? "",
    status: searchParams.get("status") ?? "",
  };

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`/teams?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setTeams(null);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (values.projectType) params.set("projectType", values.projectType);
    if (values.role) params.set("role", values.role);
    if (values.status) params.set("status", values.status);
    params.set("page", String(page));

    fetch(`/api/teams?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setTeams(json.data.teams);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, values.projectType, values.role, values.status, page]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={q}
          onChange={(v) => setParam("q", v)}
          placeholder="Search teams, tech stack or skills..."
          className="sm:max-w-[320px]"
        />
        <FilterPanel filters={filterDefs} values={values} onChange={setParam} />
      </div>

      {!error && teams !== null && (
        <p className="mt-4 text-[13px] text-muted">
          {total} team{total === 1 ? "" : "s"} found
        </p>
      )}

      <div className="mt-4">
        {error ? (
          <ErrorState onRetry={() => setParam("page", String(page))} />
        ) : teams === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No teams found"
            description="Try different filters, or be the first to create one."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.slug} team={team} />
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
