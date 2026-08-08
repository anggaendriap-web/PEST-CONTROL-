import React from 'react';

interface BostonPestLogoProps {
  className?: string;
  variant?: 'full' | 'logo-only' | 'light' | 'dark';
  height?: number | string;
}

export const BostonPestLogo: React.FC<BostonPestLogoProps> = ({
  className = '',
  variant = 'full',
  height = 54
}) => {
  const isLogoOnly = variant === 'logo-only';
  const viewBox = isLogoOnly ? '0 0 168 160' : '0 0 680 160';

  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        viewBox={viewBox}
        style={{ height: height, width: 'auto' }}
        className="shrink-0 max-w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === EMBLEM LOGO (SHIELD / LEAF & PEST) === */}
        <g id="pest-emblem">
          {/* Outer Left Leaf Wing */}
          <path
            d="M 15 115 C 5 70 20 30 70 28 C 50 50 40 80 48 120 C 35 128 22 122 15 115 Z"
            fill="#3da751"
          />
          <path
            d="M 12 110 C 2 75 18 35 68 28 C 65 30 25 55 22 108 C 16 112 13 111 12 110 Z"
            fill="#44b85a"
          />

          {/* Outer Right Leaf Wing */}
          <path
            d="M 155 115 C 165 70 150 30 100 28 C 120 50 130 80 122 120 C 135 128 148 122 155 115 Z"
            fill="#3da751"
          />
          <path
            d="M 158 110 C 168 75 152 35 102 28 C 105 30 145 55 148 108 C 154 112 157 111 158 110 Z"
            fill="#44b85a"
          />

          {/* Main Drop / Leaf Base Contour */}
          <path
            d="M 85 14 C 120 40 138 75 132 112 C 125 138 105 148 85 148 C 65 148 45 138 38 112 C 32 75 50 40 85 14 Z"
            fill="#0f5c2b"
          />

          {/* Left White Drop Inner */}
          <path
            d="M 85 22 C 55 46 42 78 47 110 C 53 132 68 140 85 140 L 85 22 Z"
            fill="#ffffff"
          />

          {/* Right Dark Green Drop Inner */}
          <path
            d="M 85 22 C 115 46 128 78 123 110 C 117 132 102 140 85 140 L 85 22 Z"
            fill="#0f5c2b"
          />

          {/* --- PEST / BUG SYMBOL IN CENTER --- */}

          {/* Left Side Bug (Green on White) */}
          <g fill="#0f5c2b">
            {/* Left Antenna */}
            <path d="M 72 48 Q 65 42 62 38 A 3 3 0 1 1 66 34 Q 70 40 76 46 Z" />
            {/* Left Legs */}
            <path d="M 68 64 Q 50 58 44 54 Q 48 60 66 68 Z" />
            <path d="M 66 82 Q 46 82 40 84 Q 46 86 66 85 Z" />
            <path d="M 68 98 Q 50 104 44 112 Q 48 106 70 100 Z" />
            {/* Left Head & Body Half */}
            <path d="M 85 46 C 75 46 72 54 72 62 L 85 62 Z" />
            <path d="M 85 66 L 68 66 C 64 74 64 84 68 92 L 85 92 Z" />
            <path d="M 85 96 L 70 96 C 72 106 78 114 85 118 Z" />
          </g>

          {/* Right Side Bug (White on Dark Green) */}
          <g fill="#ffffff">
            {/* Right Antenna */}
            <path d="M 98 48 Q 105 42 108 38 A 3 3 0 1 0 104 34 Q 100 40 94 46 Z" />
            {/* Right Legs */}
            <path d="M 102 64 Q 120 58 126 54 Q 122 60 104 68 Z" />
            <path d="M 104 82 Q 124 82 130 84 Q 124 86 104 85 Z" />
            <path d="M 102 98 Q 120 104 126 112 Q 122 106 100 100 Z" />
            {/* Right Head & Body Half */}
            <path d="M 85 46 C 95 46 98 54 98 62 L 85 62 Z" />
            <path d="M 85 66 L 102 66 C 106 74 106 84 102 92 L 85 92 Z" />
            <path d="M 85 96 L 100 96 C 98 106 92 114 85 118 Z" />
          </g>

          {/* Horizontal Split Line through Bug */}
          <line x1="42" y1="80" x2="128" y2="80" stroke="#0f5c2b" strokeWidth="2.5" />
          <line x1="85" y1="80" x2="128" y2="80" stroke="#ffffff" strokeWidth="2.5" />
        </g>

        {variant !== 'logo-only' && (
          <g id="brand-text">
            {/* "Bostonpest" Title */}
            <text
              x="175"
              y="90"
              fill={variant === 'dark' ? '#ffffff' : '#0d5e2a'}
              fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
              fontWeight="900"
              fontSize="76"
              letterSpacing="-1.5"
            >
              Bostonpest
            </text>

            {/* "SAVE YOU PEST" Subtitle */}
            <text
              x="176"
              y="132"
              fill="#c28b24"
              fontFamily="system-ui, -apple-system, 'Trebuchet MS', sans-serif"
              fontWeight="800"
              fontSize="28"
              letterSpacing="7.5"
            >
              SAVE YOU PEST
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
