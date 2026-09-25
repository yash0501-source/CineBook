const fs = require("fs");
const path = require("path");

const postersDirectory = path.join(
  __dirname,
  "..",
  "public",
  "posters"
);

if (!fs.existsSync(postersDirectory)) {
  fs.mkdirSync(postersDirectory, {
    recursive: true,
  });
}

const escapeXml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const createFileName = (title, id) => {
  const safeTitle = String(title || "movie")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45);

  return `${safeTitle}-${id}.svg`;
};

// ==========================================
// MOVIE-SPECIFIC VISUALS
// ==========================================

const getVisual = (title = "") => {
  const name = title.toLowerCase();

  if (name.includes("midnight horizon")) {
    return {
      background: "#06122b",
      accent: "#38bdf8",
      second: "#1d4ed8",
      visual: `
        <circle cx="430" cy="270" r="105"
          fill="#e0f2fe" opacity="0.9"/>

        <circle cx="430" cy="270" r="125"
          fill="none"
          stroke="#38bdf8"
          stroke-width="3"
          opacity="0.25"/>

        <path
          d="M0 610 Q150 500 300 590 T600 540 L600 900 L0 900Z"
          fill="#020617"
        />

        <path
          d="M0 690 Q170 610 310 680 T600 640"
          fill="none"
          stroke="#38bdf8"
          stroke-width="3"
          opacity="0.7"
        />

        <rect x="80" y="570" width="12" height="120"
          fill="#38bdf8" opacity="0.4"/>

        <rect x="105" y="530" width="10" height="160"
          fill="#60a5fa" opacity="0.5"/>

        <rect x="140" y="590" width="15" height="100"
          fill="#38bdf8" opacity="0.35"/>
      `,
    };
  }

  if (name.includes("last journey")) {
    return {
      background: "#301b0b",
      accent: "#fbbf24",
      second: "#ea580c",
      visual: `
        <circle cx="440" cy="210" r="115"
          fill="#fef3c7" opacity="0.9"/>

        <path
          d="M0 570 L170 430 L260 510 L350 390 L600 560 L600 900 L0 900Z"
          fill="#171717"
        />

        <path
          d="M270 900 L320 560 L370 560 L430 900Z"
          fill="#292524"
        />

        <path
          d="M295 900 L340 590 L385 900"
          fill="none"
          stroke="#fbbf24"
          stroke-width="5"
          stroke-dasharray="28 24"
        />

        <circle cx="340" cy="535" r="12"
          fill="#fbbf24"/>

        <path
          d="M340 550 L340 610"
          stroke="#fbbf24"
          stroke-width="8"
        />
      `,
    };
  }

  if (name.includes("neon city")) {
    return {
      background: "#10002b",
      accent: "#22d3ee",
      second: "#ec4899",
      visual: `
        <rect x="45" y="300" width="90" height="330"
          fill="#111827"/>

        <rect x="160" y="210" width="100" height="420"
          fill="#172554"/>

        <rect x="280" y="330" width="85" height="300"
          fill="#1e1b4b"/>

        <rect x="390" y="180" width="120" height="450"
          fill="#111827"/>

        <g stroke="#22d3ee" stroke-width="5">
          <line x1="65" y1="350" x2="115" y2="350"/>
          <line x1="180" y1="270" x2="235" y2="270"/>
          <line x1="410" y1="240" x2="480" y2="240"/>
        </g>

        <g stroke="#ec4899" stroke-width="4">
          <line x1="65" y1="410" x2="115" y2="410"/>
          <line x1="180" y1="340" x2="235" y2="340"/>
          <line x1="410" y1="310" x2="480" y2="310"/>
        </g>

        <path
          d="M0 720 L600 620 L600 900 L0 900Z"
          fill="#020617"
        />

        <path
          d="M120 780 L480 700"
          stroke="#22d3ee"
          stroke-width="5"
          opacity="0.7"
        />
      `,
    };
  }

  if (name.includes("beyond the stars")) {
    return {
      background: "#020617",
      accent: "#60a5fa",
      second: "#a78bfa",
      visual: `
        <circle cx="430" cy="260" r="145"
          fill="#7c3aed" opacity="0.25"/>

        <circle cx="430" cy="260" r="90"
          fill="#1d4ed8" opacity="0.45"/>

        <circle cx="430" cy="260" r="45"
          fill="#f5f3ff" opacity="0.9"/>

        <g fill="#ffffff">
          <circle cx="90" cy="180" r="3"/>
          <circle cx="160" cy="300" r="2"/>
          <circle cx="250" cy="140" r="3"/>
          <circle cx="530" cy="150" r="2"/>
          <circle cx="500" cy="390" r="3"/>
        </g>

        <path
          d="M120 670 L280 610 L430 665 L280 720Z"
          fill="#64748b"
        />

        <circle cx="280" cy="625" r="35"
          fill="#cbd5e1"/>

        <path
          d="M260 655 L240 720
                   M300 655 L320 720"
          stroke="#94a3b8"
          stroke-width="12"
        />
      `,
    };
  }

  if (name.includes("shadow protocol")) {
    return {
      background: "#09090b",
      accent: "#ef4444",
      second: "#1f2937",
      visual: `
        <rect x="70" y="210" width="460" height="300"
          rx="12"
          fill="#111827"
          stroke="#374151"
          stroke-width="3"/>

        <g fill="#ef4444">
          <rect x="100" y="260" width="100" height="8"/>
          <rect x="100" y="290" width="160" height="8"/>
          <rect x="100" y="320" width="120" height="8"/>
        </g>

        <g fill="#22c55e" opacity="0.6">
          <rect x="330" y="260" width="140" height="8"/>
          <rect x="330" y="290" width="100" height="8"/>
        </g>

        <path
          d="M300 450
             C240 450 210 540 210 660
             L390 660
             C390 540 360 450 300 450Z"
          fill="#020617"
        />

        <circle cx="300" cy="430" r="48"
          fill="#020617"
          stroke="#ef4444"
          stroke-width="3"/>
      `,
    };
  }

  if (name.includes("ocean of dreams")) {
    return {
      background: "#082f49",
      accent: "#67e8f9",
      second: "#0ea5e9",
      visual: `
        <circle cx="440" cy="230" r="100"
          fill="#fef9c3"
          opacity="0.95"/>

        <path
          d="M0 500
             Q100 450 200 500
             T400 500
             T600 500
             L600 900
             L0 900Z"
          fill="#075985"
        />

        <path
          d="M0 580
             Q100 530 200 580
             T400 580
             T600 580"
          fill="none"
          stroke="#67e8f9"
          stroke-width="6"
          opacity="0.6"
        />

        <path
          d="M0 660
             Q100 610 200 660
             T400 660
             T600 660"
          fill="none"
          stroke="#bae6fd"
          stroke-width="4"
          opacity="0.35"
        />

        <ellipse cx="280" cy="540"
          rx="55" ry="20"
          fill="#f8fafc"
          opacity="0.9"/>
      `,
    };
  }

  if (name.includes("final mission")) {
    return {
      background: "#1c0a00",
      accent: "#fb923c",
      second: "#dc2626",
      visual: `
        <circle cx="470" cy="220" r="120"
          fill="#fed7aa"
          opacity="0.6"/>

        <path
          d="M0 620
             L130 500
             L240 570
             L350 470
             L600 610
             L600 900
             L0 900Z"
          fill="#171717"
        />

        <path
          d="M300 430 L350 520 L300 610 L250 520Z"
          fill="#111827"
          stroke="#fb923c"
          stroke-width="4"
        />

        <rect x="275" y="500"
          width="50"
          height="130"
          fill="#111827"/>

        <path
          d="M120 360 L250 440
                   M480 360 L350 440"
          stroke="#94a3b8"
          stroke-width="14"
          opacity="0.5"
        />

        <circle cx="300" cy="720" r="70"
          fill="#ea580c"
          opacity="0.2"/>
      `,
    };
  }

  if (name.includes("love in mumbai")) {
    return {
      background: "#3b0a22",
      accent: "#fb7185",
      second: "#f59e0b",
      visual: `
        <circle cx="430" cy="250" r="100"
          fill="#fde68a"
          opacity="0.9"/>

        <path
          d="M0 600
             L90 510
             L130 570
             L190 450
             L250 570
             L320 480
             L380 570
             L450 430
             L520 570
             L600 490
             L600 900
             L0 900Z"
          fill="#18181b"
        />

        <path
          d="M0 700
             Q300 610 600 700
             L600 900
             L0 900Z"
          fill="#7c2d12"
          opacity="0.35"
        />

        <circle cx="275" cy="620" r="18"
          fill="#fb7185"/>

        <circle cx="325" cy="620" r="18"
          fill="#fb7185"/>

        <path
          d="M275 620 Q300 675 325 620"
          fill="#fb7185"
        />
      `,
    };
  }

  if (name.includes("kingdom of fire")) {
    return {
      background: "#1c0500",
      accent: "#f97316",
      second: "#ef4444",
      visual: `
        <circle cx="430" cy="250" r="130"
          fill="#fb923c"
          opacity="0.25"/>

        <path
          d="M0 650
             L120 470
             L220 570
             L320 390
             L430 560
             L520 430
             L600 600
             L600 900
             L0 900Z"
          fill="#111827"
        />

        <path
          d="M250 650
             C180 560 270 510 290 420
             C360 520 420 560 350 650Z"
          fill="#f97316"
        />

        <path
          d="M280 640
             C245 575 300 540 315 490
             C350 550 370 590 330 640Z"
          fill="#fef3c7"
        />

        <path
          d="M70 720 Q150 650 230 720
                   T390 720 T550 720"
          fill="none"
          stroke="#ef4444"
          stroke-width="10"
          opacity="0.6"
        />
      `,
    };
  }

  if (name.includes("silent witness")) {
    return {
      background: "#09090b",
      accent: "#94a3b8",
      second: "#334155",
      visual: `
        <rect x="70" y="190"
          width="460"
          height="470"
          fill="#111827"
          stroke="#334155"
          stroke-width="3"/>

        <rect x="110" y="230"
          width="150"
          height="190"
          fill="#020617"/>

        <rect x="340" y="230"
          width="150"
          height="190"
          fill="#020617"/>

        <path
          d="M270 660
             C240 570 250 470 300 430
             C350 470 360 570 330 660Z"
          fill="#020617"
          stroke="#64748b"
          stroke-width="3"
        />

        <circle cx="300" cy="420" r="35"
          fill="#020617"
          stroke="#64748b"
          stroke-width="3"/>

        <path
          d="M90 690 L510 690"
          stroke="#ef4444"
          stroke-width="7"
          stroke-dasharray="30 15"
        />
      `,
    };
  }

  if (name.includes("galaxy beyond")) {
    return {
      background: "#030014",
      accent: "#c084fc",
      second: "#22d3ee",
      visual: `
        <ellipse
          cx="350"
          cy="330"
          rx="260"
          ry="90"
          fill="none"
          stroke="#a855f7"
          stroke-width="45"
          opacity="0.35"
          transform="rotate(-25 350 330)"
        />

        <circle cx="350" cy="330" r="55"
          fill="#fef3c7"/>

        <circle cx="110" cy="220" r="40"
          fill="#2563eb"
          opacity="0.6"/>

        <circle cx="520" cy="470" r="65"
          fill="#7c3aed"
          opacity="0.4"/>

        <path
          d="M70 690 L250 610 L390 660 L540 590"
          stroke="#22d3ee"
          stroke-width="8"
          fill="none"
          opacity="0.7"
        />
      `,
    };
  }

  // THE HIDDEN TRUTH
  return {
    background: "#0b0f19",
    accent: "#f59e0b",
    second: "#64748b",
    visual: `
      <rect x="70" y="190"
        width="460" height="390"
        fill="#171717"
        stroke="#475569"
        stroke-width="3"/>

      <rect x="110" y="240"
        width="170" height="120"
        fill="#292524"/>

      <rect x="320" y="240"
        width="170" height="120"
        fill="#292524"/>

      <path
        d="M130 430 L470 430"
        stroke="#f59e0b"
        stroke-width="6"
      />

      <path
        d="M160 470 L440 470"
        stroke="#64748b"
        stroke-width="4"
      />

      <circle cx="300" cy="650" r="85"
        fill="#111827"
        stroke="#f59e0b"
        stroke-width="5"/>

      <circle cx="300" cy="650" r="28"
        fill="#f59e0b"
        opacity="0.8"/>

      <path
        d="M300 570 L300 520"
        stroke="#f59e0b"
        stroke-width="6"
      />
    `,
  };
};

