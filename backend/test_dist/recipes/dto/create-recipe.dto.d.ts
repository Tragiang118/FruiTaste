export declare class CreateRecipeIngredientDto {
    productId?: number;
    ingredientName?: string;
    quantityStr: string;
}
export declare class CreateRecipeDto {
    name: string;
    description?: string;
    prepTime?: number;
    instructions: string;
    imageUrl?: string;
    ingredients: CreateRecipeIngredientDto[];
}
