import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertyQueryDto } from "./dto/property-query.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPropertyDto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: {
        ...createPropertyDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findAll(query: PropertyQueryDto) {
    const {
      query: searchQuery,
      type,
      priceMin,
      priceMax,
      rooms,
      areaMin,
      region,
      sortBy,
      page = 1,
      limit = 12,
    } = query;

    // Формируем where объект, исключая undefined/null значения
    const where: Prisma.PropertyWhereInput = {
      status: "ACTIVE",
    };

    if (type && typeof type === "string") {
      where.type = type;
    }

    if (region && typeof region === "string") {
      where.region = region;
    }

    // Формируем фильтр по цене только если есть хотя бы одно значение
    const priceFilter: Prisma.FloatFilter = {};
    if (typeof priceMin === "number" && !isNaN(priceMin) && priceMin >= 0) {
      priceFilter.gte = priceMin;
    }

    if (typeof priceMax === "number" && !isNaN(priceMax) && priceMax >= 0) {
      priceFilter.lte = priceMax;
    }

    // Добавляем фильтр по цене только если он не пустой
    if (Object.keys(priceFilter).length > 0) {
      where.price = priceFilter;
    }

    if (typeof rooms === "number" && !isNaN(rooms) && rooms > 0) {
      where.rooms = rooms;
    }

    if (typeof areaMin === "number" && !isNaN(areaMin) && areaMin >= 0) {
      where.area = { gte: areaMin };
    }

    if (
      searchQuery &&
      typeof searchQuery === "string" &&
      searchQuery.trim().length > 0
    ) {
      where.OR = [
        { title: { contains: searchQuery.trim(), mode: "insensitive" } },
        { description: { contains: searchQuery.trim(), mode: "insensitive" } },
        { location: { contains: searchQuery.trim(), mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
    if (sortBy === "price-asc") {
      orderBy.price = "asc";
    } else if (sortBy === "price-desc") {
      orderBy.price = "desc";
    } else if (sortBy === "date-desc") {
      orderBy.createdAt = "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const properties = await this.prisma.property.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
      take: 50,
    });

    return properties;
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException("Объявление не найдено");
    }

    // Increment views
    await this.prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return property;
  }

  async update(
    id: string,
    userId: string,
    updatePropertyDto: UpdatePropertyDto
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException("Объявление не найдено");
    }

    if (property.userId !== userId) {
      throw new ForbiddenException("Вы не можете редактировать это объявление");
    }

    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException("Объявление не найдено");
    }

    if (property.userId !== userId) {
      throw new ForbiddenException("Вы не можете удалить это объявление");
    }

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: "Объявление успешно удалено" };
  }
}
