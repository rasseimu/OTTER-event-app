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
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 32px;
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
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ErrorText = styled.p`
  color: #e53935;
  font-size: 13px;
  text-align: center;
`;

const LinkText = styled.p`
  text-align: center;
  font-size: 14px;
  margin-top: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  a { color: ${({ theme }) => theme.colors.primary}; text-decoration: none; font-weight: 600; }
`;

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth?action=signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { name, email, password } }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError((data.errors ?? [data.error]).join(", "));
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
      <Title>新規登録</Title>
      <Form onSubmit={handleSubmit}>
        <Input placeholder="お名前" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="パスワード（8文字以上）" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={loading}>{loading ? "登録中..." : "アカウント作成"}</Button>
      </Form>
      <LinkText>すでにアカウントをお持ちの方は <a href="/login">ログイン</a></LinkText>
    </Container>
  );
}
