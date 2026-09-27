import { Outlet } from '@tanstack/react-router';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
