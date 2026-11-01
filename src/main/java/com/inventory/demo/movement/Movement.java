package com.inventory.demo.movement;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

import com.inventory.demo.enums.MovementReason;
import com.inventory.demo.enums.MovementType;
import com.inventory.demo.ingredient.Ingredient;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name="movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movement {
    @Id @GeneratedValue (strategy = GenerationType.UUID) private UUID id;
    @Enumerated(EnumType.STRING) @Column (nullable = false) private MovementType type;
    @Column (nullable = false, precision = 10, scale = 2) private BigDecimal quantity;
    @Column (nullable = false) private LocalDateTime date;
    @Enumerated(EnumType.STRING) @Column (nullable = false) private MovementReason reason;
    @Column(length = 500) private String note;
    @ManyToOne @JoinColumn (name = "ingredient_id") private Ingredient ingredient;
}
