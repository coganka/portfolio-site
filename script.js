(() => {
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const motion = document.getElementById("motion");
  const mode = document.getElementById("mode");
  const reset = document.getElementById("reset");
  const help = document.getElementById("scene-help");
  if (!ctx) {
    help.textContent = "Explore the renderer using the link below.";
    [motion, mode, reset].forEach((button) => (button.hidden = true));
    return;
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduced.matches,
    wire = false,
    angleX = 0.68,
    angleY = -0.42;
  let width = 0,
    height = 0,
    active = true,
    drag = null,
    frame = 0,
    last = 0;
  const vertices = [],
    faces = [];
  const rings = 84,
    sides = 10;
  const center = (t) => [
    0.58 * (2 + Math.cos(3 * t)) * Math.cos(2 * t),
    0.58 * (2 + Math.cos(3 * t)) * Math.sin(2 * t),
    0.58 * Math.sin(3 * t),
  ];
  const normalize = (vector) => {
    const length = Math.hypot(...vector);
    return vector.map((value) => value / length);
  };
  for (let i = 0; i < rings; i++) {
    const t = (i / rings) * Math.PI * 2;
    const point = center(t);
    const next = center(t + 0.001);
    const tangent = normalize(next.map((value, axis) => value - point[axis]));
    const normal = normalize([-tangent[1], tangent[0], 0]);
    const binormal = [
      -tangent[2] * normal[1],
      tangent[2] * normal[0],
      tangent[0] * normal[1] - tangent[1] * normal[0],
    ];
    for (let j = 0; j < sides; j++) {
      const v = (j / sides) * Math.PI * 2;
      vertices.push(
        point.map(
          (value, axis) =>
            value +
            0.24 * (Math.cos(v) * normal[axis] + Math.sin(v) * binormal[axis]),
        ),
      );
    }
  }
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j;
      const b = ((i + 1) % rings) * sides + j;
      const c = ((i + 1) % rings) * sides + ((j + 1) % sides);
      const d = i * sides + ((j + 1) % sides);
      faces.push([a, b, c], [a, c, d]);
    }
  function draw() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const sx = Math.sin(angleX),
      cx = Math.cos(angleX),
      sy = Math.sin(angleY),
      cy = Math.cos(angleY);
    const scale = Math.min(width, height) * 0.83;
    const projected = vertices.map(([x, y, z]) => {
      const xx = x * cy + z * sy,
        zz = -x * sy + z * cy;
      const yy = y * cx - zz * sx,
        zzz = y * sx + zz * cx;
      return {
        x: width * 0.5 + (xx * scale) / (5.6 + zzz),
        y: height * 0.5 + (yy * scale) / (5.6 + zzz),
        z: zzz,
      };
    });
    const ordered = faces
      .map((ids) => ({
        ids,
        z: ids.reduce((v, i) => v + projected[i].z, 0) / 3,
      }))
      .sort((a, b) => b.z - a.z);
    for (const face of ordered) {
      const [a, b, c] = face.ids.map((i) => projected[i]);
      const light = Math.max(0, Math.min(1, (2.2 - face.z) / 4.4));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      if (!wire) {
        ctx.fillStyle = `rgb(${25 + light * 68},${24 + light * 24},${23 + light * 8})`;
        ctx.fill();
      }
      ctx.strokeStyle = `rgba(255,${115 + light * 38},${58 + light * 27},${wire ? 0.13 + light * 0.65 : 0.1 + light * 0.5})`;
      ctx.lineWidth = wire ? 0.65 : 0.55;
      ctx.stroke();
    }
  }
  function schedule() {
    if (!frame && !paused && active && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    frame = 0;
    if (paused || !active || document.hidden) return;
    if (time - last >= 32) {
      if (!drag) angleY += Math.min(time - last, 60) * 0.00016;
      draw();
      last = time;
    }
    schedule();
  }
  function updateMotion() {
    motion.innerHTML = paused
      ? 'Play <span aria-hidden="true">▷</span>'
      : 'Pause <span aria-hidden="true">Ⅱ</span>';
    motion.setAttribute("aria-pressed", String(paused));
    if (paused) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = performance.now();
      schedule();
    }
    draw();
  }
  motion.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  });
  mode.addEventListener("click", () => {
    wire = !wire;
    mode.setAttribute("aria-pressed", String(wire));
    draw();
  });
  reset.addEventListener("click", () => {
    angleX = 0.68;
    angleY = -0.42;
    draw();
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    angleY += (event.clientX - drag.x) * 0.009;
    angleX += (event.clientY - drag.y) * 0.009;
    drag.x = event.clientX;
    drag.y = event.clientY;
    draw();
  });
  const end = () => (drag = null);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("lostpointercapture", end);
  canvas.addEventListener("keydown", (event) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === "ArrowLeft") angleY -= 0.12;
    if (event.key === "ArrowRight") angleY += 0.12;
    if (event.key === "ArrowUp") angleX -= 0.12;
    if (event.key === "ArrowDown") angleX += 0.12;
    draw();
  });
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      if (!active) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    },
    { threshold: 0.05 },
  ).observe(canvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = performance.now();
      schedule();
    }
  });
  reduced.addEventListener("change", () => {
    paused = reduced.matches;
    updateMotion();
  });
  resize();
  updateMotion();
})();
