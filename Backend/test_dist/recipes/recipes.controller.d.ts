import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
export declare class RecipesController {
    private readonly recipesService;
    constructor(recipesService: RecipesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        ingredients: ({
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                price: number;
                unit: string;
                stockQuantity: number;
                mediaUrls: string[];
                healthInfo: string | null;
                tags: string[];
                isDeleted: boolean;
            } | null;
        } & {
            id: number;
            productId: number | null;
            ingredientName: string | null;
            quantityStr: string;
            recipeId: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
        prepTime: number | null;
        instructions: string;
    })[]>;
    findOne(id: number): Promise<{
        ingredients: ({
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                price: number;
                unit: string;
                stockQuantity: number;
                mediaUrls: string[];
                healthInfo: string | null;
                tags: string[];
                isDeleted: boolean;
            } | null;
        } & {
            id: number;
            productId: number | null;
            ingredientName: string | null;
            quantityStr: string;
            recipeId: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
        prepTime: number | null;
        instructions: string;
    }>;
    create(createRecipeDto: CreateRecipeDto): Promise<{
        ingredients: {
            id: number;
            productId: number | null;
            ingredientName: string | null;
            quantityStr: string;
            recipeId: number;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
        prepTime: number | null;
        instructions: string;
    }>;
    update(id: number, updateRecipeDto: UpdateRecipeDto): Promise<{
        ingredients: {
            id: number;
            productId: number | null;
            ingredientName: string | null;
            quantityStr: string;
            recipeId: number;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
        prepTime: number | null;
        instructions: string;
    }>;
    remove(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
        prepTime: number | null;
        instructions: string;
    }>;
}
