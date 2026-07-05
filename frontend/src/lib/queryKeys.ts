export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters?: object) => ['products', 'list', filters] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  receipts: {
    all: ['receipts'] as const,
    list: (filters?: object) => ['receipts', 'list', filters] as const,
    detail: (id: number) => ['receipts', 'detail', id] as const,
  },
  exports: {
    all: ['exports'] as const,
    list: (filters?: object) => ['exports', 'list', filters] as const,
  },
  partners: {
    all: ['partners'] as const,
  },
};
