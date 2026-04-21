import { render, screen } from "@testing-library/react";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from "next/navigation";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

describe("BottomNav", () => {
  it("renders all 4 navigation labels", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<BottomNav />, { wrapper: Wrapper });
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.getByText("マイページ")).toBeInTheDocument();
    expect(screen.getByText("わくわく")).toBeInTheDocument();
    expect(screen.getByText("レシピ")).toBeInTheDocument();
  });

  it("marks the active tab", () => {
    (usePathname as jest.Mock).mockReturnValue("/profile");
    render(<BottomNav />, { wrapper: Wrapper });
    const profileLink = screen.getByText("マイページ").closest("a");
    expect(profileLink).toHaveAttribute("href", "/profile");
  });
});
