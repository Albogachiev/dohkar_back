import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { PropertyStatus, PropertyType, UserRole } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStatistics() {
    const [
      totalUsers,
      totalProperties,
      activeProperties,
      pendingProperties,
      totalViews,
      premiumUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: PropertyStatus.ACTIVE } }),
      this.prisma.property.count({ where: { status: PropertyStatus.PENDING } }),
      this.prisma.property.aggregate({ _sum: { views: true } }),
      this.prisma.user.count({ where: { isPremium: true } }),
    ]);

    // Статистика по типам недвижимости
    const propertiesByType = await this.prisma.property.groupBy({
      by: ["type"],
      _count: { type: true },
    });

    // Статистика по регионам
    const propertiesByRegion = await this.prisma.property.groupBy({
      by: ["region"],
      _count: { region: true },
    });

    // Новые пользователи за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Новые объявления за последние 30 дней
    const newPropertiesLast30Days = await this.prisma.property.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Статистика по дням за последние 7 дней
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await this.prisma.property.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const dailyCounts = dailyStats.reduce(
      (acc, property) => {
        const date = property.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      overview: {
        totalUsers,
        totalProperties,
        activeProperties,
        pendingProperties,
        totalViews: totalViews._sum.views || 0,
        premiumUsers,
        newUsersLast30Days,
        newPropertiesLast30Days,
      },
      propertiesByType: propertiesByType.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      propertiesByRegion: propertiesByRegion.map((item) => ({
        region: item.region,
        count: item._count.region,
      })),
      dailyStats: Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  async getUsers(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          isPremium: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        ...user,
        propertiesCount: user._count.properties,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProperties(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: PropertyStatus,
    type?: PropertyType
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { location: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async updatePropertyStatus(propertyId: string, status: PropertyStatus) {
    return this.prisma.property.update({
      where: { id: propertyId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async deleteProperty(propertyId: string) {
    return this.prisma.property.delete({
      where: { id: propertyId },
    });
  }
}
