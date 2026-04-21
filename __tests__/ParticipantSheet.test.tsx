import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";
import ParticipantSheet from "@/components/ParticipantSheet";
import * as actions from "@/app/actions/events";

jest.mock("@/app/actions/events", () => ({
  searchUsers: jest.fn(),
}));

const mockSearchUsers = actions.searchUsers as jest.MockedFunction<typeof actions.searchUsers>;

const mockUsers = [
  { id: 1, name: "Alice", avatar_url: null },
  { id: 2, name: "Bob", avatar_url: null },
];

function renderSheet(props = {}) {
  const defaultProps = {
    initialSelected: [],
    onConfirm: jest.fn(),
    onClose: jest.fn(),
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <ParticipantSheet {...defaultProps} />
    </ThemeProvider>
  );
}

describe("ParticipantSheet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the sheet header and search input", () => {
    renderSheet();
    expect(screen.getByText("参加者を追加")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("名前で検索...")).toBeInTheDocument();
  });

  it("shows hint when query is less than 2 chars", () => {
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "a" },
    });
    expect(screen.getByText("2文字以上入力してください")).toBeInTheDocument();
    expect(mockSearchUsers).not.toHaveBeenCalled();
  });

  it("calls searchUsers when query is 2+ chars and shows results", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    expect(mockSearchUsers).toHaveBeenCalledWith("Al");
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("toggles user selection when tapped", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    await waitFor(() => screen.getByText("Alice"));
    fireEvent.click(screen.getByText("Alice"));
    expect(screen.getByText("確定（1人）")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Alice"));
    expect(screen.getByText("確定（0人）")).toBeInTheDocument();
  });

  it("confirm button is disabled when 0 selected", () => {
    renderSheet();
    const btn = screen.getByRole("button", { name: /確定/ });
    expect(btn).toBeDisabled();
  });

  it("calls onConfirm with selected users when confirm is clicked", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    const onConfirm = jest.fn();
    renderSheet({ onConfirm });
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    await waitFor(() => screen.getByText("Alice"));
    fireEvent.click(screen.getByText("Alice"));
    fireEvent.click(screen.getByRole("button", { name: /確定/ }));
    expect(onConfirm).toHaveBeenCalledWith([mockUsers[0]]);
  });

  it("pre-checks initialSelected users in results", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    renderSheet({ initialSelected: [mockUsers[0]] });
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    await waitFor(() => screen.getByText("Alice"));
    expect(screen.getByText("確定（1人）")).toBeInTheDocument();
  });

  it("calls onClose when × is clicked", () => {
    const onClose = jest.fn();
    renderSheet({ onClose });
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClose).toHaveBeenCalled();
  });
});
