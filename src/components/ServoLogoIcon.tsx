import React from 'react';

interface ServoLogoIconProps {
  className?: string;
  size?: number;
}

export const ServoLogoIcon: React.FC<ServoLogoIconProps> = ({
  className = 'w-8 h-8',
  size,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="SERVO Logo"
    >
      <defs>
        {/* Gradients to match the exact high-res SERVO brand colors */}
        <linearGradient id="servoRoyalBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0055B3" />
          <stop offset="100%" stopColor="#00418A" />
        </linearGradient>

        <linearGradient id="servoCyanSwoosh" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00A2C7" />
          <stop offset="100%" stopColor="#00C9EA" />
        </linearGradient>

        <linearGradient id="servoArrowBright" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF7000" />
          <stop offset="50%" stopColor="#FF8500" />
          <stop offset="100%" stopColor="#FFA31A" />
        </linearGradient>

        <linearGradient id="servoArrowDark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DE4B00" />
          <stop offset="100%" stopColor="#F56600" />
        </linearGradient>
      </defs>

      {/* 1. Top Cyan Roof Arc Orbit */}
      <path
        d="M 48 16.5 C 57.5 10.5 68 13.5 73.5 21.5 C 67 16 57.5 14 48 18.5 Z"
        fill="url(#servoCyanSwoosh)"
      />

      {/* 2. House Silhouette (Chimney, Gable Roof, Walls) */}
      <g fill="url(#servoRoyalBlue)">
        {/* Chimney on Left Roof */}
        <path d="M 37.5 24 L 37.5 31 L 43 26.5 L 43 24 Z" />

        {/* Main House Body with Roof Overhang */}
        <path
          d="M 49 19 
             L 69 39 
             L 64 39 
             L 64 43.5 
             L 67 43.5 
             L 64 46.5 
             L 64 69 
             L 36 69 
             L 36 46.5 
             L 33 43.5 
             L 36 43.5 
             L 32 39 
             L 49 19 Z"
        />
      </g>

      {/* 3. Gear / Cogwheel (White cutout in the center of the house) */}
      <g fill="#FFFFFF">
        {/* Main gear round body */}
        <circle cx="49" cy="51" r="14.5" />

        {/* 8 Gear Teeth radiating out */}
        {/* Top & Bottom */}
        <rect x="46.5" y="34.5" width="5" height="4.5" rx="0.8" />
        <rect x="46.5" y="63" width="5" height="4.5" rx="0.8" />
        {/* Left & Right */}
        <rect x="32.5" y="48.5" width="4.5" height="5" rx="0.8" />
        <rect x="61" y="48.5" width="4.5" height="5" rx="0.8" />
        {/* Diagonals */}
        <rect x="36.5" y="38.5" width="4.5" height="4.5" rx="0.8" transform="rotate(45 38.75 40.75)" />
        <rect x="57" y="38.5" width="4.5" height="4.5" rx="0.8" transform="rotate(45 59.25 40.75)" />
        <rect x="36.5" y="59" width="4.5" height="4.5" rx="0.8" transform="rotate(45 38.75 61.25)" />
        <rect x="57" y="59" width="4.5" height="4.5" rx="0.8" transform="rotate(45 59.25 61.25)" />
      </g>

      {/* 4. Gear Inner Circle (Blue House Core) */}
      <circle cx="49" cy="51" r="9.5" fill="url(#servoRoyalBlue)" />

      {/* 5. Center Spanner / Wrench with downward arrow tip */}
      <g fill="#FFFFFF">
        {/* Open Spanner Head at Top */}
        <path d="M 45.8 43 C 45.8 41.8 47.2 40.8 49 40.8 C 50.8 40.8 52.2 41.8 52.2 43 L 52.2 45.8 C 50.6 44.8 47.4 44.8 45.8 45.8 Z" />
        {/* Vertical Shaft */}
        <rect x="47.6" y="44.5" width="2.8" height="9" />
        {/* Downward Arrowhead */}
        <polygon points="45.5,52.8 52.5,52.8 49,58.8" />
      </g>

      {/* 6. Lower Left Orbit Swooshes (Wrapping around lower-left of house) */}
      {/* Outer Blue Arc */}
      <path
        d="M 28 66 
           C 22.5 59 25 46.5 33 37.5 
           C 31 41 27 50.5 35 61.5 
           C 39 67 46 70 55 70.5 
           C 44 70.5 34 69.5 28 66 Z"
        fill="#003875"
      />
      {/* Inner Cyan Ribbon */}
      <path
        d="M 31 64 
           C 25 56 27.5 44 36 36 
           C 34.5 40 30 48.5 37.5 59.5 
           C 42 65 48.5 67.5 57 67.5 
           C 46.5 67.5 37.5 66.5 31 64 Z"
        fill="url(#servoCyanSwoosh)"
      />

      {/* 7. Large Dynamic Ascending Orange Arrow across the house */}
      {/* Curved Arrow Body */}
      <path
        d="M 39 60 
           C 45 62 55 59.5 63 51.5 
           C 69 45 72.5 35 74.5 23 
           L 70.5 24 
           C 68.5 34 64.5 42.5 58.5 48 
           C 51.5 54.5 44 56.5 39 60 Z"
        fill="#D64800"
      />

      {/* Arrow Head (Split 3D faceted arrow pointing up-right) */}
      {/* Top / Left Bright Facet */}
      <polygon
        points="75.5,13 63,26.5 70.5,25"
        fill="url(#servoArrowBright)"
      />
      {/* Bottom / Right Darker Facet */}
      <polygon
        points="75.5,13 70.5,25 75.8,32"
        fill="url(#servoArrowDark)"
      />
      {/* Arrow Barb Blue Undercut */}
      <polygon
        points="70.5,25 75.8,32 72.5,33"
        fill="#002D62"
      />
    </svg>
  );
};
