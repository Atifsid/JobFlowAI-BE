import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import type { Dashboard } from "../types";

export default function SearchPage() {
  const [title, setTitle] = useState("");
  const [remote, setRemote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Dashboard | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const dashboard = await api.searchJobs({ title, remote });
      setResult(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Search Jobs</h1>
      <form onSubmit={onSubmit}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Job title (required)"
          required
        />
        <label>
          <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} />
          Remote only
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {result && (
        <p>
          Found {result.total} new job(s) - {result.referral} referral, {result.directApply} direct
          apply, {result.skip} skipped.
        </p>
      )}
    </div>
  );
}
