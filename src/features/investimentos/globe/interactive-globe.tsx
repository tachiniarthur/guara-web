"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

/** Um lugar marcado no globo (país onde o usuário tem investimentos). */
export type GlobePlace = {
  id: string;
  /** País (ISO 3166 numérico): os pontos dele ganham a cor do lugar. */
  iso: number;
  lat: number;
  lng: number;
  color: string;
  /** Texto curto do marcador (ex.: "Brasil · 82%"). */
  label: string;
};

/** Investimento sem país (ex.: cripto), mostrado na órbita ao redor do globo. */
export type GlobeOrbit = { id: string; color: string; label: string };

type InteractiveGlobeProps = {
  places: GlobePlace[];
  orbit?: GlobeOrbit;
  selectedId?: string | null;
  /** Escolhe um lugar (ou `null` para fechar os detalhes). */
  onSelect?: (id: string | null) => void;
  /** Lugar para onde o globo gira (ex.: ao escolher na lista ao lado). Mude `focusKey` para repetir. */
  focusId?: string | null;
  focusKey?: number;
  /** Descrição para leitores de tela. */
  label: string;
  className?: string;
};

const LAND = "#4A5E52";
const GRID = "#25322B";
const OUTLINE = "#34443B";
/** Raio do globo e da órbita em relação ao lado do quadro (igual à ilustração original). */
const GLOBE_RATIO = 0.4;
const ORBIT_RX = 0.472;
const ORBIT_RY = 0.144;
const ORBIT_TILT = (-18 * Math.PI) / 180;
const DEG = Math.PI / 180;
const MAX_TILT = 65;
const AUTO_SPEED = 4; // graus por segundo
const IDLE_RESUME_MS = 4000;

/** Rótulo HTML de um marcador, posicionado a cada quadro. */
type Label = {
  el: HTMLElement;
  x: number;
  y: number;
  shown: boolean;
  opacity: number;
  selected: boolean;
  /** Lado preferido em relação ao ponto: países acima, satélite abaixo. */
  prefer: "above" | "below";
};

type Dots = {
  cosLat: Float32Array;
  sinLat: Float32Array;
  lng: Float32Array;
  color: (string | null)[];
};

function buildDots(raw: Int16Array, places: GlobePlace[]): Dots {
  const n = raw.length / 3;
  const colorByIso = new Map(places.map((p) => [p.iso, p.color]));
  const dots: Dots = {
    cosLat: new Float32Array(n),
    sinLat: new Float32Array(n),
    lng: new Float32Array(n),
    color: new Array(n),
  };
  for (let i = 0; i < n; i++) {
    const lat = (raw[i * 3]! / 10) * DEG;
    dots.cosLat[i] = Math.cos(lat);
    dots.sinLat[i] = Math.sin(lat);
    dots.lng[i] = (raw[i * 3 + 1]! / 10) * DEG;
    dots.color[i] = colorByIso.get(raw[i * 3 + 2]!) ?? null;
  }
  return dots;
}

/** Leva o ângulo para o intervalo (−180, 180]. */
const wrap = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

/**
 * Globo de pontos que o usuário gira arrastando (mouse, toque ou setas do teclado).
 * Desenhado em canvas, só anima enquanto está na tela, e respeita "reduzir movimento".
 */
