"use client";

import styled from "styled-components";
import BottomNav from "@/components/BottomNav";

const PageWrapper = styled.div`
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding-bottom: 60px;
  position: relative;
`;

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PageWrapper>
      {children}
      <BottomNav />
    </PageWrapper>
  );
}
