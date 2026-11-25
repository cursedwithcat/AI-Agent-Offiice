import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const variantClass = {
    text: 'h-4 w-full rounded',
    rectangular: 'h-24 w-full rounded-xl',
    circular: 'w-10 h-10 rounded-full',
  }[variant];

  return <div className={`bg-slate-200 animate-pulse ${variantClass} ${className}`} />;
};

export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3.5 flex-1">
          <Skeleton variant="rectangular" className="w-12 h-12 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-3/4 h-5" />
            <Skeleton variant="text" className="w-1/2 h-3" />
          </div>
        </div>
      </div>
      <Skeleton variant="text" className="w-full h-8" />
      <div className="flex gap-2">
        <Skeleton variant="text" className="w-16 h-6 rounded-md" />
        <Skeleton variant="text" className="w-20 h-6 rounded-md" />
        <Skeleton variant="text" className="w-28 h-6 rounded-md" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <Skeleton variant="text" className="w-32 h-4" />
        <Skeleton variant="text" className="w-28 h-8 rounded-lg" />
      </div>
    </div>
  );
};
