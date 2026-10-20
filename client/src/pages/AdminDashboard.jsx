
import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaSync,
  FaPlus,
  FaTimes,
  FaConciergeBell,
} from "react-icons/fa";
import api from "../api/axios";

const initialOrganizationForm = {
  name: "",
  type: "college",
  address: "",
  description: "",
};

const initialServiceForm = {
  name: "",
  description: "",
  estimatedDuration: "5",
};

const AdminDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [organizationForm, setOrganizationForm] = useState(
    initialOrganizationForm
  );
  const [submittingOrganization, setSubmittingOrganization] = useState(false);

  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [submittingService, setSubmittingService] = useState(false);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/organizations/assigned");
      const data = response.data.organizations || response.data;

      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load organizations error:", err.response || err);
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

  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;

    setOrganizationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();

    try {
      setSubmittingOrganization(true);
      setError("");
      setSuccess("");

      await api.post("/organizations", organizationForm);

      setOrganizationForm(initialOrganizationForm);
      setShowOrganizationForm(false);
      setSuccess("Organization created successfully.");

      await loadOrganizations();
    } catch (err) {
      console.error("Create organization error:", err.response || err);
      setError(
        err.response?.data?.message ||
          "Unable to create organization."
      );
    } finally {
      setSubmittingOrganization(false);
    }
  };

  const openServiceForm = (organization) => {
    setSelectedOrganization(organization);
    setServiceForm(initialServiceForm);
    setShowOrganizationForm(false);
    setError("");
    setSuccess("");
  };

  const handleCreateService = async (e) => {
    e.preventDefault();

    if (!selectedOrganization) return;

    try {
      setSubmittingService(true);
      setError("");
      setSuccess("");

      await api.post("/services", {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim(),
        estimatedDuration: Number(serviceForm.estimatedDuration),
        organizationId: selectedOrganization._id || selectedOrganization.id,
      });

      setSelectedOrganization(null);
      setServiceForm(initialServiceForm);
      setSuccess(
        `Service created successfully for ${selectedOrganization.name}.`
      );
    } catch (err) {
      console.error("Create service error:", err.response || err);
      setError(
        err.response?.data?.message ||
          "Unable to create service."
      );
    } finally {
      setSubmittingService(false);
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
                setShowOrganizationForm(!showOrganizationForm);
                setSelectedOrganization(null);
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {showOrganizationForm ? <FaTimes /> : <FaPlus />}
              {showOrganizationForm ? "Close" : "Create"}
            </button>
          </div>
        </header>

        {/* Success message */}
        {success && (
          <div className="mb-3 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
            {success}
          </div>
        )}

        {/* Create Organization Form */}
        {showOrganizationForm && (
          <section className="mb-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#101D3A]">
              Create Organization
            </h2>

            <form
              onSubmit={handleCreateOrganization}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Organization Name *
                  </label>
                  <input
                    name="name"
                    value={organizationForm.name}
                    onChange={handleOrganizationChange}
                    required
                    placeholder="Enter organization name"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Organization Type *
                  </label>
                  <select
                    name="type"
                    value={organizationForm.type}
                    onChange={handleOrganizationChange}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
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
                  name="address"
                  value={organizationForm.address}
                  onChange={handleOrganizationChange}
                  required
                  placeholder="Enter address"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={organizationForm.description}
                  onChange={handleOrganizationChange}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrganizationForm(false)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrganization}
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {submittingOrganization ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Create Service Form */}
        {selectedOrganization && (
          <section className="mb-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#101D3A]">
                  Add Service
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Organization: {selectedOrganization.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrganization(null);
                  setError("");
                }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close service form"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Service Name *
                </label>
                <input
                  name="name"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  placeholder="e.g. Marks Card Collection"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Describe this service"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Estimated Duration (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  name="estimatedDuration"
                  value={serviceForm.estimatedDuration}
                  onChange={(e) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      estimatedDuration: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrganization(null)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingService}
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {submittingService ? "Adding..." : "Add Service"}
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

          {!showOrganizationForm && !selectedOrganization && error && (
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

                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => openServiceForm(org)}
                      className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      <FaConciergeBell />
                      Add Service
                    </button>
                  </div>
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
