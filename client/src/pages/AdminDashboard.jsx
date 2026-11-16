import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaSync,
  FaPlus,
  FaTimes,
  FaConciergeBell,
  FaUserPlus,
  FaUsers,
  FaEye,
  FaEyeSlash,
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

const initialStaffForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
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

  const [servicesByOrganization, setServicesByOrganization] = useState({});
  const [loadingServices, setLoadingServices] = useState({});

  // Create staff
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffOrganization, setStaffOrganization] = useState(null);
  const [staffForm, setStaffForm] = useState(initialStaffForm);
  const [submittingStaff, setSubmittingStaff] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Assign existing staff
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignOrganization, setAssignOrganization] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Load services for one organization
  const loadServices = async (organizationId) => {
    try {
      setLoadingServices((prev) => ({
        ...prev,
        [organizationId]: true,
      }));

      const response = await api.get(
        `/services/organization/${organizationId}`
      );

      setServicesByOrganization((prev) => ({
        ...prev,
        [organizationId]: response.data.services || [],
      }));
    } catch (err) {
      console.error("Load services error:", err.response || err);

      setServicesByOrganization((prev) => ({
        ...prev,
        [organizationId]: [],
      }));
    } finally {
      setLoadingServices((prev) => ({
        ...prev,
        [organizationId]: false,
      }));
    }
  };

  // Load organizations and their services
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/organizations/assigned");
      const data = response.data.organizations || response.data;
      const organizationList = Array.isArray(data) ? data : [];

      setOrganizations(organizationList);

      await Promise.all(
        organizationList.map((org) =>
          loadServices(org._id || org.id)
        )
      );
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

  // Load staff accounts for dropdown
  const loadStaffMembers = async () => {
    try {
      setLoadingStaff(true);
      setError("");

      const response = await api.get("/users/staff");
      setStaffMembers(response.data.staff || []);
    } catch (err) {
      console.error("Load staff error:", err.response || err);

      setError(
        err.response?.data?.message ||
          "Unable to load staff members."
      );
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  // Organization input handler
  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;

    setOrganizationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create organization
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

  // Open Add Service form
  const openServiceForm = (organization) => {
    setSelectedOrganization(organization);
    setServiceForm(initialServiceForm);

    setShowOrganizationForm(false);
    setShowStaffForm(false);
    setShowAssignForm(false);

    setStaffOrganization(null);
    setAssignOrganization(null);

    setShowStaffPassword(false);
    setError("");
    setSuccess("");
  };

  // Create service
  const handleCreateService = async (e) => {
    e.preventDefault();

    if (!selectedOrganization) return;

    const organizationId =
      selectedOrganization._id || selectedOrganization.id;

    try {
      setSubmittingService(true);
      setError("");
      setSuccess("");

      await api.post("/services", {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim(),
        estimatedDuration: Number(serviceForm.estimatedDuration),
        organizationId,
      });

      const organizationName = selectedOrganization.name;

      setSelectedOrganization(null);
      setServiceForm(initialServiceForm);

      setSuccess(
        `Service created successfully for ${organizationName}.`
      );

      await loadServices(organizationId);
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

  // Open Create Staff form
  const openCreateStaffForm = (organization) => {
    setStaffOrganization(organization);
    setStaffForm(initialStaffForm);
    setShowStaffPassword(false);

    setShowStaffForm(true);
    setShowAssignForm(false);
    setShowOrganizationForm(false);
    setSelectedOrganization(null);

    setAssignOrganization(null);
    setError("");
    setSuccess("");
  };

  // Create staff and assign to organization
  const handleCreateStaff = async (e) => {
    e.preventDefault();

    if (!staffOrganization) return;

    try {
      setSubmittingStaff(true);
      setError("");
      setSuccess("");

      await api.post("/users/staff", {
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        phone: staffForm.phone.trim(),
        password: staffForm.password,
        organizationId:
          staffOrganization._id || staffOrganization.id,
      });

      const organizationName = staffOrganization.name;

      setStaffForm(initialStaffForm);
      setStaffOrganization(null);
      setShowStaffForm(false);
      setShowStaffPassword(false);

      setSuccess(
        `Staff account created and assigned to ${organizationName}.`
      );

      await loadStaffMembers();
    } catch (err) {
      console.error("Create staff error:", err.response || err);

      setError(
        err.response?.data?.message ||
          "Unable to create staff account."
      );
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Open Assign Existing Staff form
  const openAssignStaffForm = async (organization) => {
    setAssignOrganization(organization);
    setSelectedStaffId("");

    setShowAssignForm(true);
    setShowStaffForm(false);
    setShowOrganizationForm(false);
    setSelectedOrganization(null);

    setStaffOrganization(null);
    setShowStaffPassword(false);
    setError("");
    setSuccess("");

    await loadStaffMembers();
  };

  // Assign existing staff
  const handleAssignStaff = async (e) => {
    e.preventDefault();

    if (!assignOrganization || !selectedStaffId) return;

    try {
      setSubmittingAssignment(true);
      setError("");
      setSuccess("");

      const response = await api.patch("/users/staff/assign", {
        staffUserId: selectedStaffId,
        organizationId:
          assignOrganization._id || assignOrganization.id,
      });

      setSuccess(
        response.data.message ||
          `Staff assigned to ${assignOrganization.name} successfully.`
      );

      setSelectedStaffId("");
      setAssignOrganization(null);
      setShowAssignForm(false);
    } catch (err) {
      console.error("Assign staff error:", err.response || err);

      setError(
        err.response?.data?.message ||
          "Unable to assign staff member."
      );
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const activeCount = organizations.filter(
    (org) => org.isActive
  ).length;

  return (
    <main className="min-h-screen bg-[#EAF3FB] px-3 py-3">
      <div className="mx-auto max-w-5xl">
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
              Manage organizations, services, and staff.
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
                setShowOrganizationForm((prev) => !prev);
                setShowStaffForm(false);
                setShowAssignForm(false);
                setSelectedOrganization(null);
                setStaffOrganization(null);
                setAssignOrganization(null);
                setShowStaffPassword(false);
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

        {/* Error message */}
        {error && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
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

        {/* Create Staff Form */}
        {showStaffForm && staffOrganization && (
          <section className="mb-4 rounded-lg border border-green-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#101D3A]">
                  Create Staff
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Organization: {staffOrganization.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowStaffForm(false);
                  setStaffOrganization(null);
                  setShowStaffPassword(false);
                  setError("");
                }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close staff form"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Full Name *
                  </label>

                  <input
                    value={staffForm.name}
                    onChange={(e) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter staff name"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Email *
                  </label>

                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    placeholder="staff@example.com"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Phone number"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                {/* Password with functional eye icon */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Password * (minimum 8 characters)
                  </label>

                  <div className="relative">
                    <input
                      type={showStaffPassword ? "text" : "password"}
                      value={staffForm.password}
                      onChange={(e) =>
                        setStaffForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      minLength={8}
                      placeholder="Create a password"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-xs outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowStaffPassword((prev) => !prev)
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-blue-600"
                      aria-label={
                        showStaffPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      title={
                        showStaffPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showStaffPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffForm(false);
                    setStaffOrganization(null);
                    setShowStaffPassword(false);
                    setError("");
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingStaff}
                  className="rounded-md bg-green-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {submittingStaff ? "Creating..." : "Create & Assign Staff"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Assign Existing Staff Form */}
        {showAssignForm && assignOrganization && (
          <section className="mb-4 rounded-lg border border-indigo-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#101D3A]">
                  Assign Existing Staff
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Organization: {assignOrganization.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAssignForm(false);
                  setAssignOrganization(null);
                  setError("");
                }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close assign staff form"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAssignStaff} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Staff Member *
                </label>

                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  required
                  disabled={loadingStaff || staffMembers.length === 0}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 disabled:bg-slate-50"
                >
                  <option value="">
                    {loadingStaff
                      ? "Loading staff..."
                      : staffMembers.length > 0
                      ? "Select a staff member"
                      : "No staff accounts found"}
                  </option>

                  {staffMembers.map((staff) => (
                    <option
                      key={staff._id || staff.id}
                      value={staff._id || staff.id}
                    >
                      {staff.name} ({staff.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignForm(false);
                    setAssignOrganization(null);
                    setError("");
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submittingAssignment ||
                    loadingStaff ||
                    !selectedStaffId
                  }
                  className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {submittingAssignment ? "Assigning..." : "Assign Staff"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Add Service Form */}
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
              {organizations.map((org) => {
                const organizationId = org._id || org.id;
                const services =
                  servicesByOrganization[organizationId] || [];

                return (
                  <article
                    key={organizationId}
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

                    {/* Existing Services */}
                    <div className="mt-3 border-t border-slate-100 pt-2">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-[11px] font-semibold text-slate-700">
                          Services
                        </h4>

                        <span className="text-[10px] text-slate-500">
                          {services.length}
                        </span>
                      </div>

                      {loadingServices[organizationId] ? (
                        <p className="text-[11px] text-slate-500">
                          Loading services...
                        </p>
                      ) : services.length === 0 ? (
                        <p className="text-[11px] text-slate-500">
                          No services added yet.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {services.map((service) => (
                            <div
                              key={service._id}
                              className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5"
                            >
                              <div className="min-w-0">
                                <p className="break-words text-[11px] font-medium text-slate-800">
                                  {service.name}
                                </p>

                                {service.description && (
                                  <p className="mt-0.5 break-words text-[10px] text-slate-500">
                                    {service.description}
                                  </p>
                                )}
                              </div>

                              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-700">
                                {service.estimatedDuration} min
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Organization Actions */}
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => openServiceForm(org)}
                        disabled={!org.isActive}
                        className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <FaConciergeBell />
                        Add Service
                      </button>

                      <button
                        type="button"
                        onClick={() => openCreateStaffForm(org)}
                        disabled={!org.isActive}
                        className="flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                      >
                        <FaUserPlus />
                        Create Staff
                      </button>

                      <button
                        type="button"
                        onClick={() => openAssignStaffForm(org)}
                        disabled={!org.isActive}
                        className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                      >
                        <FaUsers />
                        Assign Staff
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;