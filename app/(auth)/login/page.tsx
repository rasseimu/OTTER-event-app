"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: ${({ theme }) => theme.colors.white};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 40px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  font-size: 16px;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #e53935;
  font-size: 13px;
  text-align: center;
`;

const LinkText = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "ログインに失敗しました");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Title>OTTER 🦦</Title>
      <Subtitle>研究室イベント管理アプリ</Subtitle>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={loading}>
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </Form>
      <LinkText style={{ marginTop: 24 }}>
        アカウントをお持ちでない方は <a href="/signup">新規登録</a>
      </LinkText>
    </Container>
  );
}
