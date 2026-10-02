import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title:'VERITAS-X — Adversarial AI Verification Engine', description:'Generate, challenge, verify, correct, or reject AI outputs.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
