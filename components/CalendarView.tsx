"use client";

import { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MonthText = styled.span`
  font-size: 18px;
  font-weight: 600;
`;

const NavBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px 0 8px;
`;

const Day = styled.button<{ $today: boolean; $selected: boolean }>`
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  background: ${({ $today, $selected, theme }) =>
    $selected
      ? theme.colors.primary
      : $today
      ? theme.colors.primaryLight
      : "transparent"};
  color: ${({ $today, $selected, theme }) =>
    $selected
      ? theme.colors.white
      : $today
      ? theme.colors.primary
      : theme.colors.text};
  font-size: 13px;
  font-weight: ${({ $today }) => ($today ? "700" : "400")};
  cursor: pointer;
  width: 100%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DOT = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  margin: 2px auto 0;
`;

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarView({
  selectedDate,
  onSelectDate,
  eventDates = [],
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  eventDates?: string[];
}) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));
  const today = new Date();
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <Wrapper>
      <Header>
        <NavBtn onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</NavBtn>
        <MonthText>{year}年 {month + 1}月</MonthText>
        <NavBtn onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</NavBtn>
      </Header>
      <Grid>
        {DAYS.map((d) => <DayLabel key={d}>{d}</DayLabel>)}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date       = new Date(year, month, day);
          const dateStr    = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday    = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const hasEvent   = eventDates.includes(dateStr);
          return (
            <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Day $today={isToday} $selected={isSelected} onClick={() => onSelectDate(date)}>
                {day}
              </Day>
              {hasEvent && !isSelected && <DOT />}
            </div>
          );
        })}
      </Grid>
    </Wrapper>
  );
}
