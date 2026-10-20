
import { useEffect, useState } from "react";
import { FaBuilding, FaSync } from "react-icons/fa";
import api from "../api/axios";

const AdminDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/organizations");
      const data = response.data.organizations || response.data;

      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load organizations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const activeCount = organizations.filter(
    (org) => org.isActive
  ).length;

  return (
    <main className="min-h-screen bg-[#EAF3FB] px-3 py-3">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-blue-600">
              QueueLess Management
            </p>
            <h1 className="text-xl font-bold text-[#101D3A]">
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-600">
              Manage organizations and services.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrganizations}
            disabled={loading}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-white px-2.5 py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-50 disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {/* Statistics */}
        <section className="mb-4 grid grid-cols-2 gap-3">
          <article className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500 sm:text-xs">
                Total Organizations
              </p>
              <FaBuilding className="text-sm text-blue-600" />
            </div>
            <p className="mt-1 text-xl font-bold text-[#101D3A]">
              {organizations.length}
            </p>
          </article>

          <article className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
            <p className="text-[11px] text-slate-500 sm:text-xs">
              Active Organizations
            </p>
            <p className="mt-1 text-xl font-bold text-green-600">
              {activeCount}
            </p>
          </article>
        </section>

        {/* Organization List */}
        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <h2 className="text-sm font-bold text-[#101D3A]">
              Organizations
            </h2>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
              {organizations.length} total
            </span>
          </div>

          {error && (
            <p className="m-3 rounded-md bg-red-50 p-2 text-xs text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="p-5 text-center text-xs text-slate-500">
              Loading organizations...
            </p>
          ) : organizations.length === 0 ? (
            <div className="p-5 text-center">
              <FaBuilding className="mx-auto text-xl text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                No organizations found
              </p>
              <p className="text-xs text-slate-500">
                Create an organization to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2">
              {organizations.map((org) => (
                <article
                  key={org._id || org.id}
                  className="rounded-lg border border-slate-200 p-2.5 transition hover:border-blue-300"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs text-blue-600">
                      <FaBuilding />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-xs font-bold text-[#101D3A] sm:text-sm">
                        {org.name}
                      </h3>
                      <p className="mt-0.5 text-[10px] capitalize text-slate-500">
                        {org.type}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                        org.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {org.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-2 break-words text-[11px] text-slate-600">
                    {org.address}
                  </p>

                  {org.description && (
                    <p className="mt-1 break-words text-[11px] leading-4 text-slate-500">
                      {org.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
