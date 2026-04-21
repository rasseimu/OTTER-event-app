import Link from "next/link";
import styled from "styled-components";
import type { EventItem } from "@/lib/api";

const Card = styled(Link)`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: 16px;
  margin: 0 16px 12px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-decoration: none;
  color: inherit;
`;

const EventIcon = styled.span`
  font-size: 28px;
  margin-right: 12px;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
`;

const Name = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px;
`;

const Meta = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 2px 0;
`;

const Arrow = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
`;

const EVENT_ICONS: Record<string, string> = {
  drinking: "🍺",
  bbq:      "🍖",
  cooking:  "🍳",
  other:    "🎉",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <Card href={`/events/${event.id}`}>
      <EventIcon>{EVENT_ICONS[event.event_type] ?? "🎉"}</EventIcon>
      <Info>
        <Name>{event.name}</Name>
        <Meta>📅 {formatDate(event.date)} {event.time}</Meta>
        <Meta>👥 {event.participant_count}人</Meta>
      </Info>
      <Arrow>›</Arrow>
    </Card>
  );
}
