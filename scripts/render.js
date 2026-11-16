const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const sharp = require("sharp");
const ffmpeg = require("ffmpeg-static");

const WIDTH = 720;
const HEIGHT = 1280;
const FPS = 24;
const DURATION = 60;
const FRAME_COUNT = FPS * DURATION;
const OUTPUT = path.resolve("geografi-kelas-10-rikaya-nurcahya.mp4");
const COLORS = {
  ink: "#081421",
  cyan: "#52E2D0",
  blue: "#628BFF",
  yellow: "#FFD77A",
  white: "#F5F7FB",
  muted: "#B5C2D3",
};

const scenes = [
  {
    start: 0,
    title: ["GEOGRAFI"],
    subtitle: ["Cara bumi bercerita."],
    tag: "KELAS X  ·  MATERI INTI",
    visual: "intro",
  },
  {
    start: 10,
    title: ["Apa itu", "geografi?"],
    subtitle: [
      "Ilmu yang mengkaji persamaan dan",
      "perbedaan fenomena geosfer di bumi,",
      "dengan sudut pandang keruangan.",
    ],
    tag: "PENGERTIAN",
    visual: "globe",
  },
  {
    start: 20,
    title: ["Apa yang", "dipelajari?"],
    subtitle: [
      "Lima lapisan yang saling terhubung:",
      "litosfer, atmosfer, hidrosfer,",
      "biosfer, dan antroposfer.",
    ],
    tag: "OBJEK GEOGRAFI",
    visual: "layers",
  },
  {
    start: 30,
    title: ["Tiga cara", "memahami bumi."],
    subtitle: [
      "Keruangan: di mana dan mengapa di sana?",
      "Kelingkungan: bagaimana manusia & alam",
      "saling memengaruhi?",
      "Kewilayahan: apa yang khas tiap wilayah?",
    ],
    tag: "PENDEKATAN GEOGRAFI",
    visual: "approaches",
  },
  {
    start: 40,
    title: ["Contoh: banjir", "di perkotaan."],
    subtitle: [
      "Keruangan: lokasi rawan banjir.",
      "Kelingkungan: hujan, drainase, dan",
      "perubahan lahan saling berkaitan.",
      "Kewilayahan: tiap daerah punya solusi khas.",
    ],
    tag: "GEOGRAFI DALAM KEHIDUPAN",
    visual: "flood",
  },
  {
    start: 50,
    title: ["Geografi =", "bumi + ruang", "+ manusia."],
    subtitle: [
      "Memahami geosfer dan hubungan",
      "antargejala untuk membaca bumi",
      "dan mengambil keputusan lebih baik.",
    ],
    tag: "INGAT INTINYA",
    visual: "outro",
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function textLines(lines, x, firstY, lineHeight, size, fill, weight = 500) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${firstY + index * lineHeight}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}">${escapeXml(line)}</text>`,
    )
    .join("");
}

function globe(time, radius = 118) {
  const spin = (time * 13) % 360;
  return `
    <circle cx="360" cy="292" r="${radius + 28}" fill="none" stroke="#52E2D0" stroke-opacity=".13" stroke-width="1"/>
    <ellipse cx="360" cy="292" rx="${radius + 46}" ry="48" transform="rotate(${-19 + spin} 360 292)" fill="none" stroke="#52E2D0" stroke-opacity=".34" stroke-width="1.5"/>
    <circle cx="360" cy="292" r="${radius}" fill="url(#earth)" stroke="#77F1DD" stroke-width="2"/>
    <ellipse cx="360" cy="292" rx="${radius * .43}" ry="${radius}" fill="none" stroke="#B6FFF3" stroke-opacity=".37" stroke-width="1.4" transform="rotate(${spin} 360 292)"/>
    <ellipse cx="360" cy="292" rx="${radius}" ry="${radius * .36}" fill="none" stroke="#B6FFF3" stroke-opacity=".42" stroke-width="1.4"/>
    <path d="M288 257l19-20 27 5 10 17-11 13-27-4-7 18-21-9zm70-16 29-8 29 18-8 24-19 7-5 25-18 10-10-28-19-9 5-23zm-36 88 22 4 9 23-19 20-25-10-6-21z" fill="#70E1B7" fill-opacity=".92"/>
    <circle cx="360" cy="292" r="${radius}" fill="url(#shade)" />`;
}

function layers(time) {
  const labels = [
    ["LITOSFER", "Bumi"],
    ["ATMOSFER", "Udara"],
    ["HIDROSFER", "Air"],
    ["BIOSFER", "Makhluk hidup"],
    ["ANTROPOSFER", "Manusia"],
  ];
  return labels
    .map(([label, hint], index) => {
      const y = 172 + index * 52;
      const x = 186 + (index % 2) * 198 + Math.sin(time * 2 + index) * 10;
      const colors = [COLORS.yellow, COLORS.blue, COLORS.cyan, "#76D89A", "#FF9A84"];
      return `<g>
        <rect x="${x - 116}" y="${y - 19}" width="232" height="42" rx="21" fill="#11253A" stroke="${colors[index]}" stroke-opacity=".55"/>
        <circle cx="${x - 92}" cy="${y + 2}" r="5" fill="${colors[index]}"/>
        <text x="${x - 76}" y="${y + 7}" fill="#F5F7FB" font-size="15" font-weight="700">${label}</text>
        <text x="${x + 94}" y="${y + 7}" text-anchor="end" fill="#B5C2D3" font-size="12">${hint}</text>
      </g>`;
    })
    .join("");
}

