import Link from "next/link";

const stats = [
  { value: "14", label: "FSD Sections" },
  { value: "200+", label: "SAP Objects" },
  { value: "10", label: "SAP Modules" },
  { value: "<30s", label: "Generation Time" },
];

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6E] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Generate SAP Specifications in Seconds
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          AI-powered functional specification documents for SAP implementations
        </p>

        {/* Stat Cards */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-white/10 px-4 py-5 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold text-white sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-10">
          <Link
            href="/generate"
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1B2A4A] shadow-sm transition-all hover:bg-white/90 hover:shadow-md"
          >
            Generate New FSD
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
