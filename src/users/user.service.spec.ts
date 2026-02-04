import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HashingServiceProtocol } from '../auth/utils/hash.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';
import { UserMock } from './mocks/createUser.mock.js';
import { PrismaServiceMock } from './mocks/prismaService.mock.js';
import { HashServiceMock } from './mocks/hashService.mock.js';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PayloadMock } from './mocks/tokenPayload.mock.js';

describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;
  let hashService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: PrismaServiceMock() },
        { provide: HashingServiceProtocol, useValue: HashServiceMock() },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  describe('create', () => {
    it('should create user successfully.', async () => {
      // Arrange
      const userData = UserMock;
      const hashedPassword = 'senha_hasheada_123';
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');
      const mockUserCreated = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(hashService, 'hash').mockResolvedValue(hashedPassword);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(mockUserCreated as any);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });

      expect(hashService.hash).toHaveBeenCalledTimes(1);
      expect(hashService.hash).toHaveBeenCalledWith(userData.password);

      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash: hashedPassword,
        },
      });

      expect(result).toEqual({
        message: 'Usuário criado com sucesso.',
        data: {
          name: mockUserCreated.name,
          email: mockUserCreated.email,
          createdAt: mockUserCreated.createdAt,
        },
      });
    });

    it('should not create user because email exists.', async () => {
      // Arrange
      const userData = UserMock;
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');
      const mockUserCreated = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: 'hashedPassword',
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockUserCreated as any);

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
    });
  });

  describe('get', () => {
    it('should found and return user if your profile is active.', async () => {
      // Arrange
      const id: number = 1;
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');
      const mockUserCreated = {
        id: id,
        name: 'nome',
        email: 'oii@gmail.com',
        password: 'hashedPassword',
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(mockUserCreated as any);

      // Act
      const result = await userService.getUser(id);

      // Assert
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: id, active: true },
      });
      expect(result).toEqual({
        name: mockUserCreated.name,
        email: mockUserCreated.email,
        createdAt: mockCreatedAt,
      });
    });

    it('should not found user by id.', async () => {
      // Arrange
      const id: number = 30;

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUser(id)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update user successfully.', async () => {
      // Arrange
      const id: number = 1;
      const tokenPayload = PayloadMock;
      const hashedPassword = 'senha_hasheada_123';
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');

      const mockUserFromDB = {
        id: id,
        name: 'nome antigo',
        email: 'user@example.com',
        passwordHash: 'old_hash',
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };

      const updateData = {
        name: 'nome novo',
        password: 'nova_senha',
      };

      const mockUserUpdated = {
        ...mockUserFromDB,
        ...updateData,
      };

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(mockUserFromDB as any);
      jest.spyOn(hashService, 'hash').mockResolvedValue(hashedPassword);
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(mockUserUpdated as any);

      // Act
      const result = await userService.update(id, updateData, tokenPayload);

      // Assert
      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: id, active: true },
      });

      expect(hashService.hash).toHaveBeenCalledTimes(1);
      expect(hashService.hash).toHaveBeenCalledWith(updateData.password);

      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: id },
        data: {
          name: updateData.name,
          passwordHash: hashedPassword,
        },
      });

      expect(result).toEqual({
        message: 'Usuário atualizado com sucesso.',
        data: {
          name: mockUserUpdated.name,
          email: mockUserUpdated.email,
          createdAt: mockUserUpdated.createdAt,
        },
      });
    });

    it('should not found User.', async () => {
      // Arrange
      const id: number = 1;
      const userData = UserMock;
      const tokenPayload = PayloadMock;
      const hashedPassword = 'senha_hasheada_123';
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');
      const mockUserCreated = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.update(id, mockUserCreated, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw unauthorized exception.', async () => {
      // Arrange
      const id: number = 1;
      const userData = UserMock;
      const tokenPayload = { ...PayloadMock, sub: 10 }; // IDs diferentes para forçar 401
      const hashedPassword = 'senha_hasheada_123';
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');
      const mockUserCreated = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(mockUserCreated as any);

      // Act & Assert
      await expect(
        userService.update(id, mockUserCreated, tokenPayload),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: id, active: true },
      });
    });
  });

  describe('delete', () => {
    it('should "delete" succesfully.', async () => {
      // Arrange
      const id: number = 1;
      const payload = PayloadMock;
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');
      const mockUser = {
        id: id,
        name: 'nome',
        email: 'user@example.com',
        passwordHash: '_hash',
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };
      const mockUserDeleted = {
        ...mockUser,
        active: false,
      };

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(mockUserDeleted as any);

      // Act
      const result = await userService.delete(id, payload);

      // Assert
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: id, active: true },
      });
      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: id },
        data: { active: false },
      });
      expect(result).toEqual({
        message: 'Usuário inativado com sucesso!',
      });
    });

    it('should not found user by id received.', async () => {
      // Arrange
      const id: number = 1;
      const payload = PayloadMock;

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(userService.delete(id, payload)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw inhautorization exception.', async () => {
      // Arrange
      const id: number = 1;
      const payload = { ...PayloadMock, sub: 67 };
      const mockCreatedAt = new Date('2026-02-03T10:00:00.000Z');
      const mockUser = {
        id: id,
        name: 'nome',
        email: 'user@example.com',
        passwordHash: '_hash',
        createdAt: mockCreatedAt,
        active: true,
        avatar: null,
      };

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(mockUser as any);

      // Act & Assert
      await expect(userService.delete(id, payload)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
    });
  });
});
