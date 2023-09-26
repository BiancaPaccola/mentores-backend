import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SwaggerConfirmEmail } from '../../shared/Swagger/decorators/mentor/confirm-email.swagger.decorator';
import { SwaggerCreateMentor } from '../../shared/Swagger/decorators/mentor/create-mentor.swagger.decorator';
import { SwaggerGetMentor } from '../../shared/Swagger/decorators/mentor/get-mentor.swagger.decorator';
import { ActiveMentorDto } from './dtos/active-mentor.dto';
import { CreateMentorDto } from './dtos/create-mentor.dto';
import { GetByParamDto } from './dtos/get-by-param.dto';
import { SearchMentorDto } from './dtos/search-mentor.dto';
import { UpdateMentorDto } from './dtos/update-mentor.dto';
import { MentorService } from './mentor.service';
import { SearchByEmailDto } from './dtos/search-by-email.dto';
import { SwaggerRestoreAccount } from 'src/shared/Swagger/decorators/mentor/restore-account.swagger.decorator';
import { MentorPassConfirmationDto } from './dtos/mentor-pass-confirmation.dto';
import { SwaggerRestoreAccountEmail } from 'src/shared/Swagger/decorators/mentor/classes/restoreAccountEmail.swagger';
import { LoggedMentor } from '../auth/decorator/logged-mentor.decorator';
import { MentorEntity } from './entities/mentor.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { SwaggerUpdateMentorById } from 'src/shared/Swagger/decorators/mentor/update-mentor-by-id.swagger';

@ApiTags('mentor')
@Controller('mentor')
export class MentorController {
  constructor(private mentorService: MentorService) {}

  @Post()
  @SwaggerCreateMentor()
  async createMentor(@Body() createMentorDto: CreateMentorDto) {
    return this.mentorService.createMentor(createMentorDto);
  }

  @ApiExcludeEndpoint()
  @Get()
  async getAllMentors() {
    return this.mentorService.getAllMentors();
  }

  @Get('search')
  @SwaggerGetMentor()
  async findByNameAndRole(
    @Res() res: Response,
    @Query() { fullName, specialties }: SearchMentorDto, specialty: string
  ) {
    const data = await this.mentorService.findMentorByNameAndRole(
      fullName,
      specialty,
      specialties
    );

    return res.status(HttpStatus.OK).send(data);
  }

  @Get([':id'])
  @SwaggerGetMentor()
  async getMentorById(
    @Param() { id }: Partial<GetByParamDto>,
    @Res() res: Response,
  ) {
    const { status, data } = await this.mentorService.findMentorById(id);

    return res.status(status).send(data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @SwaggerUpdateMentorById()
  @Put(':id')
  async updateMentor(
    @LoggedMentor() Mentor: MentorEntity,
    @Body() data: UpdateMentorDto,
  ) {
    return await this.mentorService.updateMentor(Mentor.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor("file"))
  @Post("uploadProfileImage")
  async uploadProfileImage(@LoggedMentor() Mentor: MentorEntity, @UploadedFile("file") file) {
    
    return await this.mentorService.uploadProfileImage(Mentor, file )
  }

  @Patch('active')
  @SwaggerConfirmEmail()
  async activeMentor(@Query() queryData: ActiveMentorDto, @Res() res: Response) {
    const { data, status } = await this.mentorService.activeMentor(queryData);
    return res.status(status).send(data);
  }

  @ApiExcludeEndpoint()
  @Patch(':id')
  async desactivateLoggedMentor(@Param() { id }: GetByParamDto) {
    return this.mentorService.desactivateLoggedMentor(id);
  }

  @SwaggerRestoreAccountEmail()
  @Post('restoreAccount/:email')
  async restoreAccount(@Param() { email }: SearchByEmailDto) {
    return this.mentorService.sendRestorationEmail(email);
  }

  @Patch('restoreAccount/redefinePass')
  @SwaggerRestoreAccount()
  async redefineMentorPassword(
    @Query() queryData: ActiveMentorDto,
    @Body() passData: MentorPassConfirmationDto,
  ) {
    return this.mentorService.redefineMentorPassword(queryData, passData);
  }
}