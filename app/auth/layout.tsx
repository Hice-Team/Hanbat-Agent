import React from "react";

/**
 * Auth 레이아웃 - CSS는 app/layout.tsx의 globals.css만 사용합니다.
 * (경로 오타: '../global.css' ❌ → '../globals.css' ✅, 루트에서 이미 로드하므로 여기서 import 불필요)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
