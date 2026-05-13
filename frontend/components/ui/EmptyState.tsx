import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 text-maroon opacity-80">{icon}</div>
      <h3 className="text-2xl font-bold text-maroon-dark mb-2 font-display">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-light transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
};
