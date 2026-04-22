import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto, ProcessPetitionDto, Todo } from '@webinar/shared-models';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(@Query('search') search?: string): Promise<Todo[]> {
    return this.todosService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.todosService.findOne(id);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Roles('admin')
  create(@Body() dto: CreateTodoDto): Promise<Todo> {
    return this.todosService.create(dto);
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTodoDto): Promise<Todo> {
    return this.todosService.update(id, dto);
  }

  @Patch(':id/accept')
  @UseGuards(RoleGuard)
  @Roles('admin')
  accept(@Param('id', ParseIntPipe) id: number, @Body() dto: ProcessPetitionDto): Promise<Todo> {
    return this.todosService.accept(id, dto.reason);
  }

  @Patch(':id/reject')
  @UseGuards(RoleGuard)
  @Roles('admin')
  reject(@Param('id', ParseIntPipe) id: number, @Body() dto: ProcessPetitionDto): Promise<Todo> {
    return this.todosService.reject(id, dto.reason);
  }

  @Patch(':id/pending')
  @UseGuards(RoleGuard)
  @Roles('admin')
  setPending(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.todosService.setPending(id);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.todosService.remove(id);
  }

  @Post('seed')
  @UseGuards(RoleGuard)
  @Roles('admin')
  seed(): Promise<Todo[]> {
    return this.todosService.seed();
  }
}
