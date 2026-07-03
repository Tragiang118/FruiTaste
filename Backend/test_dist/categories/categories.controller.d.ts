import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(data: any): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: any): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
