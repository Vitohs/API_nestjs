import { HashingServiceProtocol } from './hash.service.js';
import bcrypt from 'bcryptjs';

export class BcryptService extends HashingServiceProtocol {
  /**
   *
   * Insira a senha para ser hashada (ou hasheada ?)
   */

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(); // tamanho
    return bcrypt.hash(password, salt);
  }

  /**
   *
   * @param password
   * @param passwordHash
   * @returns true / false
   */

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
