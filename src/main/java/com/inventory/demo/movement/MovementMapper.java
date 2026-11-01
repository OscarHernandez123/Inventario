package com.inventory.demo.movement;

import com.inventory.demo.ingredient.Ingredient;
import com.inventory.demo.movement.MovementDtos.CreateMovementRequest;
import com.inventory.demo.movement.MovementDtos.MovementResponse;

public class MovementMapper {

    public static Movement toEntity(CreateMovementRequest request, Ingredient ingredient){
        return Movement.builder()
            .type(request.type())
            .quantity(request.quantity())
            .reason(request.reason())
            .note(request.note())
            .ingredient(ingredient)
            .build();
    }

    public static MovementResponse toResponse(Movement movement){
        return new MovementResponse(
            movement.getId(), 
            movement.getType(), 
            movement.getQuantity(), 
            movement.getDate(), 
            movement.getReason(),
            movement.getIngredient() != null ? movement.getIngredient().getId() : null,
            movement.getNote()
        );
    }
}
