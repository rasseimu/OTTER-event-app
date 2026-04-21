import { theme } from "@/styles/theme";

describe("theme", () => {
  it("has primary orange color", () => {
    expect(theme.colors.primary).toBe("#FF6B35");
  });

  it("has card border radius", () => {
    expect(theme.borderRadius.card).toBe("12px");
  });

  it("has card shadow", () => {
    expect(theme.shadows.card).toContain("rgba");
  });
});
