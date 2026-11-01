package com.inventory.demo.movement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.inventory.demo.enums.MovementReason;
import com.inventory.demo.enums.MovementType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public class MovementDtos {

    public record CreateMovementRequest(
        @NotNull MovementType type,
        @NotNull @DecimalMin(value = "0.0") BigDecimal quantity,
        @NotNull MovementReason reason,
        @NotNull UUID ingredientId,
        @Size(max = 500) String note
    ){}

    public record MovementResponse(
        UUID id,
        MovementType type,
        BigDecimal quantity,
        LocalDateTime date,
        MovementReason reason,
        UUID ingredientId,
        String note
    ){}
}
