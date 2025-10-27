import { computePieGeometry, arcPath } from "../core/pie-geometry";

describe("pie geometry", () => {
  test("angles sum to TAU", () => {
    const data = [
      { label: "A", value: 1 },
      { label: "B", value: 1 },
      { label: "C", value: 1 },
    ];
    const g = computePieGeometry(data);
    const total = g[g.length - 1].endRad - g[0].startRad;
    expect(Math.abs(total - Math.PI * 2)).toBeLessThan(1e-9);
  });

  test("handles zero total gracefully", () => {
    const data = [
      { label: "A", value: 0 },
      { label: "B", value: 0 },
    ];
    const g = computePieGeometry(data);
    expect(g.every((s) => s.startRad === -Math.PI / 2 && s.endRad === -Math.PI / 2)).toBe(true);
  });

  test("arcPath returns a closed path string", () => {
    const d = arcPath(50, 50, 40, 20, 0, Math.PI / 2);
    expect(d.startsWith("M ")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
  });
});


