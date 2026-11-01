package com.inventory.demo.ingredient;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

import com.inventory.demo.category.Category;
import com.inventory.demo.enums.Unit;

import java.math.BigDecimal;

@Entity
@Table(name="ingredients", uniqueConstraints = @UniqueConstraint(columnNames = {"name", "category_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {
    @Id @GeneratedValue (strategy = GenerationType.UUID) private UUID id;
    @Column (nullable = false) private String name;
    @Column (nullable = false, precision = 10, scale = 2) private BigDecimal quantity;
    @Column (nullable = false, precision = 10, scale = 2) private BigDecimal minimumStock;
    @Enumerated(EnumType.STRING) @Column (nullable = false) private Unit unit;
    @ManyToOne @JoinColumn (name = "category_id", nullable = false) private Category category;
}
