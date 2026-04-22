"use client";

import styled from "styled-components";
import type { UserProfile } from "@/lib/api";

const Page = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  padding: 20px 16px 0;
`;

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  margin: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: 24px;
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AvatarCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.avatarOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 12px;
`;

const UserName = styled.p`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px;
`;

const Role = styled.p`
  font-size: 13px;
  opacity: 0.85;
  margin: 0 0 16px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  text-align: center;
  gap: 8px;
`;

const StatValue = styled.p`
  font-size: 22px;
  font-weight: 700;
  margin: 0;
`;

const StatLabel = styled.p`
  font-size: 11px;
  opacity: 0.8;
  margin: 0;
`;

const SectionLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 16px 8px;
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin: 0 16px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.card};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const InfoLabel = styled.div`
  flex: 1;
`;

const InfoTitle = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 2px;
`;

const InfoValue = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Chevron = styled.span`
  color: ${({ theme }) => theme.colors.border};
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 15px;
  cursor: pointer;
`;

interface Props {
  user: UserProfile;
  logout: () => Promise<void>;
}

export default function ProfileClient({ user, logout }: Props) {
  return (
    <Page>
      <PageTitle>マイページ</PageTitle>

      <ProfileCard>
        <AvatarCircle>{user.name.charAt(0)}</AvatarCircle>
        <UserName>{user.name}</UserName>
        <Role>研究室メンバー</Role>
        <Stats>
          <div>
            <StatValue>{user.stats.events_participated}</StatValue>
            <StatLabel>参加イベント</StatLabel>
          </div>
          <div>
            <StatValue>{user.stats.events_organized}</StatValue>
            <StatLabel>主催</StatLabel>
          </div>
          <div>
            <StatValue>{user.stats.average_rating || "—"}</StatValue>
            <StatLabel>平均評価</StatLabel>
          </div>
        </Stats>
      </ProfileCard>

      <SectionLabel>アカウント情報</SectionLabel>
      <InfoCard>
        <InfoRow>
          <InfoLabel>
            <InfoTitle>メールアドレス</InfoTitle>
            <InfoValue>{user.email}</InfoValue>
          </InfoLabel>
          <Chevron>›</Chevron>
        </InfoRow>
      </InfoCard>

      <InfoCard>
        <InfoRow>
          <form action={logout} style={{ width: "100%", textAlign: "center" }}>
            <LogoutButton type="submit">→ ログアウト</LogoutButton>
          </form>
        </InfoRow>
      </InfoCard>
    </Page>
  );
}
