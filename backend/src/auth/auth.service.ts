import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';
import { UserResponseDto } from '../user/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<LoginResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash: hashedPassword,
    });

    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: User): LoginResponseDto {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload);

    return plainToInstance(LoginResponseDto, { accessToken, refreshToken });
  }

  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(
      this.config.get('BCRYPT_SALT_ROUNDS') || '10',
      10,
    );
    return bcrypt.hash(password, saltRounds);
  }
}
