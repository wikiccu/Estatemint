import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SafeUser } from '../users/types/safe-user.type';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { AuthenticatedUser, JwtPayload } from './types/authenticated-user.type';

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<SafeUser> {
    const passwordHash = await this.passwordService.hash(registerDto.password);

    return this.usersService.createUser({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailForAuth(loginDto.email);

    if (user === null) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.passwordService.verify(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive.');
    }

    const safeUser = await this.usersService.findById(user.id);

    if (safeUser === null) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      accessToken: await this.signAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
      user: safeUser,
    };
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);

    if (user === null || !user.isActive) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    return user;
  }

  private signAccessToken(user: AuthenticatedUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
