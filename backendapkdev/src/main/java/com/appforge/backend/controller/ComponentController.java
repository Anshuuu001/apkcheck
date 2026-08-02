package com.appforge.backend.controller;

import com.appforge.backend.model.Component;
import com.appforge.backend.repository.ComponentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/components")
public class ComponentController {

    @Autowired
    private ComponentRepository componentRepository;

    @PostMapping
    public ResponseEntity<?> createComponent(@RequestBody CreateComponentRequest request) {
        if (request.getProjectId() == null || request.getName() == null || request.getName().trim().isEmpty() || request.getType() == null) {
            return ResponseEntity.badRequest().body("Error: Project ID, Name and Type are required");
        }

        // Call constructor instead of builder pattern
        Component component = new Component(
                request.getProjectId(),
                request.getName().trim(),
                request.getType().trim(),
                request.getConfigData() != null ? request.getConfigData() : "{}"
        );

        componentRepository.save(component);
        return ResponseEntity.ok(component);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComponent(@PathVariable Long id, @RequestBody UpdateComponentRequest request) {
        Component component = componentRepository.findById(id).orElse(null);
        if (component == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            component.setName(request.getName().trim());
        }
        if (request.getType() != null && !request.getType().trim().isEmpty()) {
            component.setType(request.getType().trim());
        }
        if (request.getConfigData() != null) {
            component.setConfigData(request.getConfigData());
        }

        componentRepository.save(component);
        return ResponseEntity.ok(component);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComponent(@PathVariable Long id) {
        if (!componentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        componentRepository.deleteById(id);
        return ResponseEntity.ok().body("{\"success\":true}");
    }

    // Explicit requests/responses helper classes (replaces Lombok)
    public static class CreateComponentRequest {
        private Long projectId;
        private String name;
        private String type;
        private String configData;

        public CreateComponentRequest() {}

        public CreateComponentRequest(Long projectId, String name, String type, String configData) {
            this.projectId = projectId;
            this.name = name;
            this.type = type;
            this.configData = configData;
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

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getConfigData() {
            return configData;
        }

        public void setConfigData(String configData) {
            this.configData = configData;
        }
    }

    public static class UpdateComponentRequest {
        private String name;
        private String type;
        private String configData;

        public UpdateComponentRequest() {}

        public UpdateComponentRequest(String name, String type, String configData) {
            this.name = name;
            this.type = type;
            this.configData = configData;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getConfigData() {
            return configData;
        }

        public void setConfigData(String configData) {
            this.configData = configData;
        }
    }
}
