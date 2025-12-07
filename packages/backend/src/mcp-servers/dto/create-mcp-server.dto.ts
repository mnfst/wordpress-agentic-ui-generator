import { IsUrl, IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

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
  wordpressUrl!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens (e.g., my-blog)',
  })
  slug?: string;
}
