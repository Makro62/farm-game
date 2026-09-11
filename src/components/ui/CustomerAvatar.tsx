"use client";

import { useMemo } from "react";

interface CustomerAvatarProps {
  customerId: string;
  size?: number;
  eating?: boolean;
  className?: string;
}

interface AvatarParts {
  skin: string;
  hair: string;
  hairStyle: "short" | "pigtails" | "bun" | "straw_hat" | "slick" | "messy" | "curly" | "balding" | "cap";
  shirt: string;
  shirtStyle: "collar" | "dress" | "shawl" | "overalls" | "suit" | "hoodie" | "hawaiian" | "formal" | "flannel";
  facialHair?: "mustache" | "goatee" | "beard";
  accessory?: "glasses" | "monocle" | "sunglasses" | "cap" | "none";
  eyeColor?: string;
}

const AVATAR_DATA: Record<string, AvatarParts> = {
  bapak_kumis: {
    skin: "#E8B894",
    hair: "#5C3A1E",
    hairStyle: "short",
    shirt: "#8B6B4A",
    shirtStyle: "collar",
    facialHair: "mustache",
    eyeColor: "#3D2512",
  },
  gadis_kecil: {
    skin: "#FFD4B8",
    hair: "#F5C842",
    hairStyle: "pigtails",
    shirt: "#FF8FAB",
    shirtStyle: "dress",
    eyeColor: "#5B8DD9",
  },
  nenek: {
    skin: "#F0C8A0",
    hair: "#C0C0C0",
    hairStyle: "bun",
    shirt: "#9B59B6",
    shirtStyle: "shawl",
    accessory: "glasses",
    eyeColor: "#6B4226",
  },
  petani_tetangga: {
    skin: "#D4A574",
    hair: "#5C3A1E",
    hairStyle: "straw_hat",
    shirt: "#5D8A3C",
    shirtStyle: "overalls",
    eyeColor: "#3D2512",
  },
  pengusaha: {
    skin: "#E8C8A0",
    hair: "#2C2C2C",
    hairStyle: "slick",
    shirt: "#34495E",
    shirtStyle: "suit",
    eyeColor: "#1A1A1A",
  },
  remaja: {
    skin: "#F0D0A8",
    hair: "#8B5E3C",
    hairStyle: "messy",
    shirt: "#3498DB",
    shirtStyle: "hoodie",
    eyeColor: "#4A3728",
  },
  turis: {
    skin: "#E0B890",
    hair: "#8B4513",
    hairStyle: "curly",
    shirt: "#E67E22",
    shirtStyle: "hawaiian",
    accessory: "sunglasses",
    eyeColor: "#3D2512",
  },
  kritikus: {
    skin: "#F0D8B8",
    hair: "#4A4A4A",
    hairStyle: "balding",
    shirt: "#2C3E50",
    shirtStyle: "formal",
    facialHair: "goatee",
    accessory: "monocle",
    eyeColor: "#2C3E50",
  },
  nelayan_tamu: {
    skin: "#D4A070",
    hair: "#6B4226",
    hairStyle: "cap",
    shirt: "#C0392B",
    shirtStyle: "flannel",
    facialHair: "beard",
    accessory: "cap",
    eyeColor: "#3D2512",
  },
};

