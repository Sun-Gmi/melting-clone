import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "멜팅 클론 - 나를 기억하는 AI 캐릭터 채팅",
  description:
    "AI 캐릭터 채팅 서비스 클론 (개인 학습용 프로젝트). 호감도 시스템, 캐릭터 탐색, 채팅 UI 기본 틀.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-[#16161e] font-sans antialiased">{children}</body>
    </html>
  );
}
