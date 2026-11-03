
import React, { useEffect, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import {
  FiX,
  FiUsers,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
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

  const queuePosition =
    peopleAhead === null ? "—" : peopleAhead + 1;

  return (
    <main className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#F0F7FE] via-[#E1EFFB] to-[#D6E8F8] px-3 py-4">

      {/* Compact Success Card */}
      <section className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-white/80 bg-white shadow-[0_12px_35px_rgba(44,78,115,0.12)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9EEF5] px-4 py-3">
          <h1 className="text-base font-bold text-[#101B35]">
            Queue Confirmation
          </h1>

          <Link
            to={`/organizations/${organization._id}`}
            aria-label="Close success page"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#526078] hover:bg-[#F0F5FB]"
          >
            <FiX size={15} />
          </Link>
        </div>

        <div className="p-4">

          {/* Success Message */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#43B85B] text-white shadow-sm">
              <FiCheckCircle size={23} />
            </div>

            <h2 className="mt-2.5 text-base font-bold text-[#101B35]">
              You are in the queue!
            </h2>

            <p className="mt-1 text-[11px] text-[#71809A]">
              Your queue token has been generated successfully.
            </p>
          </div>

          {/* Token Number */}
          <div className="mt-4 rounded-lg bg-[#EAF3FF] px-3 py-3 text-center">
            <p className="text-[11px] font-medium text-[#526B91]">
              Token Number
            </p>

            <p className="mt-1 text-[26px] font-extrabold leading-tight text-[#101B35]">
              {token?.tokenNumber ?? initialToken.tokenNumber}
            </p>
          </div>

          {/* Queue Statistics */}
          <div className="mt-3 grid grid-cols-2 rounded-lg border border-[#E8EEF6] py-2.5">

            <div className="border-r border-[#E7EDF5] px-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#526B91]">
                <FiUsers size={13} className="text-[#1768F2]" />
                <span>Position in Queue</span>
              </div>

              <p className="mt-1.5 text-center text-sm font-bold text-[#101B35]">
                {queuePosition}
              </p>
            </div>

            <div className="px-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#526B91]">
                <FiClock size={13} className="text-[#1768F2]" />
                <span>Waiting Time</span>
              </div>

              <p className="mt-1.5 text-center text-sm font-bold text-[#101B35]">
                {estimatedWait === null
                  ? "Calculating..."
                  : `~${estimatedWait} min`}
              </p>
            </div>

          </div>

          {/* Service Details */}
          <div className="mt-3 rounded-lg border border-[#E8EEF6] bg-[#F8FAFD] px-3 py-2.5">
            <p className="text-[10px] text-[#71809A]">
              Organization
            </p>

            <p className="mt-0.5 text-xs font-semibold text-[#182541]">
              {organization.name}
            </p>

            <p className="mt-2 text-[10px] text-[#71809A]">
              Selected Service
            </p>

            <p className="mt-0.5 text-xs font-medium text-[#526078]">
              {service.name}
            </p>
          </div>

          {/* Dashboard Button */}
          <Link
            to="/dashboard"
            state={{
              token: initialToken,
              service,
              organization,
            }}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#1768F2] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1256CF]"
          >
            View Live Status
          </Link>

          <p className="mt-2 text-center text-[10px] text-[#9AA7B9]">
            Your queue status updates automatically.
          </p>

        </div>
      </section>
    </main>
  );
};

export default QueueSuccess;
