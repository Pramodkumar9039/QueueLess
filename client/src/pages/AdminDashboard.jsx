
import { useEffect, useState } from "react";
import { FaBuilding, FaSync, FaPlus, FaTimes } from "react-icons/fa";
import api from "../api/axios";

const initialForm = {
  name: "",
  type: "clinic",
  address: "",
  description: "",
};

const AdminDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      // Load only organizations owned by this admin.
      const response = await api.get("/organizations/assigned");
      const data = response.data.organizations || response.data;

      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load organizations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.post("/organizations", form);

      setForm(initialForm);
      setShowForm(false);
      setSuccess("Organization created successfully.");

      await loadOrganizations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create organization."
      );
    } finally {
      setSubmitting(false);
    }
  };

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

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={loadOrganizations}
              disabled={loading}
              title="Refresh organizations"
              className="rounded-md bg-white p-2 text-xs text-blue-700 shadow-sm hover:bg-blue-50 disabled:opacity-50"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {showForm ? <FaTimes /> : <FaPlus />}
              {showForm ? "Close" : "Create"}
            </button>
          </div>
        </header>

        {/* Messages */}
        {success && (
          <div className="mb-3 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
            {success}
          </div>
        )}

        {/* Create Organization Form */}
        {showForm && (
          <section className="mb-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#101D3A]">
              Create Organization
            </h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. City Care Clinic"
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Organization Type *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="clinic">Clinic</option>
                    <option value="salon">Salon</option>
                    <option value="college">College</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter organization address"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter a short description (optional)"
                  rows={2}
                  className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(initialForm);
                    setError("");
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </section>
        )}

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

          {!showForm && error && (
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