function approaches(time) {
  const cards = [
    { title: "RUANG", note: "Di mana?", color: COLORS.cyan, icon: "⌖" },
    { title: "LINGKUNGAN", note: "Saling terkait?", color: COLORS.yellow, icon: "↔" },
    { title: "WILAYAH", note: "Apa khasnya?", color: "#A99AFF", icon: "◎" },
  ];
  return cards
    .map((card, index) => {
      const x = 82 + index * 190;
      const y = 240 + Math.sin(time * 1.7 + index * 1.5) * 7;
      return `<g>
        <rect x="${x}" y="${y}" width="176" height="114" rx="22" fill="#102238" stroke="${card.color}" stroke-opacity=".54"/>
        <text x="${x + 88}" y="${y + 43}" text-anchor="middle" fill="${card.color}" font-size="29" font-weight="500">${card.icon}</text>
        <text x="${x + 88}" y="${y + 71}" text-anchor="middle" fill="#F5F7FB" font-size="${index === 1 ? 12 : 14}" font-weight="700" letter-spacing="1">${card.title}</text>
        <text x="${x + 88}" y="${y + 94}" text-anchor="middle" fill="#B5C2D3" font-size="12">${card.note}</text>
      </g>`;
    })
    .join("");
}

function flood(time) {
  const drops = [0, 1, 2, 3, 4]
    .map((index) => {
      const x = 246 + index * 54;
      const y = 157 + ((time * 33 + index * 45) % 92);
      return `<path d="M${x} ${y - 8}q-11 15 0 18q11-3 0-18" fill="#68CFFF" opacity=".8"/>`;
    })
    .join("");
  return `
    <path d="M150 274h420v69H150z" fill="#102238" stroke="#35516C" stroke-width="2"/>
    <path d="M150 274h420M150 302h420M150 330h420M220 274v69m70-69v69m70-69v69m70-69v69m70-69v69" stroke="#253A50" stroke-width="1"/>
    <path d="M165 280h56v35h-56zm76-18h48v53h-48zm64 8h55v45h-55zm74-17h49v62h-49zm66 23h56v39h-56z" fill="#1D3D52" stroke="#6D93A7" stroke-width="2"/>
    <path d="M150 321q55-13 110 0t110 0t110 0t110 0v22H150z" fill="#3AA4D6" fill-opacity=".77"/>
    ${drops}
    <text x="360" y="376" text-anchor="middle" fill="#8FD8F0" font-size="13" letter-spacing="3">HUJAN  ·  KOTA  ·  DAERAH</text>`;
}

function renderVisual(kind, time) {
  if (kind === "layers") return layers(time);
  if (kind === "approaches") return approaches(time);
  if (kind === "flood") return flood(time);
  return globe(time, kind === "intro" ? 122 : 113);
}

