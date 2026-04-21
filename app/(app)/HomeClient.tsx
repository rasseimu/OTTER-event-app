"use client";

import { useState } from "react";
import styled from "styled-components";
import CalendarView from "@/components/CalendarView";
import EventCard from "@/components/EventCard";
import type { EventItem } from "@/lib/api";
import Link from "next/link";

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  background: ${({ theme }) => theme.colors.white};
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const AddButton = styled(Link)`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  text-decoration: none;
  line-height: 1;
`;

const Section = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  padding: 0 16px 12px;
  margin: 0;
`;

const PastCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: 12px 16px;
  margin: 0 16px 10px;
  text-decoration: none;
  color: inherit;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Thumb = styled.div<{ $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const EmptyText = styled.p`
  padding: 0 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const MetaText = styled.p`
  margin: 2px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const THUMB_COLORS = ["#E8D5FF", "#FFD5D5", "#FFE9B8", "#D5F5D5"];

export default function HomeClient({
  upcomingEvents,
  pastEvents,
}: {
  upcomingEvents: EventItem[];
  pastEvents: EventItem[];
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const eventDates = upcomingEvents.map((e) => e.date);

  return (
    <div>
      <Header>
        <Title>イベント</Title>
        <AddButton href="/events/new">+</AddButton>
      </Header>

      <CalendarView
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        eventDates={eventDates}
      />

      <Section>
        <SectionTitle>今後のイベント</SectionTitle>
        {upcomingEvents.length > 0
          ? upcomingEvents.map((e) => <EventCard key={e.id} event={e} />)
          : <EmptyText>予定されているイベントはありません</EmptyText>
        }
      </Section>

      <Section>
        <SectionTitle>料理の記録</SectionTitle>
        {pastEvents.length > 0
          ? pastEvents.map((e, i) => (
              <PastCard key={e.id} href={`/events/${e.id}`}>
                <Thumb $color={THUMB_COLORS[i % THUMB_COLORS.length]} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{e.name}</p>
                  <MetaText>
                    {e.date} · {e.participant_count}人
                  </MetaText>
                </div>
              </PastCard>
            ))
          : <EmptyText>過去のイベントはありません</EmptyText>
        }
      </Section>
    </div>
  );
}
