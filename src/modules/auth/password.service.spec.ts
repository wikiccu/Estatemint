import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('hashes and verifies a password', async () => {
    const passwordHash = await service.hash('Password123!');

    expect(passwordHash).not.toBe('Password123!');
    await expect(service.verify('Password123!', passwordHash)).resolves.toBe(
      true,
    );
    await expect(service.verify('wrong-password', passwordHash)).resolves.toBe(
      false,
    );
  });
});
