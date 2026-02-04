import { jest } from '@jest/globals';
export const PrismaServiceMock = () => ({
  user: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
});
