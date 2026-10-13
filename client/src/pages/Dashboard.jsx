import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const {
    token: initialToken,
    service,
    organization,
    queueId: navigationQueueId,
  } = location.state || {};

  const [tokenData, setTokenData] = useState(initialToken || null);
  const [peopleAhead, setPeopleAhead] = useState(null);
  const [estimatedWait, setEstimatedWait] = useState(null);
  const [queueTokens, setQueueTokens] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialToken?._id || initialToken?.id));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshInProgress = useRef(false);

  const tokenId = initialToken?._id || initialToken?.id;

  const currentQueueId =
    navigationQueueId ||
    (typeof tokenData?.queue === "string"
      ? tokenData.queue
      : tokenData?.queue?._id || tokenData?.queue?.id) ||
    tokenData?.queueId;

  // Fetch the customer's latest token status.
  const fetchStatus = useCallback(async () => {
    if (!tokenId) return;

    const response = await api.get(`/tokens/${tokenId}/status`);
    const data = response.data;
    const updatedToken = data.token;

    if (updatedToken) {
      setTokenData((previous) => ({
        ...previous,
        ...updatedToken,
        _id: updatedToken._id || updatedToken.id || previous?._id || tokenId,
        queue:
          data.queue?._id ||
          data.queue?.id ||
          data.queue ||
          updatedToken.queue ||
          previous?.queue ||
          navigationQueueId,
      }));
    }

    setPeopleAhead(data.peopleAhead ?? 0);
    setEstimatedWait(data.estimatedWaitingMinutes ?? 0);
  }, [tokenId, navigationQueueId]);

  // Fetch the latest tokens from the same queue.
  const fetchQueueTokens = useCallback(async () => {
    if (!currentQueueId) {
      setQueueTokens([]);
      return;
    }

    const response = await api.get(
      `/tokens/queue/${currentQueueId}/tokens`
    );

    setQueueTokens(response.data.tokens || []);
  }, [currentQueueId]);

  // Refresh both the personal status and the queue list.
  const refreshDashboard = useCallback(
    async (showErrors = true) => {
      if (refreshInProgress.current) return;

      refreshInProgress.current = true;
      setRefreshing(true);

      try {
        const results = await Promise.allSettled([
          fetchStatus(),
          fetchQueueTokens(),
        ]);

        const failedRequest = results.find(
          (result) => result.status === "rejected"
        );

        if (failedRequest) {
          console.error(
            "Unable to refresh customer dashboard:",
            failedRequest.reason
          );

          if (showErrors) {
            setError(
              failedRequest.reason?.response?.data?.message ||
                "Unable to refresh your queue information."
            );
          }
        } else {
          setError("");
          setLastUpdated(new Date());
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        refreshInProgress.current = false;
      }
    },
    [fetchStatus, fetchQueueTokens]
  );

  // Initial load and automatic refresh every 10 seconds.
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      await refreshDashboard(false);
    };

    refresh();

    const intervalId = setInterval(refresh, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isAuthenticated, refreshDashboard]);

  // Redirect users who are not logged in.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: { pathname: "/dashboard" } }}
        replace
      />
    );
  }

  // No token selected yet.
  if (!tokenData && !loading) {
    return (
      <main className="min-h-screen bg-[#EAF3FB] px-3 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-[#E0EAF5] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#182541]">
            No selected queue
          </h1>

          <p className="mt-3 text-sm text-[#71809A]">
            Open an organization, select a service, and join its queue to
            view your live status.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block cursor-pointer rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Explore Organizations
          </Link>
        </div>
      </main>
    );
  }

  const status = tokenData?.status || "waiting";
  const position = peopleAhead === null ? "—" : peopleAhead + 1;

  const joinedAt = tokenData?.joinedAt
    ? new Date(tokenData.joinedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const joinedDate = tokenData?.joinedAt
    ? new Date(tokenData.joinedAt).toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const progress =
    status === "completed" ? 100 : status === "serving" ? 60 : 15;

  const statusStyles = {
    waiting: "bg-slate-100 text-slate-600",
    serving: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  const handleRefresh = () => refreshDashboard(true);

  return (
    <main className="min-h-screen bg-[#EAF3FB] px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard heading */}
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              QueueLess Customer Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-[#182541]">
              My Queue Status
            </h1>

            <p className="mt-1 text-xs text-[#71809A]">
              Welcome, {user?.name || "Customer"}
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-[#71809A]">
            Loading your queue status...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* LEFT PANEL */}
            <section className="rounded-2xl border border-[#E0EAF5] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#182541]">
                  My Queue Status
                </h2>

                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Live
                </span>
              </div>

              {/* Organization and service */}
              <div className="flex items-center gap-3 rounded-xl bg-[#EAF3FF] p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-xl text-blue-600">
                  {organization?.type === "clinic" ? "✚" : "⌂"}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-[#182541]">
                    {organization?.name || "Your Organization"}
                  </h3>

                  <p className="mt-1 truncate text-xs text-[#71809A]">
                    {service?.name || "Selected Service"}
                  </p>
                </div>
              </div>

              {/* Token details */}
              <div className="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col items-center">
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-[5px] border-[#E0ECFF] bg-white shadow-sm">
                    <span className="text-[10px] text-[#71809A]">
                      Token Number
                    </span>

                    <span className="mt-1 text-3xl font-extrabold text-[#182541]">
                      {tokenData?.tokenNumber ?? "—"}
                    </span>

                    <span className="mt-1 text-[10px] text-[#71809A]">
                      Position in Queue
                    </span>

                    <span className="text-xs font-bold text-[#182541]">
                      {position}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-blue-600 shadow-sm">
                      ◷
                    </div>

                    <div>
                      <p className="text-[11px] text-[#71809A]">
                        Estimated Waiting Time
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#182541]">
                        {status === "completed"
                          ? "Completed"
                          : status === "serving"
                            ? "You are being served"
                            : estimatedWait === null
                              ? "Calculating..."
                              : `~${estimatedWait} minutes`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-blue-600 shadow-sm">
                      ♙
                    </div>

                    <div>
                      <p className="text-[11px] text-[#71809A]">
                        People Ahead
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#182541]">
                        {status === "serving" || status === "completed"
                          ? 0
                          : peopleAhead ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-blue-600 shadow-sm">
                      ▦
                    </div>

                    <div>
                      <p className="text-[11px] text-[#71809A]">Joined At</p>

                      <p className="mt-1 text-xs font-semibold text-[#182541]">
                        {joinedAt}
                      </p>

                      <p className="text-[10px] text-[#71809A]">
                        {joinedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Queue progress tracker */}
              <div className="mt-7 px-2">
                <div className="relative h-1.5 rounded-full bg-[#E1EAF5]">
                  <div
                    className="absolute left-0 top-0 h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />

                  {[
                    { left: "0%", key: "waiting" },
                    { left: "50%", key: "serving" },
                    { left: "100%", key: "completed" },
                  ].map((step) => {
                    const reached =
                      status === "completed" ||
                      (status === "serving" && step.key !== "completed") ||
                      (status === "waiting" && step.key === "waiting");

                    return (
                      <div
                        key={step.key}
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: step.left }}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[9px] text-white shadow-sm ${
                            reached ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        >
                          {step.key === status ? "●" : reached ? "✓" : "○"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-between text-[10px] font-medium text-[#71809A]">
                  <span>Waiting</span>
                  <span>Serving</span>
                  <span>Completed</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? "Refreshing..." : "Refresh Status"}
                </button>

                <Link
                  to="/"
                  className="cursor-pointer rounded-lg border border-[#D8E4F2] bg-white px-4 py-2 text-xs font-semibold text-[#52647E] transition hover:bg-[#F4F8FD]"
                >
                  Explore Organizations
                </Link>
              </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="rounded-2xl border border-[#E0EAF5] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#182541]">
                    Live Queue Updates
                  </h2>

                  <p className="mt-1 text-[10px] text-[#71809A]">
                    Live status of tokens in this queue
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="cursor-pointer whitespace-nowrap text-xs font-semibold text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ↻ {refreshing ? "Refreshing" : "Refresh"}
                </button>
              </div>

              <div className="space-y-2">
                {queueTokens.length === 0 ? (
                  <div className="rounded-xl border border-[#E8EEF6] bg-[#F8FAFD] p-4 text-center">
                    <p className="text-sm font-semibold text-[#263653]">
                      No queue tokens found
                    </p>

                    <p className="mt-1 text-xs text-[#71809A]">
                      Queue tokens will appear here when available.
                    </p>
                  </div>
                ) : (
                  queueTokens.map((item) => {
                    const isMyToken =
                      String(item._id || item.id) ===
                      String(tokenData?._id || tokenData?.id);

                    return (
                      <div
                        key={item._id || item.id}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                          isMyToken
                            ? "border-blue-200 bg-blue-50"
                            : "border-[#E8EEF6] bg-white"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-[#182541]">
                            A{String(item.tokenNumber).padStart(2, "0")}
                          </p>

                          {isMyToken && (
                            <p className="mt-1 text-[10px] font-medium text-blue-600">
                              Your Token
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold capitalize ${
                            isMyToken
                              ? "bg-blue-100 text-blue-700"
                              : statusStyles[item.status] ||
                                "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isMyToken ? status : item.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <p className="mt-4 text-[10px] leading-5 text-[#71809A]">
                Queue information refreshes automatically every 10 seconds.
              </p>

              {lastUpdated && (
                <p className="mt-1 text-[10px] text-[#71809A]">
                  Last updated:{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;