function Head({ parts, eating }: { parts: AvatarParts; eating?: boolean }) {
  const { skin, hair, hairStyle, facialHair, accessory, eyeColor = "#2C1810" } = parts;

  return (
    <g>
      {/* Neck */}
      <rect x="22" y="32" width="16" height="8" fill={skin} />

      {/* Head shape */}
      <ellipse cx="30" cy="22" rx="16" ry="14" fill={skin} />

      {/* Eyes */}
      {accessory === "sunglasses" ? (
        <>
          <rect x="18" y="18" width="10" height="6" rx="2" fill="#1A1A2E" />
          <rect x="32" y="18" width="10" height="6" rx="2" fill="#1A1A2E" />
          <line x1="28" y1="21" x2="32" y2="21" stroke="#1A1A2E" strokeWidth="1.5" />
          <rect x="19" y="19" width="3" height="2" rx="1" fill="#4A6FA5" opacity="0.6" />
          <rect x="33" y="19" width="3" height="2" rx="1" fill="#4A6FA5" opacity="0.6" />
        </>
      ) : accessory === "monocle" ? (
        <>
          <circle cx="23" cy="21" r="4" fill="none" stroke="#C0A060" strokeWidth="1.5" />
          <circle cx="23" cy="21" r="2.5" fill={eyeColor} />
          <circle cx="23" cy="21" r="1" fill="#000" />
          <circle cx="22" cy="20" r="0.8" fill="#fff" opacity="0.7" />
          <circle cx="37" cy="21" r="2.5" fill={eyeColor} />
          <circle cx="37" cy="21" r="1" fill="#000" />
          <circle cx="36" cy="20" r="0.8" fill="#fff" opacity="0.7" />
          <line x1="27" y1="21" x2="33" y2="21" stroke="#C0A060" strokeWidth="1" />
          <line x1="23" y1="25" x2="20" y2="35" stroke="#C0A060" strokeWidth="0.8" />
        </>
      ) : accessory === "glasses" ? (
        <>
          <circle cx="23" cy="21" r="4" fill="none" stroke="#8B7355" strokeWidth="1.5" />
          <circle cx="37" cy="21" r="4" fill="none" stroke="#8B7355" strokeWidth="1.5" />
          <line x1="27" y1="21" x2="33" y2="21" stroke="#8B7355" strokeWidth="1" />
          <circle cx="23" cy="21" r="2" fill={eyeColor} />
          <circle cx="23" cy="21" r="0.8" fill="#000" />
          <circle cx="22" cy="20" r="0.6" fill="#fff" opacity="0.7" />
          <circle cx="37" cy="21" r="2" fill={eyeColor} />
          <circle cx="37" cy="21" r="0.8" fill="#000" />
          <circle cx="36" cy="20" r="0.6" fill="#fff" opacity="0.7" />
        </>
      ) : (
        <>
          <circle cx="23" cy="21" r="2.5" fill={eyeColor} />
          <circle cx="23" cy="21" r="1" fill="#000" />
          <circle cx="22" cy="20" r="0.8" fill="#fff" opacity="0.7" />
          <circle cx="37" cy="21" r="2.5" fill={eyeColor} />
          <circle cx="37" cy="21" r="1" fill="#000" />
          <circle cx="36" cy="20" r="0.8" fill="#fff" opacity="0.7" />
        </>
      )}

      {/* Eyebrows */}
      <line x1="19" y1="16" x2="26" y2="15" stroke={hair} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="34" y1="15" x2="41" y2="16" stroke={hair} strokeWidth="1.8" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="30" cy="25" rx="2" ry="1.5" fill={skin} filter="url(#shadow)" />
      <ellipse cx="30" cy="25.5" rx="1.5" ry="0.8" fill="#00000010" />

      {/* Mouth */}
      {eating ? (
        <ellipse cx="30" cy="30" rx="4" ry="3" fill="#C0392B" />
      ) : (
        <path d="M26 29 Q30 33 34 29" fill="none" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* Facial hair */}
      {facialHair === "mustache" && (
        <path d="M22 27 Q26 30 30 27 Q34 30 38 27" fill="#3D2512" strokeWidth="0" />
      )}
      {facialHair === "goatee" && (
        <ellipse cx="30" cy="33" rx="3" ry="2" fill="#4A4A4A" />
      )}
      {facialHair === "beard" && (
        <path d="M18 28 Q20 38 30 40 Q40 38 42 28" fill="#6B4226" opacity="0.85" />
      )}

      {/* Hair */}
      {hairStyle === "short" && (
        <path d="M14 18 Q14 6 30 6 Q46 6 46 18 Q46 12 40 10 Q34 8 30 9 Q26 8 20 10 Q14 12 14 18" fill={hair} />
      )}
      {hairStyle === "pigtails" && (
        <>
          <path d="M14 16 Q14 6 30 5 Q46 6 46 16 Q44 10 38 9 Q32 8 30 9 Q28 8 22 9 Q16 10 14 16" fill={hair} />
          <circle cx="10" cy="14" r="5" fill={hair} />
          <circle cx="10" cy="14" r="3" fill="#FF6B8A" />
          <circle cx="50" cy="14" r="5" fill={hair} />
          <circle cx="50" cy="14" r="3" fill="#FF6B8A" />
        </>
      )}
      {hairStyle === "bun" && (
        <>
          <path d="M14 18 Q14 8 30 7 Q46 8 46 18 Q44 12 38 10 Q32 9 30 10 Q28 9 22 10 Q16 12 14 18" fill={hair} />
          <circle cx="30" cy="6" r="6" fill={hair} />
        </>
      )}
      {hairStyle === "straw_hat" && (
        <>
          <path d="M14 18 Q14 8 30 7 Q46 8 46 18" fill={hair} />
          <ellipse cx="30" cy="10" rx="22" ry="4" fill="#F4D03F" />
          <rect x="20" y="4" width="20" height="8" rx="4" fill="#F4D03F" />
          <rect x="20" y="8" width="20" height="2" fill="#D4A017" />
        </>
      )}
      {hairStyle === "slick" && (
        <path d="M14 18 Q14 6 30 5 Q46 6 46 18 Q46 12 40 9 Q34 7 30 7 Q26 7 20 9 Q14 12 14 18" fill={hair} />
      )}
      {hairStyle === "messy" && (
        <>
          <path d="M14 18 Q14 7 30 6 Q46 7 46 18 Q44 11 40 9 Q35 7 30 8 Q25 7 20 9 Q16 11 14 18" fill={hair} />
          <path d="M18 8 L16 4 L20 7" fill={hair} />
          <path d="M30 6 L31 2 L33 5" fill={hair} />
          <path d="M40 9 L43 5 L42 10" fill={hair} />
        </>
      )}
      {hairStyle === "curly" && (
        <>
          <circle cx="16" cy="12" r="5" fill={hair} />
          <circle cx="24" cy="8" r="5" fill={hair} />
          <circle cx="32" cy="7" r="5" fill={hair} />
          <circle cx="40" cy="9" r="5" fill={hair} />
          <circle cx="46" cy="14" r="4" fill={hair} />
          <circle cx="14" cy="18" r="3" fill={hair} />
          <circle cx="46" cy="18" r="3" fill={hair} />
        </>
      )}
      {hairStyle === "balding" && (
        <>
          <path d="M14 18 Q14 10 22 9 Q18 12 14 18" fill={hair} />
          <path d="M46 18 Q46 10 38 9 Q42 12 46 18" fill={hair} />
          <path d="M22 9 Q26 7 30 8 Q34 7 38 9" fill={hair} opacity="0.5" />
        </>
      )}
      {hairStyle === "cap" && (
        <>
          <path d="M14 18 Q14 8 30 7 Q46 8 46 18" fill={hair} />
          <rect x="10" y="8" width="40" height="8" rx="4" fill="#2980B9" />
          <rect x="6" y="12" width="18" height="4" rx="2" fill="#2980B9" />
          <rect x="10" y="10" width="40" height="2" fill="#1A6FA0" />
        </>
      )}
    </g>
  );
}

function Body({ parts }: { parts: AvatarParts }) {
  const { shirt, shirtStyle } = parts;

  return (
    <g>
      {shirtStyle === "collar" && (
        <>
          <path d="M10 42 Q10 38 22 36 L22 60 L10 60 Z" fill={shirt} />
          <path d="M50 42 Q50 38 38 36 L38 60 L50 60 Z" fill={shirt} />
          <polygon points="22,36 30,42 38,36" fill="#F5F0E6" />
          <rect x="22" y="36" width="16" height="24" fill={shirt} />
        </>
      )}
      {shirtStyle === "dress" && (
        <>
          <path d="M12 42 Q12 38 22 36 L16 60 L12 60 Z" fill={shirt} />
          <path d="M48 42 Q48 38 38 36 L44 60 L48 60 Z" fill={shirt} />
          <rect x="22" y="36" width="16" height="24" fill={shirt} />
          <path d="M16 50 Q30 46 44 50 L44 54 Q30 50 16 54 Z" fill={shirt} opacity="0.3" />
        </>
      )}
      {shirtStyle === "shawl" && (
        <>
          <rect x="16" y="36" width="28" height="24" rx="2" fill={shirt} />
          <path d="M12 40 Q16 36 22 36 L22 44 L12 48 Z" fill={shirt} />
          <path d="M48 40 Q44 36 38 36 L38 44 L48 48 Z" fill={shirt} />
          <ellipse cx="30" cy="44" rx="8" ry="2" fill="#fff" opacity="0.3" />
        </>
      )}
      {shirtStyle === "overalls" && (
        <>
          <rect x="14" y="38" width="32" height="22" rx="2" fill="#5D4E37" />
          <rect x="18" y="40" width="24" height="18" rx="1" fill={shirt} />
          <rect x="20" y="36" width="4" height="8" fill="#8B7355" />
          <rect x="36" y="36" width="4" height="8" fill="#8B7355" />
          <circle cx="22" cy="44" r="1.5" fill="#C0A060" />
          <circle cx="38" cy="44" r="1.5" fill="#C0A060" />
        </>
      )}
      {shirtStyle === "suit" && (
        <>
          <rect x="14" y="36" width="32" height="24" rx="2" fill={shirt} />
          <path d="M14 36 L22 36 L22 60 L14 60 Z" fill="#2C3E50" />
          <path d="M46 36 L38 36 L38 60 L46 60 Z" fill="#2C3E50" />
          <polygon points="22,36 30,44 38,36" fill="#F5F0E6" />
          <rect x="28" y="38" width="4" height="14" rx="1" fill="#E74C3C" />
        </>
      )}
      {shirtStyle === "hoodie" && (
        <>
          <rect x="12" y="38" width="36" height="22" rx="4" fill={shirt} />
          <path d="M20 38 Q30 34 40 38" fill="none" stroke="#2980B9" strokeWidth="2" />
          <rect x="24" y="42" width="12" height="6" rx="2" fill="#2980B9" opacity="0.4" />
          <line x1="26" y1="48" x2="26" y2="54" stroke="#2980B9" strokeWidth="1" />
          <line x1="34" y1="48" x2="34" y2="54" stroke="#2980B9" strokeWidth="1" />
        </>
      )}
      {shirtStyle === "hawaiian" && (
        <>
          <rect x="12" y="38" width="36" height="22" rx="3" fill={shirt} />
          <circle cx="20" cy="44" r="2" fill="#27AE60" />
          <circle cx="32" cy="42" r="2.5" fill="#E74C3C" />
          <circle cx="38" cy="48" r="2" fill="#F39C12" />
          <circle cx="18" cy="52" r="1.5" fill="#8E44AD" />
          <path d="M26 36 L30 40 L34 36" fill="none" stroke="#2C3E50" strokeWidth="1.5" />
        </>
      )}
      {shirtStyle === "formal" && (
        <>
          <rect x="14" y="36" width="32" height="24" rx="2" fill={shirt} />
          <polygon points="22,36 30,42 38,36" fill="#ECF0F1" />
          <rect x="29" y="38" width="2" height="12" fill="#C0A060" />
          <circle cx="30" cy="40" r="1" fill="#C0A060" />
        </>
      )}
      {shirtStyle === "flannel" && (
        <>
          <rect x="12" y="38" width="36" height="22" rx="2" fill={shirt} />
          <line x1="12" y1="44" x2="48" y2="44" stroke="#922B21" strokeWidth="1" />
          <line x1="12" y1="50" x2="48" y2="50" stroke="#922B21" strokeWidth="1" />
          <line x1="20" y1="38" x2="20" y2="60" stroke="#922B21" strokeWidth="1" />
          <line x1="30" y1="38" x2="30" y2="60" stroke="#922B21" strokeWidth="1" />
          <line x1="40" y1="38" x2="40" y2="60" stroke="#922B21" strokeWidth="1" />
          <polygon points="24,36 30,40 36,36" fill="#F5F0E6" />
        </>
      )}
    </g>
  );
}

export default function CustomerAvatar({
  customerId,
  size = 48,
  eating = false,
  className = "",
}: CustomerAvatarProps) {
  const parts = AVATAR_DATA[customerId] || AVATAR_DATA.bapak_kumis;

  const key = useMemo(() => `${customerId}-${eating}`, [customerId, eating]);

  return (
    <svg
      key={key}
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
        </filter>
        <clipPath id="circle-clip">
          <circle cx="30" cy="30" r="28" />
        </clipPath>
      </defs>

      <g clipPath="url(#circle-clip)">
        {/* Background */}
        <circle cx="30" cy="30" r="28" fill="#FFF8E7" />

        {/* Body */}
        <g transform="translate(0, 18)">
          <Body parts={parts} />
        </g>

        {/* Head */}
        <Head parts={parts} eating={eating} />
      </g>

      {/* Border */}
      <circle cx="30" cy="30" r="28" fill="none" stroke="#D4C4A8" strokeWidth="2" />
    </svg>
  );
}
