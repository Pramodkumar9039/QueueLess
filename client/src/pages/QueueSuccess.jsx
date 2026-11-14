
import { useEffect, useState } from "react";
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
    <main className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#FFFFFF] via-[#FFFFFF] to-[#FFFFFF] px-3 py-4">

      {/* Compact Success Card */}
      <section className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-white/80 bg-white shadow-[0_12px_35px_rgba(44,78,115,0.12)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D1D1D1] px-4 py-3">
          <h1 className="text-base font-bold text-[#141619]">
            Queue Confirmation
          </h1>

          <Link
            to={`/organizations/${organization._id}`}
            aria-label="Close success page"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#141619] hover:bg-[#F3F3F3]"
          >
            <FiX size={15} />
          </Link>
        </div>

        <div className="p-4">

          {/* Success Message */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141619] text-white shadow-sm">
              <FiCheckCircle size={23} />
            </div>

            <h2 className="mt-2.5 text-base font-bold text-[#141619]">
              You are in the queue!
            </h2>

            <p className="mt-1 text-[11px] text-[#141619]">
              Your queue token has been generated successfully.
            </p>
          </div>

          {/* Token Number */}
          <div className="mt-4 rounded-lg bg-[#FFFFFF] px-3 py-3 text-center">
            <p className="text-[11px] font-medium text-[#141619]">
              Token Number
            </p>

            <p className="mt-1 text-[26px] font-extrabold leading-tight text-[#141619]">
              {token?.tokenNumber ?? initialToken.tokenNumber}
            </p>
          </div>

          {/* Queue Statistics */}
          <div className="mt-3 grid grid-cols-2 rounded-lg border border-[#D1D1D1] py-2.5">

            <div className="border-r border-[#D1D1D1] px-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#141619]">
                <FiUsers size={13} className="text-[#141619]" />
                <span>Position in Queue</span>
              </div>

              <p className="mt-1.5 text-center text-sm font-bold text-[#141619]">
                {queuePosition}
              </p>
            </div>

            <div className="px-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#141619]">
                <FiClock size={13} className="text-[#141619]" />
                <span>Waiting Time</span>
              </div>

              <p className="mt-1.5 text-center text-sm font-bold text-[#141619]">
                {estimatedWait === null
                  ? "Calculating..."
                  : `~${estimatedWait} min`}
              </p>
            </div>

          </div>

          {/* Service Details */}
          <div className="mt-3 rounded-lg border border-[#D1D1D1] bg-[#FFFFFF] px-3 py-2.5">
            <p className="text-[10px] text-[#141619]">
              Organization
            </p>

            <p className="mt-0.5 text-xs font-semibold text-[#141619]">
              {organization.name}
            </p>

            <p className="mt-2 text-[10px] text-[#141619]">
              Selected Service
            </p>

            <p className="mt-0.5 text-xs font-medium text-[#141619]">
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
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#141619] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#141619]"
          >
            View Live Status
          </Link>

          <p className="mt-2 text-center text-[10px] text-[#141619]">
            Your queue status updates automatically.
          </p>

        </div>
      </section>
    </main>
  );
};

export default QueueSuccess;
