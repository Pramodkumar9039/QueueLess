
import React, { useEffect, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import api from "../api/axios";

const QueueSuccess = () => {
  const location = useLocation();
  const { token: initialToken, service, organization } =
    location.state || {};

  const [token, setToken] = useState(initialToken || null);
  const [peopleAhead, setPeopleAhead] = useState(null);
  const [estimatedWait, setEstimatedWait] = useState(null);

  useEffect(() => {
    if (!initialToken?._id) return;

    let active = true;

    const fetchStatus = async () => {
      try {
        const response = await api.get(
          `/tokens/${initialToken._id}/status`
        );

        if (!active) return;

        const data = response.data;

        setToken((previous) => ({
          ...previous,
          ...data.token,
          _id: data.token?.id || previous?._id,
        }));

        setPeopleAhead(data.peopleAhead ?? 0);
        setEstimatedWait(data.estimatedWaitingMinutes ?? 0);
      } catch (error) {
        console.error("Unable to refresh token status:", error);
      }
    };

    fetchStatus();

    const intervalId = setInterval(fetchStatus, 10000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [initialToken?._id]);

  if (!initialToken || !service || !organization) {
    return <Navigate to="/" replace />;
  }

  // Queue position is people ahead + the customer's own position.
  const queuePosition =
    peopleAhead === null ? "—" : peopleAhead + 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F0F7FE] via-[#E7F2FC] to-[#DCECFB] px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border border-[#E5EEF8] bg-white/70 p-3 shadow-[0_12px_35px_rgba(44,78,115,0.10)]">
          <div className="rounded-xl bg-white p-4 sm:p-5">
            <div className="flex justify-end">
              <Link
                to={`/organizations/${organization._id}`}
                aria-label="Close success page"
                className="flex h-7 w-7 items-center justify-center rounded-full text-xl text-[#263653] hover:bg-[#F1F5FA]"
              >
                ×
              </Link>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#43B85B] text-3xl font-semibold text-white shadow-sm">
                ✓
              </div>

              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-[#101B35]">
                You are in the queue!
              </h1>
            </div>

            <div className="mt-4 rounded-xl bg-[#EAF3FF] px-4 py-3 text-center">
              <p className="text-xs font-medium text-[#526B91]">
                Token Number
              </p>

              <p className="mt-1 text-3xl font-extrabold leading-none text-[#101B35]">
                {token?.tokenNumber ?? initialToken.tokenNumber}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2">
              <div className="border-r border-[#E7EDF5] px-2 py-1">
                <div className="flex items-center justify-center gap-2 text-xs text-[#526B91]">
                  <span className="text-lg text-[#1768F2]">♙</span>
                  <span>Position in Queue</span>
                </div>

                <p className="mt-1 text-center text-base font-bold text-[#101B35]">
                  {queuePosition}
                </p>
              </div>

              <div className="px-2 py-1">
                <div className="flex items-center justify-center gap-2 text-xs text-[#526B91]">
                  <span className="text-lg text-[#1768F2]">◷</span>
                  <span>Estimated Waiting Time</span>
                </div>

                <p className="mt-1 text-center text-base font-bold text-[#101B35]">
                  {estimatedWait === null
                    ? "Calculating..."
                    : `~${estimatedWait} minutes`}
                </p>
              </div>
            </div>

            <Link
              to="/dashboard"
              state={{
                token: initialToken,
                service,
                organization,
              }}
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#1768F2] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1256CF]"
            >
              View Live Status
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default QueueSuccess;
