
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  "All Places",
  "Clinics",
  "Salons",
  "College Offices",
  "Government",
  "Other",
];

const organizations = [
  {
    id: 1,
    name: "JSS Hospital",
    type: "Clinic",
    description: "Multi-speciality Hospital",
    distance: "1.2 km",
    services: 5,
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    name: "StyleHub Salon",
    type: "Salon",
    description: "Hair & Beauty Services",
    distance: "2.5 km",
    services: 4,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    name: "JSSSTU Academic Office",
    type: "College Office",
    description: "Student Services",
    distance: "0.8 km",
    services: 6,
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 4,
    name: "Mysuru RTO",
    type: "Government",
    description: "Vehicle & License Services",
    distance: "3.1 km",
    services: 4,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=85",
  },
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All Places");
  const [search, setSearch] = useState("");

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((organization) => {
      const matchesCategory =
        activeCategory === "All Places" ||
        organization.type === activeCategory.replace(/s$/, "");

      const matchesSearch =
        organization.name.toLowerCase().includes(search.toLowerCase()) ||
        organization.description.toLowerCase().includes(search.toLowerCase()) ||
        organization.type.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

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
                className="rounded-lg bg-[#1768F2] px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1256CF]"
              >
                Browse Organizations <span className="ml-1">→</span>
              </a>

              <a
                href="#how-it-works"
                className="rounded-lg border border-[#E3EAF3] bg-white px-5 py-3 text-xs font-semibold text-[#263653] transition hover:bg-[#F5F8FC]"
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
                className={`rounded-xl border px-3.5 py-2.5 text-[11px] font-semibold transition ${
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
        <section id="organizations" className="px-5 pb-6 pt-3 sm:px-8">
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
              className="shrink-0 text-xs font-semibold text-[#1768F2] hover:underline"
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredOrganizations.map((organization) => (
              <article
                key={organization.id}
                className="group overflow-hidden rounded-xl border border-[#E5EBF3] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <img
                  src={organization.image}
                  alt={organization.name}
                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />

                <div className="p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#DDF6E5] px-2 py-1 text-[10px] font-semibold text-[#237847]">
                      ● {organization.type}
                    </span>
                    <span className="text-[10px] text-[#71809A]">
                      {organization.distance}
                    </span>
                  </div>

                  <h3 className="truncate text-xs font-bold text-[#111D38] sm:text-sm">
                    {organization.name}
                  </h3>

                  <p className="mt-1 text-[11px] text-[#75839A]">
                    {organization.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-[#52647E]">
                    <span aria-hidden="true">♧</span>
                    <span>{organization.services} services</span>
                  </div>

                  <Link
                    to={`/organizations/${organization.id}`}
                    className="mt-3 block rounded-lg bg-[#1768F2] px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-[#1256CF]"
                  >
                    View Organization
                  </Link>
                </div>
              </article>
            ))}
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
        </section>
      </div>

      <section id="how-it-works" className="mx-auto max-w-[1440px] px-2 py-5">
        <p className="text-center text-xs text-[#71809A]">
          Find a service, join a queue, and track your turn with QueueLess.
        </p>
      </section>
    </main>
  );
};

export default Home;