export function InteractiveGlobe({
  places,
  orbit,
  selectedId,
  onSelect,
  focusId,
  focusKey,
  label,
  className,
}: InteractiveGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef(new Map<string, HTMLElement>());
  const orbitRef = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);

  // Estado de animação fora do React (muda a cada quadro).
  const view = useRef({
    lambda: 60, // −longitude no centro: começa nas Américas
    phi: 12, // latitude no centro: mostra um pouco mais do hemisfério norte
    vLambda: 0,
    vPhi: 0,
    dragging: false,
    /** Mouse sobre o globo ou foco dentro dele: o giro automático pausa para facilitar o clique. */
    hovering: false,
    lastInteraction: 0,
    target: null as null | {
      lambda: number;
      phi: number;
      from: { lambda: number; phi: number };
      start: number;
    },
    orbitAngle: 170, // começa à esquerda, na metade da frente, e anda pela frente do globo
  });
  const dotsRef = useRef<Dots | null>(null);
  const selectedRef = useRef(selectedId);
  const renderRef = useRef<() => void>(() => {});
  const placesRef = useRef(places);
  const wake = useRef<() => void>(() => {});
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedRef.current = selectedId;
    renderRef.current();
  }, [selectedId]);

  // Pontos dos continentes: carregados sob demanda (arquivo separado do bundle principal).
  useEffect(() => {
    placesRef.current = places;
    let cancelled = false;
    import("./dots").then(({ GLOBE_DOTS }) => {
      if (cancelled) return;
      dotsRef.current = buildDots(GLOBE_DOTS, places);
      setReady(true);
      renderRef.current();
    });
    return () => {
      cancelled = true;
    };
  }, [places]);

  // Gira até o lugar escolhido fora do globo (lista ao lado).
  useEffect(() => {
    if (!focusId) return;
    const place = places.find((p) => p.id === focusId);
    if (!place) return;
    const v = view.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const goal = {
      lambda: v.lambda + wrap(-place.lng - v.lambda),
      phi: Math.max(-MAX_TILT, Math.min(MAX_TILT, place.lat * 0.8)),
    };
    v.vLambda = v.vPhi = 0;
    v.lastInteraction = performance.now();
    if (reduce) {
      v.lambda = goal.lambda;
      v.phi = goal.phi;
      v.target = null;
      renderRef.current();
    } else {
      v.target = { ...goal, from: { lambda: v.lambda, phi: v.phi }, start: performance.now() };
    }
    wake.current();
  }, [focusId, focusKey, places]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapEl = wrapRef.current;
    if (!canvas || !wrapEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let size = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();

    function resize() {
      const rect = wrapEl!.getBoundingClientRect();
      size = rect.width;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(size * dpr);
      canvas!.height = Math.round(size * dpr);
      render();
    }

    /** Projeta latitude/longitude (já em seno/cosseno) para a tela; z > 0 = lado visível. */
    function projector() {
      const v = view.current;
      const lam = v.lambda * DEG;
      const cp = Math.cos(v.phi * DEG);
      const sp = Math.sin(v.phi * DEG);
      const r = size * GLOBE_RATIO;
      const c = size / 2;
      return (cosLat: number, sinLat: number, lng: number) => {
        const l = lng + lam;
        const x = cosLat * Math.sin(l);
        const y = sinLat;
        const z = cosLat * Math.cos(l);
        const y2 = y * cp - z * sp;
        const z2 = y * sp + z * cp;
        return { x: c + r * x, y: c - r * y2, z: z2 };
      };
    }

    function drawOrbit(half: "back" | "front", color: string) {
      const c = size / 2;
      ctx!.save();
      ctx!.translate(c, c);
      ctx!.rotate(ORBIT_TILT);
      ctx!.beginPath();
      // Metade de trás (em cima, atrás do globo) e da frente (embaixo, na frente).
      if (half === "back")
        ctx!.ellipse(0, 0, size * ORBIT_RX, size * ORBIT_RY, 0, Math.PI, Math.PI * 2);
      else ctx!.ellipse(0, 0, size * ORBIT_RX, size * ORBIT_RY, 0, 0, Math.PI);
      ctx!.setLineDash([size * 0.0083, size * 0.0139]);
      ctx!.lineWidth = Math.max(1, size * 0.0042);
      ctx!.strokeStyle = color;
      ctx!.globalAlpha = 0.7;
      ctx!.stroke();
      ctx!.restore();
    }

    function orbitPoint() {
      const a = view.current.orbitAngle * DEG;
      const ex = size * ORBIT_RX * Math.cos(a);
      const ey = size * ORBIT_RY * Math.sin(a);
      const c = size / 2;
      return {
        x: c + ex * Math.cos(ORBIT_TILT) - ey * Math.sin(ORBIT_TILT),
        y: c + ex * Math.sin(ORBIT_TILT) + ey * Math.cos(ORBIT_TILT),
        front: Math.sin(a) > 0,
      };
    }

    function render() {
      if (!size) return;
      const dots = dotsRef.current;
      const project = projector();
      const r = size * GLOBE_RATIO;
      const c = size / 2;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, size, size);

      const sat = orbit ? orbitPoint() : null;
      if (orbit) drawOrbit("back", orbit.color);
      if (orbit && sat && !sat.front) drawSatellite(sat.x, sat.y, orbit.color);

      // Esfera com o mesmo degradê da ilustração original.
      const g = ctx!.createRadialGradient(c - r * 0.3, c - r * 0.45, 0, c, c, r * 1.25);
      g.addColorStop(0, "#1D2B24");
      g.addColorStop(1, "#0E1512");
      ctx!.beginPath();
      ctx!.arc(c, c, r, 0, Math.PI * 2);
      ctx!.fillStyle = g;
      ctx!.fill();

      // Meridianos (a cada 30°) e paralelos (a cada 30°), só a parte visível.
      ctx!.lineWidth = Math.max(1, size * 0.0028);
      ctx!.strokeStyle = GRID;
      ctx!.beginPath();
      const line = (points: [number, number][]) => {
        let pen = false;
        for (const [lat, lng] of points) {
          const p = project(Math.cos(lat * DEG), Math.sin(lat * DEG), lng * DEG);
          if (p.z > 0) {
            if (pen) ctx!.lineTo(p.x, p.y);
            else ctx!.moveTo(p.x, p.y);
            pen = true;
          } else pen = false;
        }
      };
      for (let lng = -180; lng < 180; lng += 30) {
        const pts: [number, number][] = [];
        for (let lat = -90; lat <= 90; lat += 5) pts.push([lat, lng]);
        line(pts);
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts: [number, number][] = [];
        for (let lng = -180; lng <= 180; lng += 5) pts.push([lat, lng]);
        line(pts);
      }
      ctx!.stroke();

      // Pontos de terra, agrupados por cor e por faixa de profundidade (menos trocas de estilo).
      if (dots) {
        const dotR = r * 0.0172;
        const buckets = new Map<string, Path2D>();
        const n = dots.lng.length;
        for (let i = 0; i < n; i++) {
          const p = project(dots.cosLat[i]!, dots.sinLat[i]!, dots.lng[i]!);
          if (p.z <= 0.02) continue;
          const band = p.z > 0.55 ? 3 : p.z > 0.3 ? 2 : p.z > 0.12 ? 1 : 0;
          const key = `${dots.color[i] ?? LAND}|${band}`;
          let path = buckets.get(key);
          if (!path) buckets.set(key, (path = new Path2D()));
          const rr = dotR * (0.55 + 0.45 * Math.min(1, p.z * 1.6));
          path.moveTo(p.x + rr, p.y);
          path.arc(p.x, p.y, rr, 0, Math.PI * 2);
        }
        const alpha = [0.35, 0.6, 0.85, 1];
        for (const [key, path] of buckets) {
          const [color, band] = key.split("|");
          ctx!.globalAlpha = alpha[Number(band)]!;
          ctx!.fillStyle = color!;
          ctx!.fill(path);
        }
        ctx!.globalAlpha = 1;
      }

      ctx!.beginPath();
      ctx!.arc(c, c, r, 0, Math.PI * 2);
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = OUTLINE;
      ctx!.stroke();

      // Marcadores dos lugares (pulsam devagar) e os rótulos HTML presos a eles.
      const now = performance.now();
      const pulse = motion.matches ? 0 : (now % 2400) / 2400;
      const labels: Label[] = [];
      for (const place of placesRef.current) {
        const p = project(Math.cos(place.lat * DEG), Math.sin(place.lat * DEG), place.lng * DEG);
        const el = markerRefs.current.get(place.id);
        const shown = p.z > 0.15;
        if (el) {
          labels.push({
            el,
            x: p.x,
            y: p.y,
            shown,
            opacity: Math.min(1, (p.z - 0.15) * 4),
            selected: selectedRef.current === place.id,
            prefer: "above",
          });
        }
        if (!shown) continue;
        const selected = selectedRef.current === place.id;
        const base = r * (selected ? 0.05 : 0.04);
        if (pulse) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, base + r * 0.09 * pulse, 0, Math.PI * 2);
          ctx!.strokeStyle = place.color;
          ctx!.globalAlpha = (1 - pulse) * 0.8;
          ctx!.lineWidth = Math.max(1.5, size * 0.004);
          ctx!.stroke();
          ctx!.globalAlpha = 1;
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, base, 0, Math.PI * 2);
        ctx!.fillStyle = place.color;
        ctx!.fill();
        ctx!.lineWidth = Math.max(2, size * 0.006);
        ctx!.strokeStyle = "#0B110E";
        ctx!.stroke();
      }

      if (orbit) drawOrbit("front", orbit.color);
      if (orbit && sat) {
        if (sat.front) drawSatellite(sat.x, sat.y, orbit.color);
        const el = orbitRef.current;
        // Atrás do globo o satélite some, e o rótulo também (senão encobre os países da frente).
        if (el) {
          const selected = selectedRef.current === orbit.id;
          labels.push({
            el,
            x: sat.x,
            y: sat.y,
            shown: sat.front || selected,
            opacity: 1,
            selected,
            prefer: "below",
          });
        }
      }
      layoutLabels(labels);
    }

    /**
     * Posiciona os rótulos sem sobreposição: o selecionado primeiro, depois os países (na ordem
     * recebida) e por último a órbita. Cada um tenta o lado preferido do ponto e depois o oposto;
     * se nenhum couber, ele se esconde até abrir espaço (o selecionado nunca se esconde).
     */
    function layoutLabels(labels: Label[]) {
      const placed: { x1: number; y1: number; x2: number; y2: number }[] = [];
      const gap = 12;
      const pad = 4;
      const ordered = [...labels].sort((a, b) => Number(b.selected) - Number(a.selected));
      for (const label of ordered) {
        const { el } = label;
        let visible = label.shown;
        let left = 0;
        let top = 0;
        if (visible) {
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          const sides =
            label.prefer === "above"
              ? (["above", "below"] as const)
              : (["below", "above"] as const);
          const rectFor = (side: "above" | "below") => {
            const y1 = side === "above" ? label.y - gap - h : label.y + gap;
            return { x1: label.x - w / 2, y1, x2: label.x + w / 2, y2: y1 + h };
          };
          const free = (rc: { x1: number; y1: number; x2: number; y2: number }) =>
            placed.every(
              (o) =>
                rc.x2 + pad <= o.x1 ||
                rc.x1 - pad >= o.x2 ||
                rc.y2 + pad <= o.y1 ||
                rc.y1 - pad >= o.y2,
            );
          const fit = sides.map(rectFor).find(free) ?? (label.selected ? rectFor(sides[0]) : null);
          if (fit) {
            placed.push(fit);
            left = fit.x1;
            top = fit.y1;
          } else visible = false;
        }
        if (visible) el.style.transform = `translate(${left}px, ${top}px)`;
        el.style.opacity = visible ? String(label.opacity) : "0";
        el.style.pointerEvents = visible ? "auto" : "none";
        el.tabIndex = visible ? 0 : -1;
        el.setAttribute("aria-hidden", visible ? "false" : "true");
      }
    }

    function drawSatellite(x: number, y: number, color: string) {
      ctx!.beginPath();
      ctx!.arc(x, y, size * 0.022, 0, Math.PI * 2);
      ctx!.fillStyle = color;
      ctx!.fill();
      ctx!.lineWidth = Math.max(2, size * 0.006);
      ctx!.strokeStyle = "#121A16";
      ctx!.stroke();
    }

    function tick(now: number) {
      const v = view.current;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const reduce = motion.matches;
      if (v.target) {
        const t = Math.min(1, (now - v.target.start) / 700);
        const e = 1 - Math.pow(1 - t, 3);
        v.lambda = v.target.from.lambda + (v.target.lambda - v.target.from.lambda) * e;
        v.phi = v.target.from.phi + (v.target.phi - v.target.from.phi) * e;
        if (t >= 1) v.target = null;
      } else if (!v.dragging) {
        if (Math.abs(v.vLambda) > 0.01 || Math.abs(v.vPhi) > 0.01) {
          v.lambda += v.vLambda;
          v.phi = Math.max(-MAX_TILT, Math.min(MAX_TILT, v.phi + v.vPhi));
          v.vLambda *= 0.93;
          v.vPhi *= 0.93;
        } else if (
          !reduce &&
          !v.hovering &&
          now - v.lastInteraction > IDLE_RESUME_MS &&
          !selectedRef.current
        ) {
          v.lambda += AUTO_SPEED * dt;
        }
      }
      // Satélite do cripto: uma volta por minuto; para enquanto ele está selecionado.
      if (!reduce && !(orbit && selectedRef.current === orbit.id)) {
        v.orbitAngle = (v.orbitAngle - 6 * dt + 360) % 360;
      }
      render();
      // Com "reduzir movimento" e nada acontecendo, o quadro fica parado até a próxima interação.
      const busy = v.dragging || v.target || Math.abs(v.vLambda) > 0.01 || Math.abs(v.vPhi) > 0.01;
      if (visible && !document.hidden && (!reduce || busy)) raf = requestAnimationFrame(tick);
      else running = false;
    }

    function start() {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
    wake.current = start;
    renderRef.current = render;

    // Arrastar para girar (mouse e toque; o toque vertical continua rolando a página).
    let px = 0;
    let py = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      const v = view.current;
      v.dragging = true;
      v.target = null;
      v.vLambda = v.vPhi = 0;
      px = e.clientX;
      py = e.clientY;
      moved = false;
      canvas.setPointerCapture(e.pointerId);
      wrapEl.dataset.dragging = "true";
      start();
    };
    const onMove = (e: PointerEvent) => {
      const v = view.current;
      if (!v.dragging) return;
      const k = 180 / (Math.PI * size * GLOBE_RATIO); // graus por pixel: o ponto sob o dedo acompanha
      const dx = (e.clientX - px) * k;
      const dy = (e.clientY - py) * k;
      if (Math.abs(e.clientX - px) + Math.abs(e.clientY - py) > 2) moved = true;
      px = e.clientX;
      py = e.clientY;
      v.lambda += dx;
      v.phi = Math.max(-MAX_TILT, Math.min(MAX_TILT, v.phi + dy));
      v.vLambda = dx;
      v.vPhi = dy;
      v.lastInteraction = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      const v = view.current;
      v.dragging = false;
      v.lastInteraction = performance.now();
      if (motion.matches) v.vLambda = v.vPhi = 0;
      delete wrapEl.dataset.dragging;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      if (!moved) onCanvasClick(e);
      start();
    };

    /** Toque/clique sem arrastar: escolhe o marcador mais próximo, se houver. */
    function onCanvasClick(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const project = projector();
      let best: { id: string; d: number } | null = null;
      for (const place of placesRef.current) {
        const p = project(Math.cos(place.lat * DEG), Math.sin(place.lat * DEG), place.lng * DEG);
        if (p.z <= 0.15) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < size * 0.08 && (!best || d < best.d)) best = { id: place.id, d };
      }
      onSelectRef.current?.(best ? best.id : null);
    }

    const onEnter = () => (view.current.hovering = true);
    const onLeave = () => {
      if (!wrapEl.contains(document.activeElement)) view.current.hovering = false;
    };
    const onFocusIn = () => (view.current.hovering = true);
    const onFocusOut = (e: FocusEvent) => {
      if (!wrapEl.contains(e.relatedTarget as Node | null)) view.current.hovering = false;
    };
    wrapEl.addEventListener("pointerenter", onEnter);
    wrapEl.addEventListener("pointerleave", onLeave);
    wrapEl.addEventListener("focusin", onFocusIn);
    wrapEl.addEventListener("focusout", onFocusOut);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapEl);
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) start();
    });
    io.observe(wrapEl);
    const onVisibility = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", start);

    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", start);
      wrapEl.removeEventListener("pointerenter", onEnter);
      wrapEl.removeEventListener("pointerleave", onLeave);
      wrapEl.removeEventListener("focusin", onFocusIn);
      wrapEl.removeEventListener("focusout", onFocusOut);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [orbit]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const v = view.current;
    const step = 15;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => (v.lambda += step),
      ArrowRight: () => (v.lambda -= step),
      ArrowUp: () => (v.phi = Math.min(MAX_TILT, v.phi + step)),
      ArrowDown: () => (v.phi = Math.max(-MAX_TILT, v.phi - step)),
    };
    if (e.key === "Escape" && selectedRef.current) {
      onSelectRef.current?.(null);
      return;
    }
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    v.target = null;
    v.vLambda = v.vPhi = 0;
    v.lastInteraction = performance.now();
    move();
    renderRef.current();
    wake.current();
  }

  return (
    <div
      ref={wrapRef}
      role="group"
      aria-roledescription="globo interativo"
      aria-label={`${label} Use as setas do teclado para girar.`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "group/globe relative aspect-square w-full touch-pan-y rounded-full select-none focus-visible:outline-offset-[-0.5rem]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 size-full cursor-grab transition-opacity duration-500 group-data-[dragging=true]/globe:cursor-grabbing",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Rótulos dos marcadores: botões de verdade, posicionados a cada quadro pelo canvas. */}
      {places.map((place) => (
        <button
          key={place.id}
          ref={(el) => {
            if (el) markerRefs.current.set(place.id, el);
            else markerRefs.current.delete(place.id);
          }}
          type="button"
          aria-pressed={selectedId === place.id}
          onClick={() => onSelect?.(selectedId === place.id ? null : place.id)}
          className={cn(
            "absolute top-0 left-0 rounded-full border px-2.5 py-1 text-12 font-bold whitespace-nowrap opacity-0 shadow-[0_4px_12px_rgba(0,0,0,.35)] backdrop-blur-sm transition-opacity duration-150",
            selectedId === place.id
              ? "border-transparent text-canvas"
              : "border-line-strong bg-canvas/80 text-sand",
          )}
          style={selectedId === place.id ? { background: place.color } : undefined}
        >
          {place.label}
        </button>
      ))}
      {orbit && (
        <button
          ref={orbitRef}
          type="button"
          aria-pressed={selectedId === orbit.id}
          onClick={() => onSelect?.(selectedId === orbit.id ? null : orbit.id)}
          className={cn(
            "absolute top-0 left-0 rounded-full border px-2.5 py-1 text-12 font-bold whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,.35)] backdrop-blur-sm transition-opacity duration-300",
            selectedId === orbit.id
              ? "border-transparent text-canvas"
              : "border-line-strong bg-canvas/80 text-sand",
          )}
          style={selectedId === orbit.id ? { background: orbit.color } : undefined}
        >
          {orbit.label}
        </button>
      )}
    </div>
  );
}
