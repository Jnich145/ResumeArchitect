let userCount = 0;

export const getUserCount = async (): Promise<number> => {
  return userCount;
};

export const updateUserCount = async (increment: number): Promise<void> => {
  userCount += increment;
};

// Mock fetch function
(window as any).fetch = async (url: string, options?: RequestInit) => {
  if (url === '/api/users/count') {
    if (options?.method === 'POST') {
      const { increment } = JSON.parse(options.body as string);
      await updateUserCount(increment);
      return { json: async () => ({ success: true }) };
    } else {
      const count = await getUserCount();
      return { json: async () => ({ count }) };
    }
  }
  throw new Error(`Unhandled request: ${url}`);
};