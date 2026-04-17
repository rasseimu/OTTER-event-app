import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";

export const metadata: Metadata = {
  title: "OTTER",
  description: "大学研究室向けイベント管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, backgroundColor: "#F5F5F5" }}>
        <StyledComponentsRegistry>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
