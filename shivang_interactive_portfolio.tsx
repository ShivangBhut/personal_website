import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

const Button = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: string;
}) => <button className={className}>{children}</button>;

type IconProps = {
  className?: string;
};

type View = "home" | "main" | "projects" | "contact";

type Viewport = {
  width: number;
  height: number;
};

type MousePoint = {
  x: number;
  y: number;
};

type SystemTint = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type Star = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  rotation: number;
};

type Asteroid = {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  wobbleX: number;
  wobbleY: number;
  blurBoost: boolean;
  craterSeed: number;
};

type FloatingTiltCardProps = {
  children: React.ReactNode;
  className?: string;
  floatY?: number;
  floatDuration?: number;
  floatDelay?: number;
  hoverLift?: number;
  hoverScale?: number;
  tilt?: number;
};

function FloatingTiltCard({
  children,
  className,
  floatY = 8,
  floatDuration = 4,
  floatDelay = 0,
  hoverLift = 10,
  hoverScale = 1.02,
  tilt = 5,
}: FloatingTiltCardProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const smoothRotateX = useSpring(rotateX, { stiffness: 180, damping: 20, mass: 0.7 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 180, damping: 20, mass: 0.7 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const nextRotateX = ((centerY - y) / centerY) * tilt;
    const nextRotateY = ((x - centerX) / centerX) * tilt;

    rotateX.set(nextRotateX);
    rotateY.set(nextRotateY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      whileHover={{ y: -hoverLift, scale: hoverScale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function IconBase({ className = "h-4 w-4", children }: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5" />
      <path d="m11 19-7-7 7-7" />
    </IconBase>
  );
}

function CursorTrail({ x, y }: MousePoint) {
  return (
    <motion.div
      className="pointer-events-none fixed z-[60] h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 blur-xl"
      animate={{ x: x - 16, y: y - 16 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    />
  );
}

function StarField({ viewport, entered }: { viewport: Viewport; entered: boolean }) {
  const stars = useMemo<Star[]>(() => {
    const count = Math.min(140, Math.max(70, Math.floor(viewport.width / 14)));
    const seeded = (seed: number) => {
      const x = Math.sin(seed * 9999.91) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${4 + seeded((i + 1) * 1.17) * 92}%`,
      top: `${4 + seeded((i + 1) * 2.41) * 92}%`,
      size: 10 + Math.floor(seeded((i + 1) * 3.13) * 4) * 4,
      delay: seeded((i + 1) * 4.19) * 2.4,
      duration: 1.8 + seeded((i + 1) * 5.27) * 2.1,
      opacity: 0.25 + seeded((i + 1) * 6.31) * 0.25,
      rotation: seeded((i + 1) * 7.73) * 180,
    }));
  }, [viewport.width]);

  return (
    <div className="absolute inset-0 z-[1]">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
          animate={{
            opacity: [star.opacity, Math.min(0.7, star.opacity + 0.25), star.opacity],
            scale: [1, 1.15, 1],
            rotate: [star.rotation, star.rotation + 10, star.rotation],
          }}
          transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut", delay: star.delay }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full"
            style={{
              filter: entered
                ? "drop-shadow(0 0 6px rgba(255,255,255,0.5))"
                : "drop-shadow(0 0 4px rgba(255,255,255,0.4))",
            }}
            aria-hidden="true"
          >
            <path
              d="M12 1.5 L14.1 9.9 L22.5 12 L14.1 14.1 L12 22.5 L9.9 14.1 L1.5 12 L9.9 9.9 Z"
              fill="rgba(255,255,255,0.75)"
            />
            <circle cx="12" cy="12" r="1.4" fill="rgba(255,255,255,0.8)" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function PlanetLayer({ entered }: { entered: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-[6%] top-[16%] h-28 w-28 rounded-full border border-white/10"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), rgba(129,140,248,0.28) 30%, rgba(59,130,246,0.16) 55%, rgba(0,0,0,0) 75%)",
          boxShadow: "0 0 70px rgba(96,165,250,0.14)",
        }}
        animate={{ y: [0, -18, 0], x: [0, 10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[10%] top-[12%] h-44 w-44 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,244,214,0.95), rgba(250,204,21,0.26) 28%, rgba(244,114,182,0.14) 55%, rgba(0,0,0,0) 76%)",
          boxShadow: "0 0 120px rgba(250,204,21,0.14)",
        }}
        animate={{ y: [0, 16, 0], x: [0, -16, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-[190%] w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          style={{ transform: "translate(-50%, -50%) rotate(20deg)" }}
          animate={{ rotate: entered ? 360 : 220 }}
          transition={{ duration: entered ? 18 : 28, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-[10%] left-[28%] h-20 w-20 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(167,139,250,0.22) 35%, rgba(34,211,238,0.12) 62%, rgba(0,0,0,0) 78%)",
          boxShadow: "0 0 60px rgba(168,85,247,0.14)",
        }}
        animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function RocketEntry({ entered, onEnter }: { entered: boolean; onEnter: () => void }) {
  if (entered) return null;

  return (
    <motion.button
      type="button"
      onClick={onEnter}
      className="absolute right-[20%] top-[60%] z-30 cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [0, -8, 0], x: [0, -6, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      aria-label="Enter system"
    >
      <div className="relative flex items-center justify-center cursor-pointer">
        <span className="select-none text-[11rem] drop-shadow-[0_0_40px_rgba(255,255,255,0.45)] md:text-[12rem]">🚀</span>
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-[50%] -translate-y-[10%] rotate-[18deg] text-center text-[10px] font-bold uppercase tracking-[0.16em] md:text-[12px]">
          <span className="bg-gradient-to-b from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-transparent opacity-90">
            Enter
          </span>
        </span>
      </div>
    </motion.button>
  );
}

function AmbientRocket() {
  const [position, setPosition] = useState({ x: 20, y: 70 });
  const [boost, setBoost] = useState(false);

  useEffect(() => {
    const move = setInterval(() => {
      setPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
    }, 6000);
    return () => clearInterval(move);
  }, []);

  useEffect(() => {
    const boostTimer = setInterval(() => {
      if (Math.random() > 0.6) {
        setBoost(true);
        setTimeout(() => setBoost(false), 1200);
      }
    }, 5000);
    return () => clearInterval(boostTimer);
  }, []);

  const scale = 0.8 + (position.y / 100) * 0.5;

  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      animate={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        rotate: boost ? [0, 20, -20, 0] : [0, 8, -8, 0],
        scale: boost ? scale + 0.15 : scale,
      }}
      transition={{ duration: boost ? 1.2 : 6, ease: boost ? "easeOut" : "easeInOut" }}
    >
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-2xl opacity-70" />
      <span className={`relative text-5xl ${boost ? "drop-shadow-[0_0_25px_rgba(34,211,238,0.9)]" : "opacity-80"}`}>
        🚀
      </span>
    </motion.div>
  );
}

function AsteroidBelt({ entered }: { entered: boolean }) {
  const asteroids = useMemo<Asteroid[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        top: 20 + i * 3.4,
        left: -10 - i * 5,
        size: 10 + (i % 4) * 6,
        duration: 20 + (i % 5) * 5,
        delay: i * 0.8,
        rotate: i % 2 === 0 ? 220 : -220,
        wobbleX: i % 2 === 0 ? 4 + (i % 3) : -(4 + (i % 3)),
        wobbleY: 3 + (i % 4),
        blurBoost: i % 4 === 0,
        craterSeed: i + 1,
      })),
    []
  );

  const shapes = [
    "polygon(50% 0%, 80% 20%, 100% 55%, 75% 100%, 30% 90%, 0% 60%, 15% 20%)",
    "polygon(40% 0%, 85% 25%, 100% 70%, 60% 100%, 10% 85%, 0% 40%)",
    "polygon(50% 0%, 100% 35%, 80% 100%, 20% 90%, 0% 40%)",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {asteroids.map((a, i) => {
        const craters = [
          { left: `${18 + ((a.craterSeed * 13) % 38)}%`, top: `${22 + ((a.craterSeed * 17) % 34)}%`, size: 18 },
          { left: `${48 + ((a.craterSeed * 7) % 24)}%`, top: `${40 + ((a.craterSeed * 11) % 22)}%`, size: 12 },
          { left: `${28 + ((a.craterSeed * 5) % 30)}%`, top: `${58 + ((a.craterSeed * 19) % 18)}%`, size: 10 },
        ];

        return (
          <motion.div
            key={a.id}
            className="absolute"
            style={{
              top: `${a.top}%`,
              left: `${a.left}%`,
              width: a.size,
              height: a.size,
              clipPath: shapes[i % shapes.length],
              background: "linear-gradient(145deg, rgba(148,163,184,0.62), rgba(71,85,105,0.95))",
              boxShadow:
                "inset -2px -3px 6px rgba(0,0,0,0.65), inset 2px 2px 4px rgba(255,255,255,0.08), 0 0 14px rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            animate={{
              x: ["0vw", "120vw"],
              y: [0, entered ? 50 + a.wobbleY : 25 + a.wobbleY, -a.wobbleY, 0],
              rotate: [0, a.rotate * 0.4, a.rotate],
              opacity: [0, 0.9, 0.9, 0],
              skewX: [0, a.wobbleX * 0.15, 0],
              filter: a.blurBoost
                ? [
                    "blur(0px) drop-shadow(0 0 4px rgba(255,255,255,0.08))",
                    "blur(1.2px) drop-shadow(0 0 6px rgba(255,255,255,0.12))",
                    "blur(0px) drop-shadow(0 0 4px rgba(255,255,255,0.08))",
                  ]
                : "none",
            }}
            transition={{ duration: a.duration, delay: a.delay, repeat: Infinity, ease: "linear" }}
          >
            {craters.map((crater, idx) => (
              <span
                key={idx}
                className="absolute rounded-full"
                style={{
                  left: crater.left,
                  top: crater.top,
                  width: `${Math.max(2, (a.size * crater.size) / 100)}px`,
                  height: `${Math.max(2, (a.size * crater.size) / 100)}px`,
                  background: "radial-gradient(circle at 35% 35%, rgba(30,41,59,0.55), rgba(15,23,42,0.9))",
                  boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.05), inset -1px -1px 2px rgba(0,0,0,0.5)",
                  opacity: 0.75,
                }}
              />
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}

function AdaptiveEnvironment({
  mouse,
  entered,
  viewport,
  systemTint,
}: {
  mouse: MousePoint;
  entered: boolean;
  viewport: Viewport;
  systemTint: SystemTint;
}) {
  const intensity = entered ? 1 : 0.7;
  const gradientSize = Math.max(340, Math.min(680, viewport.width * 0.34));
  const mx = mouse.x || viewport.width / 2;
  const my = mouse.y || viewport.height / 2;
  const hour = new Date().getHours();
  const nightBoost = hour >= 19 || hour <= 5 ? 1 : 0.78;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#05070d]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0b1120_0%,#070b14_38%,#05070d_72%)]" />
      <StarField viewport={viewport} entered={entered} />
      <PlanetLayer entered={entered} />
      <AsteroidBelt entered={entered} />
      {entered && <AmbientRocket />}

      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: gradientSize,
          height: gradientSize,
          background: `radial-gradient(circle, rgba(${systemTint.primary},${0.26 * intensity * nightBoost}) 0%, rgba(${systemTint.secondary},${0.16 * intensity}) 38%, rgba(0,0,0,0) 72%)`,
        }}
        animate={{ left: mx - gradientSize / 2, top: my - gradientSize / 2 }}
        transition={{ type: "spring", stiffness: 38, damping: 18, mass: 1.1 }}
      />

      <motion.div
        className="absolute -left-24 top-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: `rgba(${systemTint.secondary},${0.15 * intensity})` }}
        animate={{ x: [0, 60, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 right-[-4rem] h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: `rgba(${systemTint.tertiary},${0.12 * intensity})` }}
        animate={{ x: [0, -50, 20, 0], y: [0, -30, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: `${Math.max(34, Math.floor(viewport.width / 34))}px ${Math.max(34, Math.floor(viewport.width / 34))}px`,
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-[0.14]"
        animate={{ backgroundPositionY: ["0px", "100px"] }}
        transition={{ duration: entered ? 5 : 9, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0) 2px)",
          backgroundSize: "100% 10px",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_42%)]" />
      <div
        className="absolute inset-0 mix-blend-screen opacity-[0.04]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\" opacity=\"0.45\"/%3E%3C/svg%3E')",
        }}
      />
    </div>
  );
}

function BootSequence({ onDone, systemTint }: { onDone: () => void; systemTint: SystemTint }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [0, 1, 2, 3, 4].map((_, i) => window.setTimeout(() => setStep(i), i * 650));
    const done = window.setTimeout(() => onDone(), 3600);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(done);
    };
  }, [onDone]);

  const lines = [
    "[SYS] initializing interactive environment",
    "[NET] syncing motion, cursor and viewport layers",
    "[DATA] loading projects, signals and visual modules",
    "[UI ] activating space scene modules",
    "[OK ] portfolio system ready",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
    >
      <div className="w-[92vw] max-w-3xl rounded-3xl border border-white/10 bg-black/70 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
          <span>boot sequence</span>
          <span style={{ color: `rgb(${systemTint.secondary})` }}>live init</span>
        </div>
        <div className="space-y-3 font-mono text-sm md:text-base" style={{ color: `rgb(${systemTint.primary})` }}>
          {lines.slice(0, step + 1).map((line) => (
            <motion.div key={line} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              {line}
            </motion.div>
          ))}
        </div>
        <div className="mt-6 h-2 rounded-full bg-white/10">
          <motion.div
            className="h-2 rounded-full"
            style={{ background: `linear-gradient(to right, rgb(${systemTint.primary}), rgb(${systemTint.secondary}))` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (step + 1) * 20)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function Typewriter({ text, active = true }: { text: string; active?: boolean }) {
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!active) {
      setOut(text);
      return;
    }

    let i = 0;
    const id = window.setInterval(() => {
      setOut(text.slice(0, i++));
      if (i > text.length) window.clearInterval(id);
    }, 32);

    return () => window.clearInterval(id);
  }, [text, active]);

  return <span>{out}</span>;
}

export default function Portfolio() {
  const skillsRef = useRef<HTMLElement | null>(null);
  const experienceRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const [proximity, setProximity] = useState(0);
  const [mouse, setMouse] = useState<MousePoint>({ x: 520, y: 320 });
  const [boot, setBoot] = useState(false);
  const [view, setView] = useState<View>("home");
  const [viewport, setViewport] = useState<Viewport>({ width: 1280, height: 800 });
  const [skillFilter, setSkillFilter] = useState<string>("all");

  const entered = view !== "home";

  useEffect(() => {
    const move = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("mousemove", move);
    window.addEventListener("resize", resize);
    resize();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const systemTint = useMemo<SystemTint>(() => {
    const prefersLight =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: light)").matches;

    if (prefersLight) {
      return { primary: "99,102,241", secondary: "6,182,212", tertiary: "236,72,153" };
    }

    return entered
      ? { primary: "34,211,238", secondary: "232,121,249", tertiary: "250,204,21" }
      : { primary: "250,204,21", secondary: "34,211,238", tertiary: "168,85,247" };
  }, [entered]);

  const enterSystem = () => {
    if (entered || boot) return;
    setBoot(true);
  };

  const finishBoot = () => {
    setBoot(false);
    setView("main");
  };

  const exitSystem = () => {
    if (boot) return;
    setView("home");
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navigateToMainSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (view !== "main") {
      setView("main");
      window.setTimeout(() => {
        scrollToSection(ref);
      }, 120);
      return;
    }

    scrollToSection(ref);
  };

  useEffect(() => {
    if (!headingRef.current) return;

    const rect = headingRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = mouse.x - centerX;
    const dy = mouse.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 400;
    setProximity(Math.max(0, 1 - dist / maxDist));
  }, [mouse]);

  const skillGroups = [
    {
      title: "Technical",
      key: "dev",
      items: [
        "Python",
        "Java",
        "JavaScript",
        "React",
        "Node",
        "C",
        "C++",
        "C#",
        "HTML",
        "CSS",
        "Debugging",
        "CI/CD",
        "API Configuration",
        "API Testing",
      ],
    },
    {
      title: "Data & Databases",
      key: "data",
      items: [
        "ETL Pipelines",
        "SQL (PostgreSQL | MySQL)",
        "Machine Learning",
        "Deep Learning",
        "Regression",
        "Hypothesis Testing",
        "ANOVA",
        "Data Modeling",
        "Data Visualization",
      ],
    },
    {
      title: "AI & Analysis",
      key: "ai",
      items: ["Power BI", "R Studio", "Tableau"],
    },
    {
      title: "Project Management & Systems",
      key: "pm",
      items: [
        "Git",
        "Jira",
        "Agile",
        "Scrum",
        "AWS",
        "Azure",
        "Software Development Life Cycle (SDLC)",
        "Software Architecture",
        "Software Reengineering",
        "Linux",
        "Ubuntu",
        "macOS",
        "Windows",
      ],
    },
    {
      title: "Communication & Behavioral",
      key: "comm",
      items: [
        "Technical Docs",
        "Stakeholder Communication",
        "Collaborative",
        "Problem Solving",
        "Adaptability",
        "Leadership",
        "Workload Management",
        "Critical Thinking",
        "Team Player",
      ],
    },
  ] as const;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&display=swap');`}</style>

      <div
        className="min-h-screen overflow-hidden bg-transparent text-white selection:bg-fuchsia-300/30 selection:text-white"
        style={{ fontFamily: '"Inter Tight", Inter, system-ui, sans-serif' }}
      >
        <AdaptiveEnvironment mouse={mouse} entered={entered} viewport={viewport} systemTint={systemTint} />
        <CursorTrail x={mouse.x} y={mouse.y} />

        {!entered && (
          <div className="pointer-events-none fixed inset-0 z-20">
            <div className="pointer-events-auto relative h-full w-full">
              <RocketEntry entered={entered} onEnter={enterSystem} />
            </div>
          </div>
        )}

        <AnimatePresence>{boot ? <BootSequence onDone={finishBoot} systemTint={systemTint} /> : null}</AnimatePresence>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-8 lg:px-10">
          <motion.header
            className="relative z-40 mb-10 flex items-center justify-between rounded-full border border-white/10 bg-black/25 px-5 py-3 backdrop-blur-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {entered ? (
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    onClick={exitSystem}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-200 transition hover:bg-white/[0.12]"
                    aria-label="Exit system"
                    title="Back"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </motion.button>
                ) : null}
              </AnimatePresence>

              <div>
                <div className="bg-gradient-to-r from-amber-200 via-fuchsia-200 to-cyan-200 bg-clip-text text-sm font-semibold tracking-[0.28em] text-transparent">
                  SHIVANG BHUT
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">Welcome to my world</div>
              </div>
            </div>

            {entered && (
              <div className="hidden items-center gap-6 text-xs uppercase tracking-[0.25em] text-zinc-400 md:flex">
                <button type="button" onClick={() => navigateToMainSection(skillsRef)} className="transition hover:text-white">
                  Skills
                </button>
                <button type="button" onClick={() => navigateToMainSection(experienceRef)} className="transition hover:text-white">
                  Experiences & Volunteering
                </button>
                <button
                  type="button"
                  onClick={() => setView("projects")}
                  className={`transition hover:text-white ${view === "projects" ? "text-white" : ""}`}
                >
                  Projects
                </button>
                <button
                  type="button"
                  onClick={() => setView("contact")}
                  className={`transition hover:text-white ${view === "contact" ? "text-white" : ""}`}
                >
                  Contact
                </button>
              </div>
            )}
          </motion.header>

          <div className="mt-36 grid items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <motion.h1
                ref={headingRef}
                className="max-w-4xl bg-gradient-to-r from-amber-200 via-fuchsia-200 to-cyan-200 bg-[length:200%_100%] bg-clip-text text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-transparent md:text-7xl lg:text-[86px]"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  transform: `scale(${1 + proximity * 0.08})`,
                  filter: `drop-shadow(0 0 ${20 * proximity}px rgba(255,255,255,0.6))`,
                }}
              >
                <Typewriter
                  text={
                    entered
                      ? view === "projects"
                        ? "Turning data, systems, and real-world problems into working solutions"
                        : view === "contact"
                          ? "Let’s build something meaningful together."
                          : "Building systems that turn data into decisions."
                      : "About Me"
                  }
                  active={!entered}
                />
              </motion.h1>

              <motion.p
                className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-8 text-zinc-400"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {entered
                  ? view === "projects"
                    ? "A selection of work focused on backend systems, data pipelines, automation, analytics, and business-facing digital products."
                    : view === "contact"
                      ? "Open to opportunities, collaborations, and conversations around software, data systems, analytics, and real-world product development."
                      : "Full Stack Developer focused on backend systems, data pipelines, and real-world problem solving."
                  : "I am a Full Stack Developer and a graduate from the University of Saskatchewan with a Bachelor’s in Applied Computing, along with a strong foundation in statistical methods. My academic journey focused on areas like Object-Oriented Programming, Data Structures, Algorithms, Software Engineering, Web Development, Databases, Machine Learning, and mathematical foundations such as Probability, Calculus, and Regression.\n\nOver time, I’ve developed my expertise through hands-on experience as a software developer, where I design backend architectures, manage databases, and build systems that transform complex, messy data into clear, actionable insights using ETL processes. I also work with machine learning and data-driven systems to support smarter decision-making.\n\nI enjoy solving real-world problems by combining structured thinking with practical implementation — building systems that are not just functional, but efficient, scalable, and meaningful."}
              </motion.p>

              {!entered && (
                <motion.div
                  className="mt-8 flex flex-wrap gap-3"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                >
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 backdrop-blur-xl">
                    Use the rocket to enter the system
                  </div>
                </motion.div>
              )}
            </div>
            <div />
          </div>

          <AnimatePresence mode="wait">
            {view === "main" ? (
              <motion.section
                key="main-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.15 }}
                className="mt-14"
              >
                <div className="space-y-16">
                  <section ref={skillsRef}>
                    <h2 className="mb-6 text-3xl font-semibold">Skills</h2>

                    <div className="mb-6 flex flex-wrap gap-3">
                      {[
                        { key: "all", label: "All" },
                        { key: "dev", label: "Developer" },
                        { key: "data", label: "Data & Databases" },
                        { key: "pm", label: "Project Management & Systems" },
                        { key: "ai", label: "AI & Analysis" },
                        { key: "comm", label: "Communication & Behavioral" },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setSkillFilter(f.key)}
                          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition ${
                            skillFilter === f.key
                              ? "border-white bg-white text-black"
                              : "border-white/20 text-zinc-400 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="max-w-5xl space-y-6">
                      {skillGroups.map((group) => {
                        if (skillFilter !== "all" && group.key !== skillFilter) return null;

                        return (
                          <div key={group.title}>
                            <h3 className="mb-3 text-lg font-semibold text-white">{group.title}</h3>
                            <div className="flex flex-wrap gap-3">
                              {group.items.map((skill) => (
                                <motion.div
                                  key={skill}
                                  whileHover={{ scale: 1.08 }}
                                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl transition duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                                >
                                  {skill}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section ref={experienceRef}>
                    <h2 className="mb-8 text-3xl font-semibold">Experience</h2>

                    <div className="max-w-5xl space-y-10">
                      <div className="relative border-l border-white/10 pl-6">
                        <div className="absolute left-[-6px] top-2 h-3 w-3 rounded-full bg-cyan-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">Full Stack Developer at Rivera</h3>
                          <p className="text-sm text-zinc-500">Nov 2025 – Feb 2026</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {["PostgreSQL", "Supabase", "Python", "APIs", "CatBoost", "ETL", "Backend Architecture"].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>

                        <p className="mt-4 leading-7 text-zinc-400">
                          Designed and built an app that transforms raw and fragmented real estate data into structured,
                          actionable insights. Developed scalable backend pipelines, optimized database performance, and
                          automated workflows to improve system efficiency and reliability.
                        </p>

                        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                          <li>• Designed, coded, tested, and implemented a production CRM intelligence system handling 2,000+ client records across multiple datasets.</li>
                          <li>• Implemented system enhancements and new features based on evolving business requirements.</li>
                          <li>• Monitored production system performance and resolved issues impacting system functionality and user experience.</li>
                          <li>• Investigated system problems, performed root cause analysis, and implemented corrective solutions to prevent recurrence.</li>
                          <li>• Maintained system documentation, workflows, and configuration to support system stability and user adoption.</li>
                          <li>• Collaborated with stakeholders to gather requirements and deliver reliable system solutions.</li>
                          <li>• Documented system architecture, processes, and workflows to support maintainability and future enhancements.</li>
                        </ul>
                      </div>

                      <div className="relative border-l border-white/10 pl-6">
                        <div className="absolute left-[-6px] top-2 h-3 w-3 rounded-full bg-fuchsia-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">Full Stack Developer at R&T Sales</h3>
                          <p className="text-sm text-zinc-500">Sep 2025 – Present</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {["React", "JavaScript", "Frontend", "Backend", "E-commerce", "Technical Support"].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-200"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>

                        <p className="mt-4 leading-7 text-zinc-400">
                          Developed and maintained a production-ready e-commerce platform, ensuring smooth user
                          experience and reliable system performance. Worked across both frontend and backend to support
                          real-world business operations and customer interactions.
                        </p>

                        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                          <li>• Designed, developed, tested, and supported a live web-based application and e-commerce platform used for daily business operations.</li>
                          <li>• Diagnosed and resolved production issues to improve usability and platform reliability.</li>
                          <li>• Provided technical support for customer and internal queries, translating fixes for non-technical users.</li>
                          <li>• Enhanced site stability through continuous performance, usability, and functionality improvements.</li>
                          <li>• Worked across frontend and backend components to support business requirements and rapid issue resolution.</li>
                          <li>• Helped maintain a dependable digital experience for both customers and internal users.</li>
                        </ul>
                      </div>

                      <div className="relative border-l border-white/10 pl-6">
                        <div className="absolute left-[-6px] top-2 h-3 w-3 rounded-full bg-amber-400" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">Customer Service Associate at Home Depot</h3>
                          <p className="text-sm text-zinc-500">Feb 2023 – Present</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {["SAP S/4HANA", "Operations", "Customer Support", "Issue Resolution", "Process Accuracy"].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>

                        <p className="mt-4 leading-7 text-zinc-400">
                          Gained hands-on experience working in a fast-paced operational environment, solving real-world
                          problems and supporting large-scale retail workflows.
                        </p>

                        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                          <li>• Supported enterprise production systems (SAP S/4HANA) by managing high-volume transactions, ensuring data accuracy and system reliability.</li>
                          <li>• Investigated and resolved system-related issues involving payments, invoices, and account discrepancies using structured problem analysis.</li>
                          <li>• Assisted in retrieval and validation of system data to support business operations and customer requirements.</li>
                          <li>• Monitored system usage and identified recurring issues, contributing to process and system improvements.</li>
                          <li>• Communicated technical solutions clearly to non-technical users, improving system understanding and user experience.</li>
                          <li>• Managed multiple system-related requests in a fast-paced environment while maintaining high accuracy and performance standards.</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-8 text-3xl font-semibold">Volunteering & Leadership</h2>

                    <div className="max-w-5xl space-y-10">
                      <div className="relative border-l border-white/10 pl-6">
                        <div className="absolute left-[-6px] top-2 h-3 w-3 rounded-full bg-purple-400" />

                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            Director of Undergraduate Cultural Events at Indian Student Association
                          </h3>
                          <p className="text-sm text-zinc-500">University of Saskatchewan</p>
                        </div>

                        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                          <li>• Organized and managed cultural programs to drive student engagement and community participation.</li>
                          <li>• Collaborated with campus groups to promote diversity, inclusion, and cross-cultural interaction.</li>
                          <li>• Built strong community connections by actively engaging and supporting students.</li>
                        </ul>
                      </div>

                      <div className="relative border-l border-white/10 pl-6">
                        <div className="absolute left-[-6px] top-2 h-3 w-3 rounded-full bg-emerald-400" />

                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            Health & Safety Committee Member at The Home Depot
                          </h3>
                          <p className="text-sm text-zinc-500">Saskatoon</p>
                        </div>

                        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                          <li>• Promoted safe workplace practices and guided employees on safety compliance standards.</li>
                          <li>• Assisted in organizing and supporting in-store community events focused on safe participation.</li>
                          <li>• Recognized as Health & Safety Employee of the Month for proactive contributions.</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              </motion.section>
            ) : null}

            {view === "projects" ? (
              <motion.section
                key="projects-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.15 }}
                className="mt-14"
              >
                <div className="space-y-10">
                  <section>
                    <h2 className="mb-8 text-3xl font-semibold">🛠️Projects</h2>

                    <div className="grid max-w-6xl gap-6 md:grid-cols-2">
                      <FloatingTiltCard floatY={8} floatDuration={4.2} hoverLift={12} hoverScale={1.02} tilt={5}>
                        <Card className="group relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-500 hover:border-cyan-300/35 hover:bg-white/[0.07] hover:shadow-[0_0_35px_rgba(34,211,238,0.12)]">
                          <CardContent className="space-y-5">
                            <div className="h-[2px] w-20 rounded-full bg-cyan-300/70 transition duration-500 group-hover:w-28 group-hover:bg-cyan-200"></div>

                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-2xl font-semibold text-white">Image Classification with ResNet18</h3>
                                <p className="mt-2 text-sm leading-7 text-zinc-400">
                                  Built an image classification project using the CIFAR-10 dataset to study how deep learning models work in real-world classification tasks.
                                  Cleaned and standardized raw image data, then developed a ResNet18 model from scratch using NumPy and core mathematical operations.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {["Python", "NumPy", "Deep Learning", "ResNet18", "CIFAR-10", "Data Cleaning", "Model Optimization"].map(
                                (tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition duration-300 hover:border-white/25 hover:text-white"
                                  >
                                    {tag}
                                  </span>
                                )
                              )}
                            </div>

                            <ul className="space-y-2 text-sm leading-7 text-zinc-400">
                              <li>• Worked with the CIFAR-10 dataset to classify images across multiple categories.</li>
                              <li>• Cleaned and standardized raw image data by identifying noisy images and normalizing image dimensions.</li>
                              <li>• Built a ResNet18-based model from scratch using NumPy and low-level mathematical operations.</li>
                              <li>• Improved model accuracy from 60% to 81.09% using data augmentation, cosine annealing, and batch normalization.</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </FloatingTiltCard>

                      <FloatingTiltCard floatY={9} floatDuration={4.5} floatDelay={0.2} hoverLift={12} hoverScale={1.02} tilt={5}>
                        <Card className="group relative overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-500 hover:border-fuchsia-300/35 hover:bg-white/[0.07] hover:shadow-[0_0_35px_rgba(232,121,249,0.12)]">
                          <CardContent className="space-y-5">
                            <div className="h-[2px] w-20 rounded-full bg-fuchsia-300/70 transition duration-500 group-hover:w-28 group-hover:bg-fuchsia-200"></div>
                            <div>
                              <h3 className="text-2xl font-semibold text-white">Bill Management System</h3>
                              <p className="mt-2 text-sm leading-7 text-zinc-400">
                                Production-ready digital platform developed to support real business operations, customer
                                interactions, and ongoing technical improvements. It is not just POS system, it has ROH business features such as inventory, Reports, POS.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {["Python", "MySQL", "Agile Principles", "Data-Centric Software Archicture", "Test driven Development()", "Software Development Life Cycle(SDLC)"].map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition duration-300 hover:border-white/25 hover:text-white"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <ul className="space-y-2 text-sm leading-7 text-zinc-400">
                              <li>• Developed a system to support invoicing, payment tracking, and financial reporting.</li>
                              <li>• Built backend logic in Python and integrated MySQL for structured data storage and retrieval.</li>
                              <li>• Designed the architecture using a data-centric blackboard model for modularity and maintainability.</li>
                              <li>• Applied Agile practices including sprint planning, stand-ups, retrospectives, user stories, and personas.</li>
                              <li>• Worked across roles such as Scrum Master, Developer, and Stakeholder Liaison during the project lifecycle.</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </FloatingTiltCard>

                      <FloatingTiltCard floatY={8} floatDuration={4.1} floatDelay={0.35} hoverLift={12} hoverScale={1.02} tilt={5}>
                        <Card className="group relative overflow-hidden rounded-3xl border border-amber-400/20 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-500 hover:border-amber-300/35 hover:bg-white/[0.07] hover:shadow-[0_0_35px_rgba(250,204,21,0.12)]">
                          <CardContent className="space-y-5">
                            <div className="h-[2px] w-20 rounded-full bg-amber-300/70 transition duration-500 group-hover:w-28 group-hover:bg-amber-200"></div>
                            <div>
                              <h3 className="text-2xl font-semibold text-white">Interactive Canola Production Map</h3>
                              <p className="mt-2 text-sm leading-7 text-zinc-400">
                                Built an interactive geospatial visualization of canola production across Saskatchewan using publicly available government data. Cleaned and processed
                                raw agricultural data, then mapped it onto regional coordinates to create a dynamic and visually accurate representation.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {["JavaScript", "D3.js", "Data Visualization", "Geospatial Data", "JSON", "Data Cleaning", "GIS"].map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition duration-300 hover:border-white/25 hover:text-white"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <ul className="space-y-2 text-sm leading-7 text-zinc-400">
                              <li>• Collected and analyzed canola production data from Government of Saskatchewan sources.</li>
                              <li>• Cleaned dataset by handling missing values and trimming outliers (5% from both ends).</li>
                              <li>• Used D3.js to structure and visualize data mapped to Saskatchewan regional coordinates.</li>
                              <li>• Integrated .js data with geographic JSON files to render an interactive province-level map.</li>
                              <li>• Built a dynamic visualization system to represent agricultural insights clearly and accurately.</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </FloatingTiltCard>

                      <FloatingTiltCard floatY={9} floatDuration={4.4} floatDelay={0.5} hoverLift={12} hoverScale={1.02} tilt={5}>
                        <Card className="group relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-500 hover:border-emerald-300/35 hover:bg-white/[0.07] hover:shadow-[0_0_35px_rgba(52,211,153,0.12)]">
                          <CardContent className="space-y-5">
                            <div className="h-[2px] w-20 rounded-full bg-emerald-300/70 transition duration-500 group-hover:w-28 group-hover:bg-emerald-200"></div>
                            <div>
                              <h3 className="text-2xl font-semibold text-white">Usask Runner</h3>
                              <p className="mt-2 text-sm leading-7 text-zinc-400">
                                Developed an endless runner game by integrating UI/UX, game mechanics, controls, sound design, and graphics into a cohesive interactive experience using
                                Unity. Focused on smooth gameplay, responsiveness, and overall user experience.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {["Unity", "C#", "Game Development", "UI/UX", "Agile Methodoligies", "Git", "Microsoft Visual Studio", "Test driven Development(TDD)", "Software Development Life Cycle(SDLC)"].map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition duration-300 hover:border-white/25 hover:text-white"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <ul className="space-y-2 text-sm leading-7 text-zinc-400">
                              <li>• Developed an endless runner game using Unity and C# with smooth gameplay mechanics.</li>
                              <li>• Integrated UI/UX elements, controls, animations, sound effects, and game logic.</li>
                              <li>• Ensured performance optimization for responsive and seamless gameplay experience.</li>
                              <li>• Followed Agile development with regular sprints and strong team collaboration.</li>
                              <li>• Used Git for version control and applied test-driven development practices.</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </FloatingTiltCard>
                    </div>
                  </section>
                </div>
              </motion.section>
            ) : null}

            {view === "contact" ? (
              <motion.section
                key="contact-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.15 }}
                className="mt-14"
              >
                <section className="max-w-6xl">
                  <div className="mb-10">
                    <div className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Final Transmission</div>
                    <h2 className="mt-3 bg-gradient-to-r from-white via-fuchsia-200 to-cyan-200 bg-clip-text text-4xl font-semibold text-transparent md:text-5xl">
                      Open Communication Channel
                    </h2>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                      If you’ve made it this far, you’re probably building something interesting. Let’s connect and turn it into
                      something real.
                    </p>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-6">
                      <FloatingTiltCard floatY={14} floatDuration={2.6} hoverLift={10} hoverScale={1.015} tilt={4}>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]">
                          <div className="text-xs uppercase tracking-[0.26em] text-cyan-300/70">[ System Note ]</div>
                          <h3 className="mt-4 text-3xl font-semibold text-white">Let’s Connect</h3>
                          <p className="mt-4 text-base leading-8 text-zinc-400">
                            I’m always open to discussing software, data systems, analytics, academic projects, and meaningful
                            opportunities where technology solves real problems.
                          </p>
                        </div>
                      </FloatingTiltCard>

                      <div className="space-y-4">
                        <FloatingTiltCard floatY={16} floatDuration={3} hoverLift={12} hoverScale={1.02} tilt={4}>
                          <div className="rounded-3xl border border-cyan-400/15 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:border-cyan-300/30 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/70">[ Channel ] Email</div>
                            <div className="mt-2 text-lg font-semibold text-white break-all">shivang.bhut@usask.ca</div>
                          </div>
                        </FloatingTiltCard>

                        <FloatingTiltCard floatY={14} floatDuration={3} floatDelay={0.4} hoverLift={12} hoverScale={1.02} tilt={4}>
                          <div className="rounded-3xl border border-fuchsia-400/15 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:border-fuchsia-300/30 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(232,121,249,0.14)]">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-300/70">
                              [ Signal ] Frequency
                            </div>

                            <div className="mt-4 flex items-center gap-4">
                              <a
                                href="https://www.linkedin.com/in/shivang-bhut-5a12541b8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white transition duration-300 hover:-translate-y-1 hover:scale-105 hover:border-fuchsia-300/40 hover:bg-black/50 hover:shadow-[0_0_20px_rgba(232,121,249,0.25)]"
                                title="LinkedIn"
                              >
                                <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-200 opacity-0 transition duration-300 group-hover:opacity-100">
                                  Open LinkedIn
                                </span>

                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-5 w-5 fill-current transition duration-300 group-hover:scale-110"
                                >
                                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1s2.49 1.12 2.49 2.5zM.22 8.98h4.54V24H.22V8.98zM7.98 8.98h4.35v2.05h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 6.99V24h-4.54v-7.54c0-1.8-.03-4.11-2.51-4.11-2.51 0-2.9 1.96-2.9 3.98V24H7.98V8.98z" />
                                </svg>
                              </a>

                              <a
                                href="https://github.com/ShivangBhut/rt-sales"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white transition duration-300 hover:-translate-y-1 hover:scale-105 hover:border-fuchsia-300/40 hover:bg-black/50 hover:shadow-[0_0_20px_rgba(232,121,249,0.25)]"
                                title="GitHub"
                              >
                                <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-200 opacity-0 transition duration-300 group-hover:opacity-100">
                                  Open GitHub
                                </span>

                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-5 w-5 fill-current transition duration-300 group-hover:scale-110"
                                >
                                  <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.1 3.29 9.43 7.86 10.96.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.13-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.52.11-3.18 0 0 .97-.31 3.18 1.19a11.03 11.03 0 012.9-.39c.99 0 1.99.13 2.9.39 2.2-1.5 3.17-1.19 3.17-1.19.63 1.66.23 2.88.11 3.18.75.81 1.2 1.85 1.2 3.11 0 4.43-2.7 5.4-5.28 5.68.41.35.77 1.03.77 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.66.79.55 4.56-1.53 7.85-5.86 7.85-10.96C23.25 5.48 18.27.5 12 .5z" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </FloatingTiltCard>

                        <FloatingTiltCard floatY={14} floatDuration={3} floatDelay={0.8} hoverLift={12} hoverScale={1.02} tilt={4}>
                          <div className="rounded-3xl border border-amber-400/15 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:border-amber-300/30 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-amber-300/70">[ Node ] Location</div>
                            <div className="mt-2 text-lg font-semibold text-white">Saskatoon, Saskatchewan, Canada</div>
                          </div>
                        </FloatingTiltCard>
                      </div>
                    </div>

                    <FloatingTiltCard floatY={17} floatDuration={3.2} floatDelay={0.3} hoverLift={8} hoverScale={1.01} tilt={3}>
                      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.055] hover:shadow-[0_0_35px_rgba(255,255,255,0.08)]">
                        <div className="mb-6 flex items-center justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Transmission Console</div>
                            <h3 className="mt-2 text-2xl font-semibold text-white">Send a Message</h3>
                          </div>
                          <div className="flex gap-2">
                            <span className="h-3 w-3 rounded-full bg-cyan-300/70"></span>
                            <span className="h-3 w-3 rounded-full bg-fuchsia-300/70"></span>
                            <span className="h-3 w-3 rounded-full bg-amber-300/70"></span>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-300">Identity</label>
                            <input
                              type="text"
                              placeholder="Enter your name"
                              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-cyan-300/40 focus:bg-black/35"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-300">Contact Channel</label>
                            <input
                              type="email"
                              placeholder="name@example.com"
                              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-fuchsia-300/40 focus:bg-black/35"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-300">Transmission</label>
                            <textarea
                              rows={6}
                              placeholder="Write your message here..."
                              className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-amber-300/40 focus:bg-black/35"
                            />
                          </div>

                          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-zinc-500">Signal received here. I’ll get back to you soon.</p>

                            <Button className="rounded-full border border-white/10 bg-gradient-to-r from-cyan-500/80 via-blue-500/70 to-fuchsia-500/80 px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]">
                              Transmit Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </FloatingTiltCard>
                  </div>
                </section>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}