
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const categories = [
  "All Places",
  "Clinics",
  "Salons",
  "College Offices",
  "Government",
  "Other",
];

const organizationImages = {
  clinic:
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=700&q=85",
  hospital:
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=700&q=85",
  salon:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=85",
  college:
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=85",
  government:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=85",
  other:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85",
};

const getOrganizationType = (organization) => {
  const type = String(
    organization.type ||
      organization.category ||
      organization.organizationType ||
      "Other"
  ).toLowerCase();

  if (
    type.includes("clinic") ||
    type.includes("hospital") ||
    type.includes("health")
  ) {
    return "Clinics";
  }

  if (type.includes("salon") || type.includes("beauty")) {
    return "Salons";
  }

  if (
    type.includes("college") ||
    type.includes("university") ||
    type.includes("academic")
  ) {
    return "College Offices";
  }

  if (
    type.includes("government") ||
    type.includes("govt") ||
    type.includes("rto")
  ) {
    return "Government";
  }

  return "Other";
};

const getOrganizationImage = (organization) => {
  if (organization.image || organization.imageUrl) {
    return organization.image || organization.imageUrl;
  }

  const type = getOrganizationType(organization);

  if (type === "Clinics") {
    return organizationImages.clinic;
  }

  if (type === "Salons") {
    return organizationImages.salon;
  }

  if (type === "College Offices") {
    return organizationImages.college;
  }

  if (type === "Government") {
    return organizationImages.government;
  }

  return organizationImages.other;
};

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All Places");
  const [search, setSearch] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [serviceCounts, setServiceCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch actual organizations from the backend.
  useEffect(() => {
    let cancelled = false;

    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/organizations");

        const data =
          response.data.organizations ||
          response.data.data?.organizations ||
          response.data;

        if (!Array.isArray(data)) {
          throw new Error("The server returned an invalid organization list.");
        }

        if (cancelled) return;

        setOrganizations(data);

        // If the API includes services, use them to show the service count.
        const counts = {};

        data.forEach((organization) => {
          const id = organization._id || organization.id;

          if (Array.isArray(organization.services)) {
            counts[id] = organization.services.length;
          }
        });

        setServiceCounts(counts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load organizations. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter real organizations by category and search.
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((organization) => {
      const type = getOrganizationType(organization);

      const matchesCategory =
        activeCategory === "All Places" || type === activeCategory;

      const name = String(organization.name || "");
      const description = String(
        organization.description ||
          organization.address ||
          organization.location ||
          ""
      );

      const matchesSearch = [
        name,
        description,
        type,
      ].some((value) =>
        value.toLowerCase().includes(search.trim().toLowerCase())
      );

      return matchesCategory && matchesSearch;
    });
  }, [organizations, activeCategory, search]);

  return (
    <main className="min-h-screen bg-[#EAF3FB] px-3 pb-6 pt-3 sm:px-5">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Hero */}
        <section className="relative grid min-h-[300px] overflow-hidden bg-gradient-to-r from-[#F7FAFE] via-[#EDF5FC] to-[#DCEAF8] md:grid-cols-2">
          <div className="z-10 flex flex-col justify-center px-6 py-9 sm:px-10 md:py-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#7188A6]">
              Smart Queue Management
            </p>

            <h1 className="max-w-[440px] text-4xl font-extrabold leading-[1.08] tracking-tight text-[#101D3A] sm:text-5xl">
              Skip the line,
              <br />
              Save your time
            </h1>

            <p className="mt-4 max-w-[400px] text-xs leading-5 text-[#405574] sm:text-sm">
              Join queues for clinics, salons, college offices and more.
              <br className="hidden sm:block" />
              Get real-time updates and be notified when it’s your turn.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#organizations"
                className="cursor-pointer rounded-lg bg-[#1768F2] px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1256CF]"
              >
                Browse Organizations <span className="ml-1">→</span>
              </a>

              <a
                href="#how-it-works"
                className="cursor-pointer rounded-lg border border-[#E3EAF3] bg-white px-5 py-3 text-xs font-semibold text-[#263653] transition hover:bg-[#F5F8FC]"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="relative min-h-[210px] md:min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=90"
              alt="Modern healthcare facility"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#EDF5FC] via-[#EDF5FC]/30 to-transparent" />

            <div className="absolute right-5 top-8 w-[105px] rounded-xl bg-[#192A42] p-3 text-white shadow-xl sm:right-10 sm:top-10">
              <p className="text-center text-[9px] text-blue-100">
                Now Serving
              </p>

              <p className="my-1 text-center text-3xl font-bold">A12</p>

              <div className="space-y-1 text-[10px] text-blue-100">
                <p className="rounded bg-white/10 px-2 py-1">A11</p>
                <p className="rounded bg-white/10 px-2 py-1">A10</p>
                <p className="rounded bg-white/10 px-2 py-1">A09</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-5 pb-4 pt-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`cursor-pointer rounded-xl border px-3.5 py-2.5 text-[11px] font-semibold transition ${
                  activeCategory === category
                    ? "border-[#1768F2] bg-[#1768F2] text-white shadow-sm"
                    : "border-[#E7EDF5] bg-white text-[#263653] hover:border-[#BDDDFC] hover:bg-[#F5F9FF]"
                }`}
              >
                <span className="mr-1.5">
                  {category === "All Places"
                    ? "♧"
                    : category === "Clinics"
                      ? "✚"
                      : category === "Salons"
                        ? "♙"
                        : category === "College Offices"
                          ? "▤"
                          : category === "Government"
                            ? "♜"
                            : "◇"}
                </span>
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Organization cards */}
        <section
          id="organizations"
          className="scroll-mt-4 px-5 pb-6 pt-3 sm:px-8"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-[#111D38] sm:text-xl">
              Popular Organizations
            </h2>

            <button
              type="button"
              onClick={() => {
                setActiveCategory("All Places");
                setSearch("");
              }}
              className="shrink-0 cursor-pointer text-xs font-semibold text-[#1768F2] hover:underline"
            >
              View All <span className="ml-1">→</span>
            </button>
          </div>

          <div className="mb-4">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search organizations..."
              className="w-full rounded-lg border border-[#E3EAF3] bg-[#F8FAFD] px-4 py-2.5 text-sm outline-none transition focus:border-[#88BDF2] sm:max-w-sm"
              aria-label="Search organizations"
            />
          </div>

          {loading && (
            <div className="py-10 text-center text-sm text-[#71809A]">
              Loading organizations...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-red-700">
                Unable to load organizations
              </p>
              <p className="mt-1 text-xs text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 cursor-pointer rounded-lg bg-[#1768F2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1256CF]"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredOrganizations.map((organization) => {
                  const organizationId =
                    organization._id || organization.id;

                  const type = getOrganizationType(organization);

                  const description =
                    organization.description ||
                    organization.address ||
                    organization.location ||
                    "Explore available services";

                  const serviceCount =
                    serviceCounts[organizationId] ??
                    (typeof organization.services === "number"
                      ? organization.services
                      : null);

                  return (
                    <article
                      key={organizationId}
                      className="group overflow-hidden rounded-xl border border-[#E5EBF3] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <img
                        src={getOrganizationImage(organization)}
                        alt={organization.name || "Organization"}
                        className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />

                      <div className="p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="rounded-full bg-[#DDF6E5] px-2 py-1 text-[10px] font-semibold text-[#237847]">
                            ● {type}
                          </span>
                        </div>

                        <h3 className="truncate text-xs font-bold text-[#111D38] sm:text-sm">
                          {organization.name}
                        </h3>

                        <p className="mt-1 line-clamp-2 min-h-8 text-[11px] text-[#75839A]">
                          {description}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#52647E]">
                          <span aria-hidden="true">♧</span>
                          <span>
                            {serviceCount === null
                              ? "View available services"
                              : `${serviceCount} services`}
                          </span>
                        </div>

                        <Link
                          to={`/organizations/${organizationId}`}
                          className="mt-3 block cursor-pointer rounded-lg bg-[#1768F2] px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-[#1256CF]"
                        >
                          View Organization
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredOrganizations.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#C9D8EA] py-10 text-center">
                  <p className="font-semibold text-[#263653]">
                    No organizations found
                  </p>

                  <p className="mt-1 text-sm text-[#71809A]">
                    Try another search or category.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <section
        id="how-it-works"
        className="mx-auto max-w-[1440px] scroll-mt-4 px-2 py-5"
      >
        <p className="text-center text-xs text-[#71809A]">
          Find a service, join a queue, and track your turn with QueueLess.
        </p>
      </section>
    </main>
  );
};

export default Home;
