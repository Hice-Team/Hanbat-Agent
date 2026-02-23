import type { Metadata } from "next";
import { Nanum_Gothic, Black_Han_Sans } from "next/font/google";
import "./globals.css";

// Configure Nanum Gothic
const nanumGothic = Nanum_Gothic({
  weight: "400", // Specify weights needed
  subsets: ["latin"],
  variable: "--font-nanum-gothic",
});

// Configure Black Han Sans
const blackHanSans = Black_Han_Sans({
  weight: "400", // This font only comes in weight 400
  subsets: ["latin"],
  variable: "--font-black-han-sans",
});

export const metadata: Metadata = {
  title: "한밭메이트 - 한밭대학교 AI",
  description: "한밭대학교 인공지능소프트웨어학과 재학생이 만든 AI 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${nanumGothic.variable} ${blackHanSans.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}