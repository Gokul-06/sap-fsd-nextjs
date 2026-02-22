interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, label: "Requirements" },
  { number: 2, label: "Generating" },
  { number: 3, label: "Results" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-[#0091DA] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCompleted
                    ? "text-emerald-600"
                    : isActive
                    ? "text-[#0091DA]"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`mx-3 mb-5 h-0.5 w-16 sm:w-24 ${
                  step.number < currentStep ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
