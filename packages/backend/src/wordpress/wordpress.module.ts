import { Module } from '@nestjs/common';
import { WordpressService } from './wordpress.service';

@Module({
  providers: [WordpressService],
  exports: [WordpressService],
})
export class WordpressModule {}
