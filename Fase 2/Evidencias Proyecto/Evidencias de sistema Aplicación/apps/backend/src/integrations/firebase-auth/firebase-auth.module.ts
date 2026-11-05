import { Module } from '@nestjs/common';
import { FirebaseAuthController } from './firebase-auth.controller';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
  controllers: [FirebaseAuthController],
  providers: [FirebaseAuthService, FirebaseAuthGuard],
  exports: [FirebaseAuthService, FirebaseAuthGuard],
})
export class FirebaseAuthModule {}
