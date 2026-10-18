// src/test/app.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { describe, it, expect } from 'vitest';
import { routeTree } from '@/routeTree.gen';

describe('Renderização do App', () => {
  it('deve carregar a página inicial com sucesso', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const router = createRouter({ 
      routeTree, 
      context: { queryClient } 
    });

    // 1. ADICIONE ESTA LINHA: Espera o roteador carregar a rota internamente
    await router.load();

    // 2. Renderiza normalmente
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    // 3. Agora o elemento deve estar presente na tela simulada
    await waitFor(() => {
      const elementoHome = screen.getByText(/E-mail/i); 
      expect(elementoHome).toBeInTheDocument();
    });
  });
});
