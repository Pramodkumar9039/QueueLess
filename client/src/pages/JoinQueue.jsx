
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiX,
  FiMapPin,
  FiClock,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const JoinQueue = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [service, setService] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [queueId, setQueueId] = useState(null);
  const [queueStatus, setQueueStatus] = useState("");
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // Fetch latest queue status.
  const refreshQueueStatus = useCallback(async () => {
    if (!serviceId) return;

    try {
      const response = await api.get(
        `/queues/service/${serviceId}`
      );

      const queue =
        response.data.queue ||
        response.data.data?.queue ||
        response.data;

      if (queue?._id || queue?.id) {
        setQueueId(queue._id || queue.id);
        setQueueStatus(
          String(queue.status || "open").toLowerCase()
        );
      }
    } catch (err) {
      console.error("Unable to refresh queue status:", err);
    }
  }, [serviceId]);

  // Fetch organization, service and queue details.
  useEffect(() => {
    let cancelled = false;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const orgResponse = await api.get("/organizations");

        const organizations =
          orgResponse.data.organizations ||
          orgResponse.data.data?.organizations ||
          orgResponse.data;

        let foundService = null;
        let foundOrganization = null;

        for (const org of organizations) {
          const servicesResponse = await api.get(
            `/services/organization/${org._id}`
          );

          const orgServices =
            servicesResponse.data.services ||
            servicesResponse.data;

          const match = orgServices.find(
            (item) => String(item._id || item.id) === serviceId
          );

          if (match) {
            foundService = match;
            foundOrganization = org;
            break;
          }
        }

        if (cancelled) return;

        if (!foundService) {
          setError("Service not found.");
          return;
        }

        setService(foundService);
        setOrganization(foundOrganization);
        setEstimatedWait(foundService.estimatedDuration || 15);

        const queueResponse = await api.get(
          `/queues/service/${serviceId}`
        );

        if (cancelled) return;

        const queue =
          queueResponse.data.queue ||
          queueResponse.data.data?.queue ||
          queueResponse.data;

        if (!queue?._id && !queue?.id) {
          setError("Unable to retrieve the queue for this service.");
          return;
        }

        setQueueId(queue._id || queue.id);
        setQueueStatus(
          String(queue.status || "open").toLowerCase()
        );
        setPeopleAhead(0);
      } catch (err) {
        if (!cancelled) {
          console.error("Unable to load queue details:", err);

          setError(
            err.response?.data?.message ||
              "Unable to load service and queue details."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  // Keep queue status updated every 5 seconds.
  useEffect(() => {
    if (!serviceId || loading) return undefined;

    const intervalId = setInterval(() => {
      refreshQueueStatus();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [serviceId, loading, refreshQueueStatus]);

  // Join queue.
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

      // Refresh status before joining.
      const queueResponse = await api.get(
        `/queues/service/${serviceId}`
      );

      const latestQueue =
        queueResponse.data.queue ||
        queueResponse.data.data?.queue ||
        queueResponse.data;

      const latestStatus = String(
        latestQueue.status || "open"
      ).toLowerCase();

      setQueueStatus(latestStatus);

      if (latestStatus === "paused") {
        setError(
          "This queue is temporarily paused. Please try again later."
        );
        return;
      }

      if (latestStatus !== "open") {
        setError("This queue is currently unavailable.");
        return;
      }

      let createdToken;

      // Check for an existing active token.
      try {
        const existingResponse = await api.get(
          `/tokens/queue/${queueId}/my-active`
        );

        createdToken = existingResponse.data.token;
      } catch (err) {
        if (err.response?.status !== 404) {
          throw err;
        }

        const response = await api.post("/tokens", { queueId });
        createdToken = response.data.token;
      }

      if (!createdToken?._id && !createdToken?.id) {
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

  const isPaused = queueStatus === "paused";
  const isClosed = queueStatus === "closed";
  const isUnavailable = !queueId || isPaused || isClosed;

  const organizationImage =
    organization?.image ||
    organization?.imageUrl ||
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=300&q=80";

  // Loading state.
  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center rounded-xl bg-[#EAF3FB] p-4">
        <div className="rounded-xl bg-white px-8 py-6 text-sm text-[#52647E] shadow-sm">
          Loading queue details...
        </div>
      </main>
    );
  }

  // Error state.
  if (error && (!service || !organization)) {
    return (
      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center rounded-xl bg-[#EAF3FB] p-4">
        <div className="rounded-xl border border-[#E5EBF3] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>

          <Link
            to="/"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#F0F7FE] via-[#E1EFFB] to-[#D6E8F8] px-3 py-6 sm:px-5">

      {/* Join Queue Card */}
      <div className="mx-auto w-full max-w-[500px]">

        <section className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_20px_60px_rgba(44,78,115,0.16)]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E9EEF5] px-5 py-3.5 sm:px-6">
            <h1 className="text-lg font-bold text-[#101B35]">
              Join Queue
            </h1>

            <Link
              to={`/organizations/${organization._id}`}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-[#526078] transition hover:bg-[#F0F5FB]"
            >
              <FiX size={17} />
            </Link>
          </div>

          <div className="p-5 sm:p-6">

            {/* Organization Details */}
            <div className="flex items-center gap-4">
              <img
                src={organizationImage}
                alt={organization.name}
                className="h-[88px] w-[104px] shrink-0 rounded-xl border border-[#E6EDF5] object-cover"
              />

              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-6 text-[#101B35]">
                  {organization.name}
                </h2>

                <span className="mt-1 inline-flex rounded-full bg-[#EAF3FF] px-2.5 py-1 text-xs font-medium text-[#4779C5]">
                  <FiMapPin className="mr-1 mt-0.5" size={11} />
                  {organization.type || "Organization"}
                </span>

                <p className="mt-2 text-sm font-medium text-[#526078]">
                  {service.name}
                </p>
              </div>
            </div>

            {/* Queue Status */}
            {isPaused && (
              <div
                role="status"
                className="mt-5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800"
              >
                <FiAlertCircle size={15} />
                Queue is temporarily paused.
              </div>
            )}

            {isClosed && (
              <div
                role="status"
                className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
              >
                <FiAlertCircle size={15} />
                Queue is currently closed.
              </div>
            )}

            {queueStatus === "open" && (
              <div
                role="status"
                className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                Queue is open and accepting customers.
              </div>
            )}

            {/* Queue Statistics */}
            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#EAF3FF] p-4 sm:p-5">

              <div>
                <p className="flex items-center gap-2 text-xs text-[#526B91]">
                  <FiClock size={16} className="text-[#1768F2]" />
                  Estimated Waiting Time
                </p>

                <p className="mt-2 pl-6 text-base font-bold text-[#101B35]">
                  ~{estimatedWait} minutes
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs text-[#526B91]">
                  <FiUsers size={16} className="text-[#1768F2]" />
                  People Ahead
                </p>

                <p className="mt-2 pl-6 text-base font-bold text-[#101B35]">
                  {peopleAhead}
                </p>
              </div>

            </div>

            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* Join Button */}
            <button
              type="button"
              onClick={handleJoinQueue}
              disabled={joining || isUnavailable}
              className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isUnavailable
                  ? "bg-gray-400"
                  : "cursor-pointer bg-[#1768F2] hover:bg-[#1256CF]"
              }`}
            >
              {joining
                ? "Joining Queue..."
                : isPaused
                ? "Queue Paused"
                : isClosed
                ? "Queue Closed"
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
