package com.inventory.demo.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.inventory.demo.category.Category;
import com.inventory.demo.category.CategoryRepository;

@Configuration
public class DefaultCategoryData {

    @Bean
    CommandLineRunner loadDefaultCategories(CategoryRepository categoryRepository) {
        return args -> List.of(
            new DefaultCategory("Harinas y secos", "Harinas, almidones, levaduras y otros ingredientes secos"),
            new DefaultCategory("Azúcares y endulzantes", "Azúcar, panela, miel y endulzantes"),
            new DefaultCategory("Lácteos y huevos", "Mantequilla, crema, leche, quesos y huevos"),
            new DefaultCategory("Chocolate y cacao", "Cacao, chocolate y coberturas"),
            new DefaultCategory("Esencias y saborizantes", "Vainilla, extractos, colorantes y saborizantes"),
            new DefaultCategory("Frutas y rellenos", "Frutas, mermeladas, pulpas y rellenos"),
            new DefaultCategory("Decoración", "Grageas, chispas, fondant y elementos decorativos"),
            new DefaultCategory("Empaques", "Cajas, bolsas, bases y etiquetas")
        ).forEach(defaultCategory -> {
            if (!categoryRepository.existsByNameIgnoreCase(defaultCategory.name())) {
                categoryRepository.save(Category.builder()
                    .name(defaultCategory.name())
                    .description(defaultCategory.description())
                    .build());
            }
        });
    }

    private record DefaultCategory(String name, String description) {
    }
}
