import { Injectable } from '@nestjs/common';
import { CompanyCreateDto, CompanyDto, CompanyUpdateDto } from './company.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async list(options: {
    page: number;
    limit: number;
    search?: string;
    isDisabled?: boolean;
    isDeleted?: boolean;
  }): Promise<CompanyDto[]> {
    const { limit, page } = options;
    return this.prisma.company.findMany({
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
      where: {
        name: {
          contains: options.search,
        },
        isDeleted: options.isDeleted || false,
        isDisabled: options.isDisabled || false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(query: { id?: number }): Promise<CompanyDto> {
    return this.prisma.company.findUnique({
      where: {
        id: query.id,
      },
    });
  }

  async create(company: CompanyCreateDto): Promise<CompanyDto> {
    return await this.prisma.company.create({
      data: {
        name: company.name,
        phone: company.phone,
        address: company.address,
        logo: company.logo,
      },
    });
  }

  async update({
    id,
    data,
  }: {
    id: number;
    data: CompanyUpdateDto;
  }): Promise<CompanyDto> {
    return await this.prisma.company.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }
}
