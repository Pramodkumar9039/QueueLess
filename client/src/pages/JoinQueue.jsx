
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const JoinQueue = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [service, setService] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [queueId, setQueueId] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // Find the selected service and organization.
        const orgResponse = await api.get("/organizations");
        const organizations =
          orgResponse.data.organizations || orgResponse.data;

        let foundService = null;
        let foundOrganization = null;

        for (const org of organizations) {
          const servicesResponse = await api.get(
            `/services/organization/${org._id}`
          );

          const orgServices = servicesResponse.data.services || [];
          const match = orgServices.find(
            (item) => item._id === serviceId
          );

          if (match) {
            foundService = match;
            foundOrganization = org;
            break;
          }
        }

        if (!foundService) {
          setError("Service not found.");
          return;
        }

        setService(foundService);
        setOrganization(foundOrganization);

        // Retrieve or create the queue for this service.
        const queueResponse = await api.get(
          `/queues/service/${serviceId}`
        );

        const queue =
          queueResponse.data.queue || queueResponse.data;

        if (!queue?._id) {
          setError("Unable to retrieve the queue for this service.");
          return;
        }

        setQueueId(queue._id);
        setEstimatedWait(foundService.estimatedDuration || 15);
        setPeopleAhead(0);
      } catch (err) {
        console.error("Unable to load queue details:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load service and queue details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [serviceId]);

  const handleJoinQueue = async () => {
    if (!token) {
      navigate("/login", {
        state: {
          from: {
            pathname: `/join-queue/${serviceId}`,
          },
        },
      });
      return;
    }

    if (!queueId) {
      setError(
        "Queue information is not ready. Please refresh and try again."
      );
      return;
    }

    try {
      setJoining(true);
      setError("");

      let createdToken;

      // First, check for an existing active token.
      try {
        const existingResponse = await api.get(
          `/tokens/queue/${queueId}/my-active`
        );

        createdToken = existingResponse.data.token;
      } catch (err) {
        // Only create a new token if none exists.
        if (err.response?.status !== 404) {
          throw err;
        }

        const response = await api.post("/tokens", { queueId });
        createdToken = response.data.token;
      }

      if (!createdToken?._id) {
        throw new Error("The server did not return a valid token.");
      }

      navigate("/queue-success", {
        state: {
          token: createdToken,
          service,
          organization,
          queueId,
        },
      });
    } catch (err) {
      console.error("Unable to join queue:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to join the queue. Please try again."
      );
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EAF3FB] flex items-center justify-center p-4">
        <div className="rounded-xl bg-white px-8 py-6 text-sm text-[#52647E] shadow">
          Loading queue details...
        </div>
      </main>
    );
  }

  if (error && (!service || !organization)) {
    return (
      <main className="min-h-screen bg-[#EAF3FB] flex items-center justify-center p-4">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-sm text-red-600">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-600"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F0F7FE] via-[#E1EFFB] to-[#D6E8F8] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_20px_60px_rgba(44,78,115,0.16)]">
          <div className="flex items-center justify-between border-b border-[#E9EEF5] px-6 py-4">
            <h1 className="text-lg font-bold text-[#101B35]">
              Join Queue
            </h1>

            <Link
              to={`/organizations/${organization._id}`}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-[#526078] hover:bg-[#F0F5FB]"
            >
              ×
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  organization.image ||
                  organization.imageUrl ||
                  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=300&q=80"
                }
                alt={organization.name}
                className="h-[88px] w-[96px] shrink-0 rounded-xl border border-[#E6EDF5] object-cover"
              />

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#101B35]">
                  {organization.name}
                </h2>

                <span className="mt-1 inline-flex rounded-full bg-[#EAF3FF] px-2.5 py-1 text-xs font-medium text-[#4779C5]">
                  ♙ {organization.type || "Organization"}
                </span>

                <p className="mt-2 text-sm font-medium text-[#526078]">
                  {service.name}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#EAF3FF] p-4">
              <div>
                <p className="flex items-center gap-2 text-xs text-[#526B91]">
                  <span className="text-lg text-[#1768F2]">◷</span>
                  Estimated Waiting Time
                </p>

                <p className="mt-1 pl-7 text-base font-bold text-[#101B35]">
                  ~{estimatedWait} minutes
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs text-[#526B91]">
                  <span className="text-lg text-[#1768F2]">♙</span>
                  People Ahead
                </p>

                <p className="mt-1 pl-7 text-base font-bold text-[#101B35]">
                  {peopleAhead}
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleJoinQueue}
              disabled={joining || !queueId}
              className="mt-5 w-full rounded-lg bg-[#1768F2] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1256CF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {joining
                ? "Joining Queue..."
                : !queueId
                  ? "Queue Unavailable"
                  : "Join Queue"}
            </button>

            {!token && (
              <p className="mt-3 text-center text-xs text-[#71809A]">
                Please log in before joining the queue.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default JoinQueue;
