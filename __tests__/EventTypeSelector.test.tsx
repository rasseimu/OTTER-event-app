import { render, screen, fireEvent } from "@testing-library/react";
import EventTypeSelector from "@/components/EventTypeSelector";
import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";

describe("EventTypeSelector", () => {
  it("calls onChange when a type is selected", () => {
    const onChange = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <EventTypeSelector value="drinking" onChange={onChange} />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText("BBQ"));
    expect(onChange).toHaveBeenCalledWith("bbq");
  });

  it("renders all four event type labels", () => {
    const onChange = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <EventTypeSelector value="drinking" onChange={onChange} />
      </ThemeProvider>
    );
    expect(screen.getByText("飲み会")).toBeInTheDocument();
    expect(screen.getByText("BBQ")).toBeInTheDocument();
    expect(screen.getByText("料理")).toBeInTheDocument();
    expect(screen.getByText("その他")).toBeInTheDocument();
  });
});
