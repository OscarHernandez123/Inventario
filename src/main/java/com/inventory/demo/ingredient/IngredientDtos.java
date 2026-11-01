package com.inventory.demo.ingredient;

import java.math.BigDecimal;
import java.util.UUID;

import com.inventory.demo.enums.Unit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class IngredientDtos {

    public record CreateIngredientRequest(
        @NotBlank String name,
        @NotNull @DecimalMin(value = "0.0") BigDecimal quantity,
        @NotNull @DecimalMin(value = "0.0") BigDecimal minimumStock,
        @NotNull Unit unit,
        @NotNull UUID categoryId
    ){}

    public record PatchIngredientRequest(
        String name,
        BigDecimal minimumStock,
        Unit unit,
        UUID categoryId
    ){}

    public record IngredientResponse(
        UUID id,
        String name,
        BigDecimal quantity,
        BigDecimal minimumStock,
        Unit unit,
        UUID categoryId
    ){}
}
