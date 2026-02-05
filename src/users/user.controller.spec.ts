import { PayloadDTO } from '../auth/dto/payload-dto.js';
import { CreateUserDTO } from './dto/create-user-dto.js';
import { UpdateUserDTO } from './dto/update-user-dto.js';
import { UsersController } from './users.controller.js';
import { jest } from '@jest/globals';

describe('User Controller', () => {
  let controller: UsersController;

  let userServiceMock = {
    getUser: jest.fn(),
    getUserWithTasks: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    uploadFile: jest.fn(),
  };

  beforeEach(() => {
    controller = new UsersController(userServiceMock as any);
  });

  describe('get', () => {
    it('should get User by id.', async () => {
      // Arrange
      const userID = 1;

      // Act
      await controller.getUser(userID);

      // Asserts
      expect(userServiceMock.getUser).toHaveBeenCalledWith(userID);
    });

    it('should get User Whith your tasks.', async () => {
      // Arrange
      const userID = 1;

      // Act
      await controller.getUserWithTasks(userID);

      // Asserts
      expect(userServiceMock.getUserWithTasks).toHaveBeenCalledWith(userID);
    });
  });

  describe('create', () => {
    it('should create user.', async () => {
      // Arrange
      const data: CreateUserDTO = {
        name: 'fake',
        email: 'fake@gmail.com',
        password: 'senha',
      };

      // Act
      await controller.create(data);

      // Assert
      expect(userServiceMock.create).toHaveBeenCalledWith(data);
    });
  });

  describe('update', () => {
    it('should update user.', async () => {
      // Arrange
      const userID = 1;
      const data: UpdateUserDTO = {
        name: 'x',
      };
      const payload: PayloadDTO = {
        aud: '',
        email: 'x@x.com',
        exp: 1,
        iat: 1,
        iss: '2',
        sub: 1,
      };

      // Act
      await controller.update(userID, data, payload as any);

      // Assert
      expect(userServiceMock.update).toHaveBeenCalledWith(
        userID,
        data,
        payload,
      );
    });
  });

  describe('delete', () => {
    it('should delete user.', async () => {
      // Arrange
      const userID = 1;
      const payload: PayloadDTO = {
        aud: '',
        email: 'x@x.com',
        exp: 1,
        iat: 1,
        iss: '2',
        sub: 1,
      };

      // Act
      await controller.deletar(userID, payload);

      // Assert
      expect(userServiceMock.delete).toHaveBeenCalledWith(userID, payload);
    });
  });

  describe('upload pfp', () => {
    it('should upload avatar.', async () => {
      // Arrange
      const file = {
        originalname: 'victor.png',
        mimetype: 'image/png',
        size: 157,
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const payload: PayloadDTO = {
        aud: '',
        email: 'x@x.com',
        exp: 1,
        iat: 1,
        iss: '2',
        sub: 1,
      };

      // Act
      await controller.upload(payload, file as any);

      // Assert
      expect(userServiceMock.uploadFile).toHaveBeenCalledWith(file, payload);
    });
  });
});
