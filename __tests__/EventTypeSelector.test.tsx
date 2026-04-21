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
});
