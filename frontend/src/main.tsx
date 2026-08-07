import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/presentation/components/ui/sonner';
import { createQueryClient } from '@/presentation/queryClient';
import { createAppRouter } from '@/presentation/routes/router';
import './index.css';

const queryClient = createQueryClient();
const router = createAppRouter(queryClient);

window.addEventListener('mentis:session-expired', () => {
  void router.navigate({
    to: '/login',
    search: { redirect: router.state.location.href },
  });
});

const rootElement = document.getElementById('root');
if (rootElement === null) throw new Error('Elemento #root não encontrado.');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>,
);
