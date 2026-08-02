package com.appforge.backend.controller;

import com.appforge.backend.model.Screen;
import com.appforge.backend.repository.ScreenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/screens")
public class ScreenController {

    @Autowired
    private ScreenRepository screenRepository;

    @PostMapping
    public ResponseEntity<?> createScreen(@RequestBody CreateScreenRequest request) {
        if (request.getProjectId() == null || request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Project ID and Screen name are required");
        }

        // Call constructor instead of builder pattern
        Screen screen = new Screen(
                request.getProjectId(),
                request.getName().trim(),
                request.getLayoutData() != null ? request.getLayoutData() : "{\"elements\":[]}"
        );

        screenRepository.save(screen);
        return ResponseEntity.ok(screen);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateScreen(@PathVariable Long id, @RequestBody UpdateScreenRequest request) {
        Screen screen = screenRepository.findById(id).orElse(null);
        if (screen == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            screen.setName(request.getName().trim());
        }
        if (request.getLayoutData() != null) {
            screen.setLayoutData(request.getLayoutData());
        }

        screenRepository.save(screen);
        return ResponseEntity.ok(screen);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScreen(@PathVariable Long id) {
        if (!screenRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        screenRepository.deleteById(id);
        return ResponseEntity.ok().body("{\"success\":true}");
    }

    // Explicit requests/responses helper classes (replaces Lombok)
    public static class CreateScreenRequest {
        private Long projectId;
        private String name;
        private String layoutData;

        public CreateScreenRequest() {}

        public CreateScreenRequest(Long projectId, String name, String layoutData) {
            this.projectId = projectId;
            this.name = name;
            this.layoutData = layoutData;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getLayoutData() {
            return layoutData;
        }

        public void setLayoutData(String layoutData) {
            this.layoutData = layoutData;
        }
    }

    public static class UpdateScreenRequest {
        private String name;
        private String layoutData;

        public UpdateScreenRequest() {}

        public UpdateScreenRequest(String name, String layoutData) {
            this.name = name;
            this.layoutData = layoutData;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getLayoutData() {
            return layoutData;
        }

        public void setLayoutData(String layoutData) {
            this.layoutData = layoutData;
        }
    }
}
