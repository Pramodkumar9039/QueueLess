
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
          response.data.organizations || response.data;

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

        setServices(
          servicesResponse.data.services || []
        );
      } catch (err) {
        console.error("Unable to load organization details:", err);
        setError(
          "Unable to load organization details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [organizationId]);

  const organizationType = organization?.type || "other";

  const icons =
    serviceIcons[organizationType] || serviceIcons.other;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EAF3FB] px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center text-sm text-[#52647E] shadow-sm">
          Loading organization details...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#EAF3FB] px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-[#182541]">
            {error}
          </p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-[#1768F2] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAF3FB] px-3 pb-8 pt-4 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#E3ECF6] bg-white shadow-sm">
        {/* Organization banner */}
        <section className="relative h-48 overflow-hidden sm:h-64">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=90"
            alt={`${organization.name} building`}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#13233D]/30 to-transparent" />

          <Link
            to="/"
            className="absolute left-4 top-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#182541] shadow-sm transition hover:bg-[#F2F6FC]"
          >
            ← Back
          </Link>
        </section>

        {/* Organization information */}
        <section className="relative -mt-6 mx-3 rounded-2xl border border-[#E8EEF6] bg-white p-4 shadow-sm sm:mx-5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-2xl text-[#1768F2]">
                {organizationType === "clinic"
                  ? "✚"
                  : organizationType === "salon"
                    ? "✂"
                    : organizationType === "college"
                      ? "▤"
                      : "⌂"}
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-bold text-[#111D38] sm:text-xl">
                  {organization.name}
                </h1>

                <p className="mt-1 text-xs text-[#71809A]">
                  {organization.address}
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-[#DDF6E5] px-3 py-1.5 text-[10px] font-semibold text-[#237847]">
              ● Open Now
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-[#65758E]">
            {organization.description ||
              `Explore available services at ${organization.name} and join a queue to save time.`}
          </p>
        </section>

        {/* Services, About and Reviews tabs */}
        <section className="px-4 pb-6 pt-5 sm:px-6">
          <div className="flex gap-6 border-b border-[#E8EEF6]">
            {["Services", "About", "Reviews"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-3 pb-3 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "border-[#1768F2] text-[#1768F2]"
                    : "border-transparent text-[#71809A] hover:text-[#1768F2]"
                }`}
              >
                {tab === "Services" && "♧ "}
                {tab === "About" && "ⓘ "}
                {tab === "Reviews" && "☆ "}
                {tab}
              </button>
            ))}
          </div>

          {/* Services tab */}
          {activeTab === "Services" && (
            <div className="pt-5">
              <h2 className="text-lg font-bold text-[#111D38]">
                Available Services
              </h2>

              <p className="mt-1 text-xs text-[#71809A]">
                Select a service to join its queue.
              </p>

              {services.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {services.map((service, index) => (
                    <article
                      key={service._id}
                      className="flex flex-col gap-3 rounded-xl border border-[#E7EDF5] bg-white p-3 shadow-sm transition hover:border-[#BDDDFC] hover:shadow-md sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-xl text-[#1768F2]">
                          {icons[index % icons.length]}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#182541]">
                            {service.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#71809A]">
                            {service.description ||
                              "Service available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="whitespace-nowrap rounded-full bg-[#F0F5FC] px-2.5 py-1.5 text-[10px] font-medium text-[#52647E]">
                          ~{service.estimatedDuration ?? 15} min
                        </span>

                        <Link
                          to={`/join-queue/${service._id}`}
                          className="whitespace-nowrap rounded-lg bg-[#1768F2] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1256CF]"
                        >
                          Join Queue
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-[#D6E3F2] px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-[#263653]">
                    No services available yet
                  </p>

                  <p className="mt-2 text-xs text-[#71809A]">
                    Services added by this organization will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* About tab */}
          {activeTab === "About" && (
            <div className="pt-5">
              <h2 className="text-lg font-bold text-[#111D38]">
                About {organization.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#65758E]">
                {organization.description ||
                  `Welcome to ${organization.name}. Explore the services offered by this organization and use QueueLess to reduce your waiting time.`}
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3 rounded-xl border border-[#E7EDF5] p-4">
                  <span className="text-lg">📍</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#182541]">
                      Address
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#71809A]">
                      {organization.address || "Address not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-[#E7EDF5] p-4">
                  <span className="text-lg">🏢</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#182541]">
                      Organization type
                    </h3>
                    <p className="mt-1 text-xs capitalize text-[#71809A]">
                      {organization.type || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-[#E7EDF5] p-4">
                  <span className="text-lg">🩺</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#182541]">
                      Available services
                    </h3>
                    <p className="mt-1 text-xs text-[#71809A]">
                      {services.length} service
                      {services.length === 1 ? "" : "s"} available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === "Reviews" && (
            <div className="pt-5">
              <h2 className="text-lg font-bold text-[#111D38]">
                Customer Reviews
              </h2>

              <p className="mt-1 text-xs text-[#71809A]">
                Feedback from people who have visited this organization.
              </p>

              <div className="mt-5 rounded-xl border border-dashed border-[#D6E3F2] px-4 py-12 text-center">
                <div className="text-3xl">☆</div>

                <h3 className="mt-3 text-sm font-semibold text-[#263653]">
                  No reviews yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#71809A]">
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
