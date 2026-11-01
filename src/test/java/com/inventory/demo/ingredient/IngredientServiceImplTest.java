package com.inventory.demo.ingredient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.inventory.demo.category.Category;
import com.inventory.demo.category.CategoryRepository;
import com.inventory.demo.enums.Unit;
import com.inventory.demo.exceptions.BusinessException;
import com.inventory.demo.ingredient.IngredientDtos.CreateIngredientRequest;
import com.inventory.demo.ingredient.IngredientDtos.PatchIngredientRequest;

@ExtendWith(MockitoExtension.class)
class IngredientServiceImplTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private IngredientServiceImpl ingredientService;

    @Test
    void patchUpdatesOnlyTheProvidedFields() {
        UUID ingredientId = UUID.randomUUID();
        Category category = Category.builder().id(UUID.randomUUID()).name("Secos").build();
        Ingredient ingredient = Ingredient.builder()
            .id(ingredientId)
            .name("Harina")
            .quantity(new BigDecimal("5.00"))
            .minimumStock(new BigDecimal("1.00"))
            .unit(Unit.KG)
            .category(category)
            .build();

        when(ingredientRepository.findById(ingredientId)).thenReturn(Optional.of(ingredient));
        when(ingredientRepository.existsByNameIgnoreCaseAndCategoryIdAndIdNot(any(), any(), eq(ingredientId)))
            .thenReturn(false);
        when(ingredientRepository.save(any(Ingredient.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = ingredientService.patch(
            new PatchIngredientRequest("Harina integral", null, null, null), ingredientId
        );

        assertEquals("Harina integral", response.name());
        assertEquals(category.getId(), response.categoryId());
        verifyNoInteractions(categoryRepository);
    }

    @Test
    void createRejectsARepeatedNameInTheSameCategory() {
        UUID categoryId = UUID.randomUUID();
        when(categoryRepository.findById(categoryId))
            .thenReturn(Optional.of(Category.builder().id(categoryId).name("Secos").build()));
        when(ingredientRepository.existsByNameIgnoreCaseAndCategoryId("Harina", categoryId)).thenReturn(true);

        var request = new CreateIngredientRequest(
            "Harina", BigDecimal.ZERO, BigDecimal.ZERO, Unit.KG, categoryId
        );

        assertThrows(BusinessException.class, () -> ingredientService.create(request));
    }
}
