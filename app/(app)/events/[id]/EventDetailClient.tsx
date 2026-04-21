"use client";

import { useState } from "react";
import styled from "styled-components";
import type { EventItem, UserItem } from "@/lib/api";
import Link from "next/link";

const Page = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 20px 16px 0;
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 15px;
`;

const EventName = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 12px 0 4px;
`;

const Meta = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 4px 0;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 16px;
  overflow-x: auto;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  cursor: pointer;
  white-space: nowrap;
`;

const Content = styled.div`
  padding: 16px;
`;

const ParticipantChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 999px;
  padding: 8px 14px;
  margin: 4px;
  font-size: 14px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
`;

const ActionLink = styled(Link)`
  display: block;
  text-align: center;
  padding: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  text-decoration: none;
  font-weight: 600;
  margin-top: 16px;
`;

const TABS = ["概要", "会計", "食材", "写真", "評価"] as const;
const TAB_PATHS: Record<string, string> = {
  会計: "expenses",
  食材: "ingredients",
  写真: "photos",
  評価: "ratings",
};

const EVENT_ICONS: Record<string, string> = {
  drinking: "🍺",
  bbq: "🍖",
  cooking: "🍳",
  other: "🎉",
};

export default function EventDetailClient({
  event,
  participants,
  token: _token,
}: {
  event: EventItem;
  participants: UserItem[];
  token: string;
}) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("概要");

  return (
    <Page>
      <Header>
        <BackLink href="/">← ホーム</BackLink>
        <EventName>
          {EVENT_ICONS[event.event_type] ?? "🎉"} {event.name}
        </EventName>
        <Meta>
          📅 {event.date} {event.time}
        </Meta>
        {event.location && <Meta>📍 {event.location}</Meta>}
        <Meta>👥 {event.participant_count}人参加</Meta>

        <Tabs>
          {TABS.map((tab) => (
            <Tab
              key={tab}
              $active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Tab>
          ))}
        </Tabs>
      </Header>

      <Content>
        {activeTab === "概要" && (
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              参加者
            </p>
            <div>
              {participants.map((p) => (
                <ParticipantChip key={p.id}>
                  <Avatar>{p.name.charAt(0)}</Avatar>
                  {p.name}
                </ParticipantChip>
              ))}
            </div>
          </div>
        )}
        {activeTab !== "概要" && (
          <ActionLink href={`/events/${event.id}/${TAB_PATHS[activeTab]}`}>
            {activeTab}を管理する
          </ActionLink>
        )}
      </Content>
    </Page>
  );
}
