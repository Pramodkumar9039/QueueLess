
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiBriefcase,
  FiInfo,
  FiStar,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import api from "../api/axios";

const serviceIcons = {
  clinic: ["✚", "✚", "◉", "♜"],
  salon: ["✂", "◇", "✦", "✂"],
  college: ["▤", "▣", "✎", "▤"],
  other: ["✦", "◇", "◉", "▣"],
};

const OrganizationDetails = () => {
  const { organizationId } = useParams();

  const [organization, setOrganization] = useState(null);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Services");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/organizations");

        const organizations =
          response.data.organizations ||
          response.data.data?.organizations ||
          response.data;

        const selectedOrganization = organizations.find(
          (item) => item._id === organizationId
        );

        if (!selectedOrganization) {
          setError("Organization not found.");
          return;
        }

        setOrganization(selectedOrganization);

        const servicesResponse = await api.get(
          `/services/organization/${organizationId}`
        );

        setServices(servicesResponse.data.services || []);
      } catch (err) {
        console.error("Unable to load organization details:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load organization details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [organizationId]);

  const organizationType = String(
    organization?.type || organization?.category || "other"
  ).toLowerCase();

  const iconCategory =
    organizationType.includes("clinic") ||
    organizationType.includes("hospital")
      ? "clinic"
      : organizationType.includes("salon")
      ? "salon"
      : organizationType.includes("college") ||
        organizationType.includes("university")
      ? "college"
      : "other";

  const icons = serviceIcons[iconCategory];

  const organizationIcon =
    iconCategory === "clinic"
      ? "✚"
      : iconCategory === "salon"
      ? "✂"
      : iconCategory === "college"
      ? "▤"
      : "⌂";

  if (loading) {
    return (
      <main className="w-full min-w-0">
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-[#E5EBF3] bg-white">
          <div className="text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-[#DCEBFF] border-t-[#1768F2]" />
            <p className="mt-3 text-[11px] text-[#52647E]">
              Loading organization details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-w-0">
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-[#E5EBF3] bg-white px-4 text-center">
          <h2 className="text-sm font-bold text-[#182541]">
            Unable to load organization
          </h2>
          <p className="mt-2 text-[11px] text-[#71809A]">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#1768F2] px-3 py-2 text-[11px] text-white"
          >
            <FiArrowLeft />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-w-0 space-y-3">

      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium text-[#71809A]">
            Home / Organizations / Details
          </p>

          <h1 className="mt-1 text-base font-bold text-[#182541]">
            Organization Details
          </h1>

          <p className="mt-1 text-[11px] text-[#71809A]">
            Explore services and join a queue.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#E0EAF5] bg-white px-3 py-2 text-[10px] font-medium text-[#34445F] hover:bg-[#F0F5FC]"
        >
          <FiArrowLeft size={12} />
          Back to Organizations
        </Link>
      </div>

      {/* Organization Card */}
      <div className="overflow-hidden rounded-lg border border-[#E5EBF3] bg-white shadow-sm">

        {/* Banner */}
        <section className="relative h-[160px] overflow-hidden sm:h-[190px]">
          <img
            src={
              organization.image ||
              organization.imageUrl ||
              "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=90"
            }
            alt={`${organization.name} building`}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#101D38]/60 via-transparent to-[#101D38]/10" />

          <div className="absolute bottom-3 left-4">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-[#0759B5]">
              {organization.type || organization.category || "Organization"}
            </span>
          </div>
        </section>

        {/* Organization Information */}
        <section className="relative mx-2.5 -mt-1 rounded-lg border border-[#E8EEF6] bg-white p-3.5 shadow-sm sm:mx-4 sm:p-4">

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FF] text-xl text-[#1768F2]">
                {organizationIcon}
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-[15px] font-bold text-[#111D38]">
                  {organization.name}
                </h2>

                <div className="mt-1 flex items-start gap-1.5 text-[10px] leading-4 text-[#71809A]">
                  <FiMapPin className="mt-0.5 shrink-0 text-[#1768F2]" />
                  <span>
                    {organization.address ||
                      organization.location ||
                      "Address not provided"}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#EAF3FF] px-2.5 py-1.5 text-[9px] font-semibold text-[#0759B5]">
              <FiCheckCircle size={11} />
              QueueLess Enabled
            </span>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-[#65758E]">
            {organization.description ||
              `Explore available services at ${organization.name} and join a queue to save time.`}
          </p>

          {/* Statistics */}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E8EEF6] pt-3 sm:grid-cols-3">

            <div className="rounded-md bg-[#F7FAFE] p-2.5">
              <div className="flex items-center gap-1.5 text-[#1768F2]">
                <FiBriefcase size={12} />
                <span className="text-[10px] text-[#71809A]">Services</span>
              </div>
              <p className="mt-1 text-base font-bold text-[#182541]">
                {services.length}
              </p>
            </div>

            <div className="rounded-md bg-[#F7FAFE] p-2.5">
              <div className="flex items-center gap-1.5 text-[#1768F2]">
                <FiClock size={12} />
                <span className="text-[10px] text-[#71809A]">
                  Queue System
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-[#182541]">
                Real-time
              </p>
            </div>

            <div className="col-span-2 rounded-md bg-[#F7FAFE] p-2.5 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-[#1768F2]">
                <FiCheckCircle size={12} />
                <span className="text-[10px] text-[#71809A]">Platform</span>
              </div>
              <p className="mt-1 text-xs font-bold text-[#182541]">
                QueueLess
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-3 pb-4 pt-4 sm:px-4">

          <div className="flex gap-4 overflow-x-auto border-b border-[#E8EEF6]">
            {[
              { name: "Services", icon: <FiBriefcase size={12} /> },
              { name: "About", icon: <FiInfo size={12} /> },
              { name: "Reviews", icon: <FiStar size={12} /> },
            ].map((tab) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-1.5 pb-2 text-[11px] font-medium transition ${
                  activeTab === tab.name
                    ? "border-[#1768F2] text-[#1768F2]"
                    : "border-transparent text-[#71809A] hover:text-[#1768F2]"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Services Tab */}
          {activeTab === "Services" && (
            <div className="pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[13px] font-bold text-[#111D38]">
                    Available Services
                  </h2>
                  <p className="mt-1 text-[10px] text-[#71809A]">
                    Select a service to join its queue.
                  </p>
                </div>

                <span className="rounded-full bg-[#EAF3FF] px-2.5 py-1 text-[9px] font-semibold text-[#0759B5]">
                  {services.length} Services
                </span>
              </div>

              {services.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {services.map((service, index) => (
                    <article
                      key={service._id}
                      className="group flex flex-col justify-between rounded-lg border border-[#E5EBF3] bg-white p-3 transition hover:border-[#88BDF2] hover:shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EAF3FF] text-lg text-[#1768F2]">
                          {icons[index % icons.length]}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-[#182541]">
                            {service.name}
                          </h3>

                          <p className="mt-1 text-[10px] leading-4 text-[#71809A]">
                            {service.description || "Service available"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#EDF1F6] pt-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F0F5FC] px-2.5 py-1.5 text-[10px] text-[#52647E]">
                          <FiClock size={11} />
                          ~{service.estimatedDuration ?? 15} min
                        </span>

                        <Link
                          to={`/join-queue/${service._id}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#1768F2] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#1256CF]"
                        >
                          Join Queue
                          <FiArrowRight size={11} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-[#D6E3F2] px-4 py-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F5FC] text-lg text-[#1768F2]">
                    <FiBriefcase />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#263653]">
                    No services available yet
                  </p>
                  <p className="mt-1 text-[10px] text-[#71809A]">
                    Services added by this organization will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === "About" && (
            <div className="pt-4">
              <h2 className="text-[13px] font-bold text-[#111D38]">
                About {organization.name}
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-[#65758E]">
                {organization.description ||
                  `Welcome to ${organization.name}. Explore the services offered by this organization and use QueueLess to reduce your waiting time.`}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex gap-2.5 rounded-lg border border-[#E7EDF5] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EAF3FF] text-[#1768F2]">
                    <FiMapPin size={14} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-semibold text-[#182541]">
                      Address
                    </h3>
                    <p className="mt-1 break-words text-[10px] leading-4 text-[#71809A]">
                      {organization.address || "Address not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 rounded-lg border border-[#E7EDF5] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EAF3FF] text-[#1768F2]">
                    <FiBriefcase size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-[#182541]">
                      Organization Type
                    </h3>
                    <p className="mt-1 text-[10px] capitalize text-[#71809A]">
                      {organization.type || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 rounded-lg border border-[#E7EDF5] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EAF3FF] text-[#1768F2]">
                    <FiCheckCircle size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-[#182541]">
                      Available Services
                    </h3>
                    <p className="mt-1 text-[10px] text-[#71809A]">
                      {services.length} service
                      {services.length === 1 ? "" : "s"} available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "Reviews" && (
            <div className="pt-4">
              <h2 className="text-[13px] font-bold text-[#111D38]">
                Customer Reviews
              </h2>

              <p className="mt-1 text-[10px] text-[#71809A]">
                Feedback from people who have visited this organization.
              </p>

              <div className="mt-3 rounded-lg border border-dashed border-[#D6E3F2] px-4 py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F5FC] text-xl text-[#1768F2]">
                  <FiStar />
                </div>

                <h3 className="mt-3 text-xs font-semibold text-[#263653]">
                  No reviews yet
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-[10px] leading-4 text-[#71809A]">
                  Customer ratings and reviews will appear here when the
                  review feature is implemented.
                </p>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
};

export default OrganizationDetails;
