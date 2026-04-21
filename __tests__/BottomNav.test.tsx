import { render, screen } from "@testing-library/react";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

describe("BottomNav", () => {
  it("renders all 4 navigation labels", () => {
    render(<BottomNav activePath="/" />, { wrapper: Wrapper });
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.getByText("マイページ")).toBeInTheDocument();
    expect(screen.getByText("わくわく")).toBeInTheDocument();
    expect(screen.getByText("レシピ")).toBeInTheDocument();
  });

  it("marks the active tab", () => {
    render(<BottomNav activePath="/profile" />, { wrapper: Wrapper });
    const profileLink = screen.getByText("マイページ").closest("a");
    expect(profileLink).toHaveAttribute("href", "/profile");
  });
});
