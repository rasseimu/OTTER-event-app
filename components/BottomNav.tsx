"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 60px;
  background: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  font-size: 10px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  min-width: 60px;
`;

const Icon = styled.span`
  font-size: 22px;
`;

const ITEMS = [
  { href: "/",         icon: "🏠", label: "ホーム" },
  { href: "/profile",  icon: "👤", label: "マイページ" },
  { href: "/discover", icon: "✨", label: "わくわく" },
  { href: "/recipes",  icon: "📖", label: "レシピ" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <Nav>
      {ITEMS.map(({ href, icon, label }) => (
        <NavItem key={href} href={href} $active={pathname === href}>
          <Icon>{icon}</Icon>
          {label}
        </NavItem>
      ))}
    </Nav>
  );
}
