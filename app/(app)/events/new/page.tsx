"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import EventTypeSelector from "@/components/EventTypeSelector";
import { api } from "@/lib/api";

type EventType = "drinking" | "bbq" | "cooking" | "other";

const Page = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  padding-bottom: 80px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.white};
`;

const BackBtn = styled.button`
  background: none; border: none; font-size: 15px;
  color: ${({ theme }) => theme.colors.primary}; cursor: pointer;
`;

const TopTitle = styled.h2`
  font-size: 17px; font-weight: 600; margin: 0;
`;

const CreateBtn = styled.button`
  background: none; border: none; font-size: 15px;
  color: ${({ theme }) => theme.colors.primary}; font-weight: 600; cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: 16px;
  margin: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Label = styled.p`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 8px;
`;

const Input = styled.input`
  width: 100%; border: none; outline: none;
  font-size: 16px; color: ${({ theme }) => theme.colors.text};
  background: transparent;
  box-sizing: border-box;
  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const SectionTitle = styled.p`
  font-size: 13px; font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 16px 8px;
`;

export default function CreateEventPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [type, setType]         = useState<EventType>("drinking");
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleCreate() {
    if (!name || !date) return;
    setLoading(true);
    try {
      const cookieRes = await fetch("/api/auth/token");
      const { token } = await cookieRes.json();
      const { event } = await api.events.create(
        { name, event_type: type, date, time, location },
        token
      );
      router.push(`/events/${event.id}`);
    } catch {
      alert("イベントの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => router.back()}>← 戻る</BackBtn>
        <TopTitle>新規イベント</TopTitle>
        <CreateBtn onClick={handleCreate} disabled={!name || !date || loading}>
          作成
        </CreateBtn>
      </TopBar>

      <Card>
        <Label>イベント名</Label>
        <Input
          placeholder="例：研究室新歓飲み会"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Card>

      <SectionTitle>イベントタイプ</SectionTitle>
      <div style={{ padding: "0 16px" }}>
        <EventTypeSelector value={type} onChange={(v) => setType(v as EventType)} />
      </div>

      <Card style={{ marginTop: 16 }}>
        <Label>📅 日時</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </Card>

      <Card>
        <Label>📍 場所</Label>
        <Input
          placeholder='例：居酒屋「和」'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </Card>
    </Page>
  );
}