// ==========================================
// GENERATE POSTER
// ==========================================

const generatePoster = ({
  title,
  genre = [],
  language = "",
  certificate = "U/A",
  movieId,
}) => {
  const fileName = createFileName(
    title,
    movieId
  );

  const filePath = path.join(
    postersDirectory,
    fileName
  );

  const theme = getVisual(title);

  const genreText = Array.isArray(genre)
    ? genre.join("  •  ")
    : "";

  const safeTitle = escapeXml(title);
  const safeGenre = escapeXml(genreText);
  const safeLanguage =
    escapeXml(language);
  const safeCertificate =
    escapeXml(certificate);

  const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="600"
  height="900"
  viewBox="0 0 600 900"
>

<defs>

  <linearGradient
    id="background"
    x1="0%"
    y1="0%"
    x2="100%"
    y2="100%"
  >
    <stop
      offset="0%"
      stop-color="${theme.background}"
    />

    <stop
      offset="100%"
      stop-color="#000000"
    />
  </linearGradient>

  <radialGradient
    id="glow"
    cx="50%"
    cy="35%"
    r="60%"
  >
    <stop
      offset="0%"
      stop-color="${theme.accent}"
      stop-opacity="0.22"
    />

    <stop
      offset="100%"
      stop-color="${theme.accent}"
      stop-opacity="0"
    />
  </radialGradient>

  <linearGradient
    id="bottomFade"
    x1="0%"
    y1="0%"
    x2="0%"
    y2="100%"
  >
    <stop
      offset="0%"
      stop-color="#000000"
      stop-opacity="0"
    />

    <stop
      offset="65%"
      stop-color="#000000"
      stop-opacity="0.15"
    />

    <stop
      offset="100%"
      stop-color="#000000"
      stop-opacity="0.98"
    />
  </linearGradient>

</defs>

<!-- BACKGROUND -->

<rect
  width="600"
  height="900"
  fill="url(#background)"
/>

<rect
  width="600"
  height="900"
  fill="url(#glow)"
/>

<!-- MOVIE-SPECIFIC ART -->

${theme.visual}

<!-- CINEMATIC DARK FADE -->

<rect
  width="600"
  height="900"
  fill="url(#bottomFade)"
/>

<!-- BRAND -->

<text
  x="42"
  y="62"
  fill="#ffffff"
  font-family="Arial, Helvetica, sans-serif"
  font-size="22"
  font-weight="700"
  letter-spacing="5"
>
CINEBOOK
</text>

<rect
  x="42"
  y="80"
  width="70"
  height="3"
  rx="2"
  fill="${theme.accent}"
/>

<!-- TITLE -->

<text
  x="42"
  y="700"
  fill="#ffffff"
  font-family="Arial, Helvetica, sans-serif"
  font-size="42"
  font-weight="800"
>
${safeTitle}
</text>

<!-- GENRE -->

<text
  x="42"
  y="742"
  fill="#ffffff"
  opacity="0.78"
  font-family="Arial, Helvetica, sans-serif"
  font-size="15"
  letter-spacing="1.2"
>
${safeGenre}
</text>

<!-- LANGUAGE -->

<text
  x="42"
  y="772"
  fill="#ffffff"
  opacity="0.65"
  font-family="Arial, Helvetica, sans-serif"
  font-size="15"
>
${safeLanguage}
</text>

<!-- CERTIFICATE -->

<rect
  x="42"
  y="800"
  width="58"
  height="30"
  rx="5"
  fill="#ffffff"
  opacity="0.12"
/>

<text
  x="71"
  y="820"
  text-anchor="middle"
  fill="#ffffff"
  font-family="Arial, Helvetica, sans-serif"
  font-size="12"
  font-weight="700"
>
${safeCertificate}
</text>

<!-- PLAY ICON -->

<circle
  cx="525"
  cy="815"
  r="32"
  fill="none"
  stroke="${theme.accent}"
  stroke-width="2"
  opacity="0.8"
/>

<path
  d="M516 800 L540 815 L516 830 Z"
  fill="${theme.accent}"
/>

<!-- FOOTER -->

<text
  x="558"
  y="865"
  text-anchor="end"
  fill="#ffffff"
  opacity="0.45"
  font-family="Arial, Helvetica, sans-serif"
  font-size="10"
  letter-spacing="2"
>
CINEMATIC EXPERIENCE
</text>

</svg>
`;

  fs.writeFileSync(
    filePath,
    svg,
    "utf8"
  );

  return `/posters/${fileName}`;
};

// ==========================================
// DELETE POSTER
// ==========================================

const deletePoster = (posterUrl) => {
  if (!posterUrl) {
    return;
  }

  const fileName =
    path.basename(posterUrl);

  const filePath = path.join(
    postersDirectory,
    fileName
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  generatePoster,
  deletePoster,
  postersDirectory,
};