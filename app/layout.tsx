import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Bloom High · 센터 유지율 현황',description:'함께하는 성장을 기록하는 월별 회원 관리'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko"><body>{children}</body></html>}
