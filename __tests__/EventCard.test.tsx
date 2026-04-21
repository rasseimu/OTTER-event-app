import { render, screen } from "@testing-library/react";
import EventCard from "@/components/EventCard";
import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";

const mockEvent = {
  id: 1,
  name: "研究室BBQ",
  event_type: "bbq" as const,
  date: "2026-04-20",
  time: "11:00",
  location: "大学グラウンド",
  organizer: { id: 1, name: "Taro", avatar_url: null },
  participant_count: 8,
  created_at: "2026-04-01T00:00:00Z",
};

describe("EventCard", () => {
  it("renders event name", () => {
    render(
      <ThemeProvider theme={theme}>
        <EventCard event={mockEvent} />
      </ThemeProvider>
    );
    expect(screen.getByText("研究室BBQ")).toBeInTheDocument();
  });

  it("renders participant count", () => {
    render(
      <ThemeProvider theme={theme}>
        <EventCard event={mockEvent} />
      </ThemeProvider>
    );
    expect(screen.getByText(/8人/)).toBeInTheDocument();
  });
});
