package com.inventory.demo.movement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.inventory.demo.enums.MovementReason;
import com.inventory.demo.enums.MovementType;
import com.inventory.demo.exceptions.BusinessException;
import com.inventory.demo.ingredient.Ingredient;
import com.inventory.demo.ingredient.IngredientRepository;
import com.inventory.demo.movement.MovementDtos.CreateMovementRequest;

@ExtendWith(MockitoExtension.class)
class MovementServiceImplTest {

    @Mock
    private MovementRepository movementRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @InjectMocks
    private MovementServiceImpl movementService;

    @Test
    void adjustmentCanSetTheStockToZeroAndKeepsTheNote() {
        UUID ingredientId = UUID.randomUUID();
        Ingredient ingredient = Ingredient.builder().id(ingredientId).quantity(new BigDecimal("3.00")).build();
        when(ingredientRepository.findById(ingredientId)).thenReturn(Optional.of(ingredient));
        when(movementRepository.save(any(Movement.class))).thenAnswer(invocation -> {
            Movement movement = invocation.getArgument(0);
            movement.setId(UUID.randomUUID());
            return movement;
        });

        var response = movementService.create(new CreateMovementRequest(
            MovementType.ADJUSTMENT, BigDecimal.ZERO, MovementReason.INVENTORY_CORRECTION,
            ingredientId, "Conteo físico"
        ));

        assertEquals(BigDecimal.ZERO, ingredient.getQuantity());
        assertEquals("Conteo físico", response.note());
    }

    @Test
    void outputCannotExceedTheCurrentStock() {
        UUID ingredientId = UUID.randomUUID();
        Ingredient ingredient = Ingredient.builder().id(ingredientId).quantity(new BigDecimal("3.00")).build();
        when(ingredientRepository.findById(ingredientId)).thenReturn(Optional.of(ingredient));

        var request = new CreateMovementRequest(
            MovementType.OUT, new BigDecimal("4.00"), MovementReason.CONSUMPTION, ingredientId, null
        );

        assertThrows(BusinessException.class, () -> movementService.create(request));
        verify(movementRepository, never()).save(any());
    }
}
