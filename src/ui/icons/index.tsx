import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const defaultProps: Required<Pick<IconProps, 'size' | 'color' | 'strokeWidth'>> = {
  size: 20,
  color: 'currentColor',
  strokeWidth: 1.5,
};

/* ── Divine / Thematic ── */

export const DivinePowerIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L14.5 8.5L21 9.5L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.5L9.5 8.5L12 2Z" />
  </svg>
);

export const TempleIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21H21" />
    <path d="M5 21V11" />
    <path d="M19 21V11" />
    <path d="M9 21V15H15V21" />
    <path d="M3 11L12 4L21 11" />
    <path d="M8 11V14" />
    <path d="M16 11V14" />
  </svg>
);

export const FollowersIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="7" r="3" />
    <path d="M3 21V18C3 15.8 4.8 14 7 14H11C13.2 14 15 15.8 15 18V21" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M21 21V19C21 17.3 19.7 16 18 16H16.5" />
  </svg>
);

export const PrayerIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3C12 3 8 7 8 12C8 14.5 9.5 16 12 16C14.5 16 16 14.5 16 12C16 7 12 3 12 3Z" />
    <path d="M12 16V21" />
    <path d="M8 19H16" />
    <path d="M6 8L4 6" />
    <path d="M18 8L20 6" />
  </svg>
);

export const LightningIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L3 7V12C3 17.5 7.2 22 12 22C16.8 22 21 17.5 21 12V7L12 2Z" />
  </svg>
);

export const SwordIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 17.5L3 6V3H6L17.5 14.5" />
    <path d="M13 19L19 13" />
    <path d="M16 16L21 21" />
    <path d="M8 8L5 11" />
  </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 18L5 10L9 14L12 6L15 14L19 10L21 18H3Z" />
    <path d="M3 18H21V20H3V18Z" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ScrollIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2H16C17.1 2 18 2.9 18 4V18C18 20.2 16.2 22 14 22H8C6.9 22 6 21.1 6 20V4C6 2.9 6.9 2 8 2Z" />
    <path d="M18 18C18 20.2 19.3 22 21 22" />
    <path d="M10 7H14" />
    <path d="M10 11H14" />
    <path d="M10 15H12" />
  </svg>
);

export const MapIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" />
    <path d="M9 3V18" />
    <path d="M15 6V21" />
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5C4 18.1 5.1 17 6.5 17H20" />
    <path d="M6.5 2H20V22H6.5C5.1 22 4 20.9 4 19.5V4.5C4 3.1 5.1 2 6.5 2Z" />
    <path d="M8 7H16" />
    <path d="M8 11H14" />
  </svg>
);

/* ── UI / System ── */

export const SendIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7H21" />
    <path d="M3 12H21" />
    <path d="M3 17H21" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18" />
    <path d="M6 6L18 18" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9L12 15L18 9" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6L9 17L4 12" />
  </svg>
);

export const AlertIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 9V13" />
    <circle cx="12" cy="16" r="0.5" fill={color} />
    <path d="M10.3 3.2L1.7 18C1.1 19 1.8 20.3 3 20.3H21C22.2 20.3 22.9 19 22.3 18L13.7 3.2C13.1 2.2 11 2.2 10.3 3.2Z" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 2V8H15" />
    <path d="M3 22V16H9" />
    <path d="M21 8C19.4 4.9 16 3 12 3C6.5 3 2 7.5 2 13" />
    <path d="M3 16C4.6 19.1 8 21 12 21C17.5 21 22 16.5 22 11" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21L16.65 16.65" />
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15C21 15.5 20.8 16 20.4 16.4C20 16.8 19.5 17 19 17H7L3 21V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V15Z" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2V6" />
    <path d="M8 2V6" />
    <path d="M3 10H21" />
  </svg>
);

export const ShowIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const HideIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.9 17.9C16.2 19.3 14.2 20 12 20C5 20 2 12 2 12C3.4 9.1 5.5 6.8 8.1 5.4" />
    <path d="M9.9 4.2C10.6 4.1 11.3 4 12 4C19 4 22 12 22 12C21.4 13.1 20.7 14.2 19.8 15.1" />
    <path d="M14.1 14.1C13.5 14.7 12.8 15 12 15C10.3 15 9 13.7 9 12C9 11.2 9.3 10.5 9.9 9.9" />
    <path d="M2 2L22 22" />
  </svg>
);

export const LoaderIcon: React.FC<IconProps> = ({ size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);
