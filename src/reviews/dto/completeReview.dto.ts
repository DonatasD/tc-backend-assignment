import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CompleteReviewDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Max(10)
  @Min(1)
  grade: number;

  @IsNotEmpty()
  @ApiProperty({ example: 'comment about provided grade' })
  comment: string;
}
