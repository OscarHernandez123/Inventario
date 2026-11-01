package com.inventory.demo.ingredient;

import com.inventory.demo.category.Category;
import com.inventory.demo.ingredient.IngredientDtos.CreateIngredientRequest;
import com.inventory.demo.ingredient.IngredientDtos.PatchIngredientRequest;
import com.inventory.demo.ingredient.IngredientDtos.IngredientResponse;;

public class IngredientMapper {

    public static Ingredient toEntity(CreateIngredientRequest request, Category category){
        return Ingredient.builder()
            .name(request.name().trim())
            .quantity(request.quantity())
            .minimumStock(request.minimumStock())
            .unit(request.unit())
            .category(category)
            .build();
    }

    public static void patch(PatchIngredientRequest request, Ingredient ingredient, Category category){

        if(request.name() != null){
            ingredient.setName(request.name().trim());
        }

        if(request.minimumStock() != null){
            ingredient.setMinimumStock(request.minimumStock());
        }

        if(request.unit() != null){
            ingredient.setUnit(request.unit());
        }

        if(category != null){
            ingredient.setCategory(category);
        }
    }

    public static IngredientResponse toResponse(Ingredient ingredient){
        return new IngredientResponse(
            ingredient.getId(), 
            ingredient.getName(), 
            ingredient.getQuantity(), 
            ingredient.getMinimumStock(), 
            ingredient.getUnit(), 
            ingredient.getCategory() != null ? ingredient.getCategory().getId() : null
        );
    }
}
