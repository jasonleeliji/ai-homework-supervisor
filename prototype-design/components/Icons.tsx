
import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ClockIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export const SparklesIcon = () => (
  <svg {...iconProps}><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"></path><path d="M22 2L20 6L16 7L20 8L22 12L24 8L28 7L24 6L22 2Z" transform="translate(-6 -1)"></path><path d="M2 22L4 18L8 17L4 16L2 12L0 16L-4 17L0 18L2 22Z" transform="translate(5 5)"></path></svg>
);

export const CpuChipIcon = () => (
  <svg {...iconProps}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
);

export const UserIcon = () => (
  <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export const InformationCircleIcon = () => (
    <svg {...iconProps}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

export const PlayIcon = () => (
    <svg {...iconProps} className="w-6 h-6"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

export const PauseIcon = () => (
    <svg {...iconProps} className="w-6 h-6"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);

export const StopIcon = () => (
    <svg {...iconProps} className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
);

export const ArrowPathIcon = () => (
    <svg {...iconProps} className="w-6 h-6"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5A10 10 0 0 1 11.5 2H22M22 12.5A10 10 0 0 1 12.5 22H2"></path></svg>
);

export const LogoutIcon = () => (
    <svg {...iconProps} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3.375-3.375l5.25-2.625-5.25-2.625" /></svg>
);