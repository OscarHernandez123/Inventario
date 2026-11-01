package com.inventory.demo.movement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.inventory.demo.enums.MovementType;
import com.inventory.demo.exceptions.BusinessException;
import com.inventory.demo.exceptions.ResourceNotFoundException;
import com.inventory.demo.ingredient.Ingredient;
import com.inventory.demo.ingredient.IngredientRepository;
import com.inventory.demo.movement.MovementDtos.CreateMovementRequest;
import com.inventory.demo.movement.MovementDtos.MovementResponse;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MovementServiceImpl implements MovementService{

    private final MovementRepository movementRepository;

    private final IngredientRepository ingredientRepository;
    
    @Override
    public MovementResponse create(CreateMovementRequest request) {
        
        Ingredient ingredient = ingredientRepository.findById(request.ingredientId())
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient Not Found"));

        if (request.quantity().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Quantity cannot be negative");
        }

        if (request.type() != MovementType.ADJUSTMENT && request.quantity().compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessException("Quantity has to be positive");
        }

        BigDecimal newQuantity;

        if (request.type() == MovementType.IN) {

            newQuantity = ingredient.getQuantity().add(request.quantity());

        } else if (request.type() == MovementType.OUT) {

            if (ingredient.getQuantity().compareTo(request.quantity()) < 0) {
                throw new BusinessException(
                    "Quantity cannot be greater than current stock"
                );
            }

            newQuantity = ingredient.getQuantity().subtract(request.quantity());

        } else { // ADJUSTMENT

            newQuantity = request.quantity();
        }

        ingredient.setQuantity(newQuantity);
        ingredientRepository.save(ingredient);

        LocalDateTime date = LocalDateTime.now();

        Movement movement = MovementMapper.toEntity(request, ingredient);
        movement.setDate(date);

        Movement saved = movementRepository.save(movement);

        return MovementMapper.toResponse(saved);
    }

    @Override
    public List<MovementResponse> getMovementsByIngredient(UUID ingredientId){

        ingredientRepository.findById(ingredientId)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient Not Found"));

        List<Movement> movements = movementRepository.findByIngredientId(ingredientId);

        return movements.stream()
            .map(MovementMapper::toResponse)
            .toList();
    }

    @Override
    public MovementResponse get(UUID movementId) {
        
        Movement movement = movementRepository.findById(movementId)
            .orElseThrow(() -> new ResourceNotFoundException("Movement Not Found"));

        return MovementMapper.toResponse(movement);
    }

    @Override
    public List<MovementResponse> listAll() {
        
        return movementRepository.findAll()
            .stream()
            .map(MovementMapper::toResponse)
            .toList();
    }

}
