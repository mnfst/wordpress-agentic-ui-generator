import { IsUrl, IsNotEmpty, IsString } from 'class-validator';

export class CreateMcpServerDto {
  @IsNotEmpty({ message: 'WordPress URL is required' })
  @IsString()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: false,
    },
    { message: 'Please provide a valid URL' },
  )
  wordpressUrl: string;
}
