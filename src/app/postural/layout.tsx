'use client';

import { PosturalContextProvider } from './context';

export default function PosturalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PosturalContextProvider>{children}</PosturalContextProvider>;
}
