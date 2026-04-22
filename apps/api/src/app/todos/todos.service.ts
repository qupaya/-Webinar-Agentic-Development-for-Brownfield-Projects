import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { TodoEntity } from './todo.entity';
import { CreateTodoDto, UpdateTodoDto, Todo } from '@webinar/shared-models';

@Injectable()
export class TodosService implements OnModuleInit {
  private readonly logger = new Logger(TodosService.name);

  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepo: Repository<TodoEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.todoRepo.count();
    if (count === 0) {
      this.logger.log('No existing data found — seeding demo data...');
      await this.seed();
      this.logger.log('Demo data seeded successfully');
    }
  }

  async findAll(search?: string): Promise<Todo[]> {
    if (search) {
      const q = `%${search}%`;
      return this.todoRepo.find({
        where: [{ title: Like(q) }, { description: Like(q) }],
        order: { createdAt: 'DESC' },
      });
    }
    return this.todoRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepo.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepo.create({
      ...dto,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return this.todoRepo.save(todo);
  }

  async update(id: number, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    Object.assign(todo, dto);
    return this.todoRepo.save(todo);
  }

  async remove(id: number): Promise<void> {
    const todo = await this.findOne(id);
    await this.todoRepo.remove(todo);
  }

  async accept(id: number, reason: string): Promise<Todo> {
    const todo = await this.findOne(id);
    todo.status = 'accepted';
    todo.processedDate = new Date().toISOString();
    todo.processedReason = reason;
    return this.todoRepo.save(todo);
  }

  async reject(id: number, reason: string): Promise<Todo> {
    const todo = await this.findOne(id);
    todo.status = 'rejected';
    todo.processedDate = new Date().toISOString();
    todo.processedReason = reason;
    return this.todoRepo.save(todo);
  }

  async setPending(id: number): Promise<Todo> {
    const todo = await this.findOne(id);
    todo.status = 'pending';
    todo.processedDate = undefined;
    todo.processedReason = undefined;
    return this.todoRepo.save(todo);
  }

  async seed(): Promise<Todo[]> {
    // Clear existing data
    await this.todoRepo.clear();

    const { DEMO_DATA } = await import('./demo-data');
    const entities = DEMO_DATA.map((t) => this.todoRepo.create(t));
    return this.todoRepo.save(entities);
  }
}
