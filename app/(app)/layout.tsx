import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import styled from "styled-components";

const PageWrapper = styled.div`
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding-bottom: 60px;
  position: relative;
`;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) redirect("/login");

  return (
    <PageWrapper>
      {children}
      <BottomNav />
    </PageWrapper>
  );
}
