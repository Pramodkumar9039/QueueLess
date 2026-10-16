
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBuilding, FaChevronDown, FaClock } from "react-icons/fa";
import api from "../api/axios";

const StaffDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [services, setServices] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [activeTab, setActiveTab] = useState("waiting");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const serviceIdRef = useRef("");
  const refreshInProgress = useRef(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    serviceIdRef.current = serviceId;
  }, [serviceId]);

  const normalizeTokens = (data) => {
    const list = Array.isArray(data)
      ? data
      : data?.tokens || data?.data?.tokens || [];

    return list.map((token) => ({
      ...token,
      status: String(token.status || "").toLowerCase(),
    }));
  };

    const loadOrganizations = useCallback(async () => {
    try {
      setError('');

      const response = await api.get('/organizations/assigned');
      const data = response.data.organizations || response.data;
      const assignedOrganizations = Array.isArray(data) ? data : [];

      setOrganizations(assignedOrganizations);

      // Automatically select the first assigned organization.
      setOrganizationId((currentId) => {
        const stillAssigned = assignedOrganizations.some(
          (org) => (org._id || org.id) === currentId
        );

        return stillAssigned
          ? currentId
          : assignedOrganizations.length > 0
            ? assignedOrganizations[0]._id || assignedOrganizations[0].id
            : '';
      });
    } catch (err) {
      setOrganizations([]);
      setOrganizationId('');
      setError(
        err.response?.data?.message ||
          'Unable to load your assigned organizations.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    let cancelled = false;

    const loadServices = async () => {
      if (!organizationId) {
        setServices([]);
        setServiceId("");
        setQueue(null);
        setTokens([]);
        return;
      }

      try {
        setError("");
        const response = await api.get(
          `/services/organization/${organizationId}`
        );

        if (!cancelled) {
          const data = response.data.services || response.data;
          setServices(Array.isArray(data) ? data : []);
          setServiceId("");
        }
      } catch (err) {
        if (!cancelled) {
          setServices([]);
          setError(
            err.response?.data?.message || "Unable to load services."
          );
        }
      }
    };

    loadServices();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const loadQueue = useCallback(async (silent = false) => {
    const selectedServiceId = serviceIdRef.current;

    if (!selectedServiceId) {
      setQueue(null);
      setTokens([]);
      return;
    }

    if (silent && refreshInProgress.current) return;

    if (silent) refreshInProgress.current = true;

    const requestId = ++latestRequest.current;

    try {
      if (!silent) setError("");

      const queueResponse = await api.get(
        `/queues/service/${selectedServiceId}`
      );

      const queueData =
        queueResponse.data.queue ||
        queueResponse.data.data?.queue ||
        queueResponse.data;

      if (!queueData?._id && !queueData?.id) {
        throw new Error("The queue API did not return a queue ID.");
      }

      if (
        serviceIdRef.current !== selectedServiceId ||
        requestId !== latestRequest.current
      ) {
        return;
      }

      const queueId = queueData._id || queueData.id;
      setQueue(queueData);

      const tokenResponse = await api.get(
        `/tokens/queue/${queueId}/tokens`
      );

      if (
        serviceIdRef.current !== selectedServiceId ||
        requestId !== latestRequest.current
      ) {
        return;
      }

      setTokens(normalizeTokens(tokenResponse.data));
    } catch (err) {
      if (
        serviceIdRef.current === selectedServiceId &&
        requestId === latestRequest.current &&
        !silent
      ) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load queue tokens."
        );
      }
    } finally {
      if (silent) refreshInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    if (!serviceId) {
      latestRequest.current++;
      setQueue(null);
      setTokens([]);
      setError("");
      setNotice("");
      return;
    }

    loadQueue();
  }, [serviceId, loadQueue]);

  useEffect(() => {
    if (!serviceId) return undefined;

    const intervalId = setInterval(() => {
      loadQueue(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [serviceId, loadQueue]);

  const current = tokens.find((item) => item.status === "serving");

  const waiting = tokens
    .filter((item) => item.status === "waiting")
    .sort((a, b) => Number(a.tokenNumber) - Number(b.tokenNumber));

  const serving = tokens.filter((item) => item.status === "serving");

  const completed = tokens
    .filter((item) => item.status === "completed")
    .sort((a, b) => Number(b.tokenNumber) - Number(a.tokenNumber));

  const next = waiting[0];

  const callNext = async () => {
    const queueId = queue?._id || queue?.id;

    if (!queueId) {
      setError("Select an organization and service first.");
      return;
    }

    if (queue.status !== "open") {
      setError("Resume the queue before calling the next customer.");
      return;
    }

    if (current) {
      setError("Complete the current customer before calling the next.");
      return;
    }

    if (!next) {
      setError("There are no waiting customers in this queue.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setNotice("");

      const response = await api.post(
        `/tokens/queue/${queueId}/call-next`
      );

      await loadQueue();

      const calledToken = response.data.token;

      setNotice(
        calledToken
          ? `Token #${calledToken.tokenNumber} is now being served.`
          : "The next customer has been called."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to call the next customer."
      );
    } finally {
      setBusy(false);
    }
  };

  const completeCustomer = async () => {
    const servingToken = tokens.find(
      (item) => item.status === "serving"
    );

    if (!servingToken?._id && !servingToken?.id) {
      setError("No serving customer was found. Refresh the queue and try again.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setNotice("");

      const tokenId = servingToken._id || servingToken.id;
      await api.patch(`/tokens/${tokenId}/complete`);
      await loadQueue();

      setNotice(`Token #${servingToken.tokenNumber} has been completed.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete the customer."
      );
    } finally {
      setBusy(false);
    }
  };

  // Pause or resume the selected queue.
  const toggleQueueStatus = async () => {
    if (!serviceId || !queue) {
      setError("Select an organization and service first.");
      return;
    }

    if (queue.status === "closed") {
      setError("This queue is closed and cannot be resumed.");
      return;
    }

    const newStatus =
      queue.status === "paused" ? "open" : "paused";

    try {
      setBusy(true);
      setError("");
      setNotice("");

      const response = await api.patch(
        `/queues/service/${serviceId}/status`,
        { status: newStatus }
      );

      await loadQueue();

      setNotice(
        response.data.message ||
          (newStatus === "paused"
            ? "Queue paused successfully."
            : "Queue resumed successfully.")
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update queue status."
      );
    } finally {
      setBusy(false);
    }
  };

  const visibleTokens =
    activeTab === "waiting"
      ? waiting
      : activeTab === "serving"
        ? serving
        : completed;

  const tokenLabel = (token) =>
    token ? `A${String(token.tokenNumber).padStart(2, "0")}` : "—";

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const waitTime = (token) => {
    if (!token?.joinedAt) return "—";

    const minutes = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(token.joinedAt).getTime()) / 60000
      )
    );

    return `${minutes} min`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EAF3FB] px-3 pb-6 pt-3 text-center text-sm text-[#52647E] sm:px-5">
        Loading Staff Dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAF3FB] px-3 pb-6 pt-3 sm:px-5">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-[#101D3A] sm:text-xl">
            Staff Dashboard
          </h1>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1768F2] text-sm font-bold text-white shadow-sm">
            S
          </div>
        </header>

        {/* Organization and service selectors */}
        <section className="mb-4 grid max-w-[600px] grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#263653]">
              Organization
            </label>

            <div className="relative">
              <FaBuilding className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#1768F2]" />

              <select
                value={organizationId}
                onChange={(event) =>
                  setOrganizationId(event.target.value)
                }
                className="w-full cursor-pointer appearance-none rounded-lg border border-[#E0E9F4] bg-white py-2.5 pl-8 pr-8 text-xs text-[#263653] outline-none transition focus:border-[#88BDF2] focus:ring-2 focus:ring-[#BDDDFC]"
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org._id || org.id} value={org._id || org.id}>
                    {org.name}
                  </option>
                ))}
              </select>

              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#71809A]" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#263653]">
              Service
            </label>

            <div className="relative">
              <select
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                disabled={!organizationId}
                className="w-full cursor-pointer appearance-none rounded-lg border border-[#E0E9F4] bg-white py-2.5 pl-3 pr-8 text-xs text-[#263653] outline-none transition focus:border-[#88BDF2] focus:ring-2 focus:ring-[#BDDDFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option
                    key={service._id || service.id}
                    value={service._id || service.id}
                  >
                    {service.name}
                  </option>
                ))}
              </select>

              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#71809A]" />
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-3 rounded-lg bg-green-50 px-3 py-2.5 text-xs text-green-700">
            {notice}
          </div>
        )}

        {/* Current and next customer cards */}
        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-[#D7EFDD] bg-gradient-to-br from-[#E1F6E6] to-[#D5F0DD] p-4">
            <h2 className="text-center text-xs font-bold text-[#263653]">
              Current Customer
            </h2>

            <p className="mt-3 text-center text-3xl font-extrabold leading-none text-[#101D3A]">
              {tokenLabel(current)}
            </p>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#526B91]">
              <FaClock className="text-[10px]" />
              {current ? waitTime(current) : "No active customer"}
            </p>

            <button
              type="button"
              onClick={completeCustomer}
              disabled={busy || !current}
              className="mt-3 w-full cursor-pointer rounded-lg bg-[#1768F2] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1256CF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Please wait..." : "Complete"}
            </button>
          </article>

          <article className="rounded-xl border border-[#E0E8F2] bg-gradient-to-br from-[#F5F8FD] to-[#EAF1F9] p-4">
            <h2 className="text-center text-xs font-bold text-[#263653]">
              Next in Queue
            </h2>

            <p className="mt-3 text-center text-3xl font-extrabold leading-none text-[#101D3A]">
              {tokenLabel(next)}
            </p>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#526B91]">
              <FaClock className="text-[10px]" />
              {next ? waitTime(next) : "No waiting customer"}
            </p>

            <button
              type="button"
              onClick={callNext}
              disabled={
                busy ||
                !queue ||
                queue.status !== "open" ||
                Boolean(current) ||
                !next
              }
              className="mt-3 w-full cursor-pointer rounded-lg bg-[#C9DDFB] py-2.5 text-xs font-semibold text-[#174E9C] transition hover:bg-[#B8D1F8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Please wait..." : "Call Next"}
            </button>
          </article>
        </section>

        {/* Queue tabs and table */}
        <section className="overflow-hidden rounded-xl border border-[#DCE7F4] bg-white shadow-sm">
          <div className="flex items-center gap-5 border-b border-[#E5ECF5] px-3 pt-3 sm:gap-6">
            {[
              { id: "waiting", label: "Waiting", count: waiting.length },
              { id: "serving", label: "Serving", count: serving.length },
              { id: "completed", label: "Completed", count: completed.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer border-b-2 pb-2.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "border-[#1768F2] text-[#1768F2]"
                    : "border-transparent text-[#71809A] hover:text-[#1768F2]"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-[#F7F9FC] text-[11px] text-[#71809A]">
                <tr>
                  <th className="px-3 py-3 font-semibold">#</th>
                  <th className="px-3 py-3 font-semibold">Token</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Joined At</th>
                  <th className="px-3 py-3 font-semibold">Wait Time</th>
                  <th className="px-3 py-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EDF1F7] text-xs text-[#263653]">
                {visibleTokens.map((item, index) => (
                  <tr
                    key={item._id || item.id}
                    className="transition hover:bg-[#F8FBFF]"
                  >
                    <td className="px-3 py-3">{index + 1}</td>

                    <td className="px-3 py-3 font-bold">
                      {tokenLabel(item)}
                    </td>

                    <td className="px-3 py-3">
                      {item.customer?.name || "Customer"}
                    </td>

                    <td className="px-3 py-3">
                      {formatTime(item.joinedAt || item.createdAt)}
                    </td>

                    <td className="px-3 py-3">{waitTime(item)}</td>

                    <td className="px-3 py-3 text-right">
                      {item.status === "waiting" ? (
                        <button
                          type="button"
                          disabled={
                            busy ||
                            Boolean(current) ||
                            queue?.status !== "open"
                          }
                          onClick={callNext}
                          className="cursor-pointer rounded-md bg-[#1768F2] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#1256CF] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Call
                        </button>
                      ) : (
                        <span className="capitalize text-[#71809A]">
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {visibleTokens.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center">
                      <p className="text-xs font-medium text-[#52647E]">
                        {!serviceId
                          ? "Select an organization and service"
                          : "No customers in this section"}
                      </p>

                      <p className="mt-1 text-[11px] text-[#8A98AD]">
                        Queue updates will appear here when token data is
                        available.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Queue footer with Pause/Resume controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF1F7] px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8A98AD]">
                Queue:
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  queue?.status === "paused"
                    ? "bg-amber-100 text-amber-700"
                    : queue?.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {queue?.status || "Not selected"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleQueueStatus}
                disabled={
                  !serviceId ||
                  !queue ||
                  busy ||
                  queue.status === "closed"
                }
                className={`cursor-pointer rounded-md px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  queue?.status === "paused"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {queue?.status === "paused"
                  ? "Resume Queue"
                  : "Pause Queue"}
              </button>

              <button
                type="button"
                onClick={() => loadQueue(false)}
                disabled={!serviceId || busy}
                className="cursor-pointer rounded-md px-3 py-2 text-xs font-semibold text-[#1768F2] transition hover:bg-[#EFF6FF] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default StaffDashboard;
