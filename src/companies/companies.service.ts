import { Injectable } from '@nestjs/common';
import {
  CompanyCreateDto,
  CompanyDto,
  CompanyAdminUpdateDto,
} from './company.dto';
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
    isHaveActiveCampaigns?: boolean;
  }): Promise<CompanyDto[]> {
    const { limit, page, isHaveActiveCampaigns } = options;
    return this.prisma.company.findMany({
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
      where: {
        name: {
          contains: options.search ? `${options.search}` : undefined,
          mode: 'insensitive',
        },
        isDeleted: options.isDeleted || false,
        isDisabled: options.isDisabled || false,
        campaigns: isHaveActiveCampaigns
          ? {
              some: {
                endDate: {
                  gte: new Date(),
                },
              },
            }
          : undefined,
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
      include: {
        stores: true,
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
    data: CompanyAdminUpdateDto;
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