function renderFrame(seconds) {
  let sceneIndex = scenes.length - 1;
  for (let index = 0; index < scenes.length; index += 1) {
    if (seconds < scenes[index].start + 10) {
      sceneIndex = index;
      break;
    }
  }

  const scene = scenes[sceneIndex];
  const localTime = seconds - scene.start;
  const fadeIn = Math.min(1, localTime / 0.55);
  const fadeOut = Math.min(1, (10 - localTime) / 0.45);
  const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
  const titleSize = scene.title.some((line) => line.length > 18) ? 48 : 56;
  const titleStart = 500 - (scene.title.length - 1) * 35;
  const subtitleStart = titleStart + scene.title.length * 69 + 29;
  const subtitleSize = scene.subtitle.some((line) => line.length > 43) ? 19 : 21;
  const subtitleHeight = 34;
  const decoOffset = (seconds * 18) % WIDTH;
  const stars = Array.from({ length: 20 }, (_, index) => {
    const x = (index * 197 + 31) % WIDTH;
    const y = 94 + ((index * 131) % 1050);
    const opacityStar = (0.18 + ((index * 17) % 50) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${index % 5 === 0 ? 2 : 1}" fill="#D9F9F4" opacity="${opacityStar}"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#081421"/><stop offset=".58" stop-color="#0B1C2C"/><stop offset="1" stop-color="#11273A"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#47D7C6" stop-opacity=".16"/><stop offset="1" stop-color="#47D7C6" stop-opacity="0"/></radialGradient>
      <linearGradient id="earth" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#187F91"/><stop offset=".57" stop-color="#185B80"/><stop offset="1" stop-color="#202F70"/></linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#00101D" stop-opacity=".36"/><stop offset=".55" stop-color="#00101D" stop-opacity="0"/><stop offset="1" stop-color="#00101D" stop-opacity=".34"/></linearGradient>
    </defs>
    <rect width="720" height="1280" fill="url(#bg)"/>
    <circle cx="360" cy="280" r="290" fill="url(#glow)"/>
    <path d="M${decoOffset - WIDTH} 986l${WIDTH} -250M${decoOffset} 986l${WIDTH} -250M${decoOffset + WIDTH} 986l${WIDTH} -250" stroke="#B4F7EB" stroke-opacity=".035" stroke-width="1"/>
    ${stars}
    <g opacity="${opacity.toFixed(3)}">
      <rect x="236" y="66" width="248" height="34" rx="17" fill="#FFFFFF" fill-opacity=".055" stroke="#FFFFFF" stroke-opacity=".1"/>
      <text x="360" y="88" text-anchor="middle" fill="#B5C2D3" font-size="13" font-weight="700" letter-spacing="2">GEOGRAFI  ·  KELAS X</text>
      ${renderVisual(scene.visual, seconds)}
      <rect x="245" y="428" width="230" height="30" rx="15" fill="#52E2D0" fill-opacity=".12"/>
      <text x="360" y="448" text-anchor="middle" fill="#77EBDD" font-size="12" font-weight="700" letter-spacing="2">${scene.tag}</text>
      ${textLines(scene.title, 360, titleStart, 70, titleSize, COLORS.white, 750)}
      ${textLines(scene.subtitle, 360, subtitleStart, subtitleHeight, subtitleSize, COLORS.muted)}
      <rect x="264" y="1081" width="192" height="1" fill="#EAF7FF" fill-opacity=".16"/>
      <text x="360" y="1115" text-anchor="middle" fill="#F5F7FB" font-size="16" font-weight="650" letter-spacing="1">${sceneIndex === 0 || sceneIndex === scenes.length - 1 ? "RIKAYA NURCAHYA" : "RINGKAS • JELAS • GEOGRAFI"}</text>
      <text x="360" y="1143" text-anchor="middle" fill="#8095AA" font-size="12" letter-spacing="2">BELAJAR MEMBACA BUMI</text>
      <rect x="186" y="1181" width="348" height="3" rx="1.5" fill="#FFFFFF" fill-opacity=".13"/>
      <rect x="186" y="1181" width="${(348 * seconds / DURATION).toFixed(1)}" height="3" rx="1.5" fill="#52E2D0"/>
    </g>
  </svg>`;
}

async function renderFrames(directory) {
  await fs.mkdir(directory, { recursive: true });
  let nextFrame = 0;
  const concurrency = 4;
  async function renderWorker() {
    while (true) {
      const frame = nextFrame;
      nextFrame += 1;
      if (frame >= FRAME_COUNT) return;
      const svg = Buffer.from(renderFrame(frame / FPS));
      const filename = path.join(directory, `frame-${String(frame).padStart(5, "0")}.png`);
      await sharp(svg).png({ compressionLevel: 1 }).toFile(filename);
      if (frame > 0 && frame % 240 === 0) {
        process.stdout.write(`Rendered ${frame}/${FRAME_COUNT} frames\n`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, renderWorker));
}

function encodeVideo(framesDirectory) {
  const filter = [
    "[1:a]volume=0.035[a1]",
    "[2:a]volume=0.025[a2]",
    "[3:a]volume=0.018[a3]",
    "[a1][a2][a3]amix=inputs=3:duration=longest[bed]",
    "[bed]afade=t=in:st=0:d=2,afade=t=out:st=58:d=2[audio]",
  ].join(";");
  const result = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-loglevel", "error",
      "-y",
      "-framerate", String(FPS),
      "-i", path.join(framesDirectory, "frame-%05d.png"),
      "-f", "lavfi", "-i", `sine=frequency=110:sample_rate=44100:duration=${DURATION}`,
      "-f", "lavfi", "-i", `sine=frequency=164.81:sample_rate=44100:duration=${DURATION}`,
      "-f", "lavfi", "-i", `sine=frequency=220:sample_rate=44100:duration=${DURATION}`,
      "-filter_complex", filter,
      "-map", "0:v:0",
      "-map", "[audio]",
      "-frames:v", String(FRAME_COUNT),
      "-t", String(DURATION),
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "19",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      OUTPUT,
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `FFmpeg exited with ${result.status}`);
}

async function main() {
  const framesDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "geografi-reels-"));
  try {
    console.log(`Rendering ${FRAME_COUNT} frames at ${WIDTH}x${HEIGHT}...`);
    await renderFrames(framesDirectory);
    console.log("Encoding MP4 with FFmpeg...");
    encodeVideo(framesDirectory);
    const stats = await fs.stat(OUTPUT);
    console.log(`Done: ${OUTPUT} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
  } finally {
    await fs.rm(framesDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("Video render failed:", error);
  process.exitCode = 1;
});
