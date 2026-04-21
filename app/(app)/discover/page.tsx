import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import styled from "styled-components";

const Page = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  padding: 20px 16px;
  color: ${({ theme }) => theme.colors.white};
`;

const HeaderTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
`;

const HeaderSub = styled.p`
  font-size: 13px;
  opacity: 0.85;
  margin: 0;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 16px 16px 8px;
`;

const RankRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const RankNum = styled.span`
  width: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RankName = styled.span`
  flex: 1;
  font-size: 15px;
`;

const RankStar = styled.span`
  color: ${({ theme }) => theme.colors.star};
  font-weight: 700;
`;

const ChallengeRow = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const ChallengeName = styled.p`
  margin: 0 0 2px;
  font-weight: 600;
  font-size: 15px;
`;

const ChallengeDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressBar = styled.div<{ $pct: number }>`
  height: 6px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  margin-top: 8px;
  overflow: hidden;
  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 999px;
  }
`;

const ProgressText = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default async function DiscoverPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const token = raw.value;

  const [rankingsData, challengesData] = await Promise.all([
    api.discover.rankings(token),
    api.discover.challenges(token),
  ]);

  return (
    <Page>
      <Header>
        <HeaderTitle>わくわく</HeaderTitle>
        <HeaderSub>料理でもっと楽しもう！</HeaderSub>
      </Header>

      <SectionTitle>🏆 料理人ランキング</SectionTitle>
      <Card>
        {rankingsData.rankings.map((r) => (
          <RankRow key={r.rank}>
            <RankNum>{r.rank}位</RankNum>
            <RankName>{r.user.name}</RankName>
            <RankStar>★ {r.avg_rating}</RankStar>
          </RankRow>
        ))}
      </Card>

      <SectionTitle>🎯 チャレンジ</SectionTitle>
      <Card>
        {challengesData.challenges.map((c) => (
          <ChallengeRow key={c.id}>
            <ChallengeName>{c.name}</ChallengeName>
            <ChallengeDesc>{c.description} · 報酬: {c.badge}</ChallengeDesc>
            <ProgressBar $pct={Math.min(100, (c.progress / c.target) * 100)} />
            <ProgressText>{c.progress} / {c.target}</ProgressText>
          </ChallengeRow>
        ))}
      </Card>
    </Page>
  );
}
