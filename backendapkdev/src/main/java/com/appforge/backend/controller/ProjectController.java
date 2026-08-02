package com.appforge.backend.controller;

import com.appforge.backend.model.*;
import com.appforge.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private ComponentRepository componentRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectDetails(@PathVariable Long id) {
        Project project = projectRepository.findById(id).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        List<Screen> screens = screenRepository.findByProjectId(id);
        List<Component> components = componentRepository.findByProjectId(id);
        List<ChatMessage> chatHistory = chatMessageRepository.findByProjectIdOrderByIdAsc(id);

        return ResponseEntity.ok(new ProjectDetailsResponse(project, screens, components, chatHistory));
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody CreateProjectRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Project name cannot be empty");
        }
        
        String trimmedName = request.getName().trim();
        if (projectRepository.existsByName(trimmedName)) {
            return ResponseEntity.badRequest().body("Error: A project named \"" + trimmedName + "\" already exists");
        }

        String initialSettings = "{\"theme\":\"" + request.getTheme() + "\",\"version\":\"1.0.0\",\"features\":{\"login\":false,\"payment\":false,\"chat\":false,\"gps\":false}}";
        String initialBlueprint = "{\"name\":\"" + trimmedName + "\",\"screens\":[],\"components\":[],\"database\":{\"tables\":[]},\"api\":{\"endpoints\":[]},\"navigation\":{\"routes\":[]}}";

        // Call constructor instead of builder pattern
        Project project = new Project(
                trimmedName,
                request.getTheme() != null ? request.getTheme() : "Dark",
                initialSettings,
                initialBlueprint
        );

        projectRepository.save(project);
        return ResponseEntity.ok(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody UpdateProjectRequest request) {
        Project project = projectRepository.findById(id).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String trimmedName = request.getName().trim();
            if (!trimmedName.equalsIgnoreCase(project.getName()) && projectRepository.existsByName(trimmedName)) {
                return ResponseEntity.badRequest().body("Error: A project named \"" + trimmedName + "\" already exists");
            }
            project.setName(trimmedName);
        }

        if (request.getTheme() != null) {
            project.setTheme(request.getTheme());
        }
        if (request.getSettings() != null) {
            project.setSettings(request.getSettings());
        }
        if (request.getBlueprint() != null) {
            project.setBlueprint(request.getBlueprint());
        }

        projectRepository.save(project);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Delete cascade items
        screenRepository.deleteByProjectId(id);
        componentRepository.deleteByProjectId(id);
        chatMessageRepository.deleteByProjectId(id);

        projectRepository.deleteById(id);

        return ResponseEntity.ok().body("{\"success\":true}");
    }

    // Explicit requests/responses helper classes (replaces Lombok)
    public static class ProjectDetailsResponse {
        private Project project;
        private List<Screen> screens;
        private List<Component> components;
        private List<ChatMessage> chatHistory;

        public ProjectDetailsResponse(Project project, List<Screen> screens, List<Component> components, List<ChatMessage> chatHistory) {
            this.project = project;
            this.screens = screens;
            this.components = components;
            this.chatHistory = chatHistory;
        }

        public Project getProject() {
            return project;
        }

        public void setProject(Project project) {
            this.project = project;
        }

        public List<Screen> getScreens() {
            return screens;
        }

        public void setScreens(List<Screen> screens) {
            this.screens = screens;
        }

        public List<Component> getComponents() {
            return components;
        }

        public void setComponents(List<Component> components) {
            this.components = components;
        }

        public List<ChatMessage> getChatHistory() {
            return chatHistory;
        }

        public void setChatHistory(List<ChatMessage> chatHistory) {
            this.chatHistory = chatHistory;
        }
    }

    public static class CreateProjectRequest {
        private String name;
        private String theme;

        public CreateProjectRequest() {}

        public CreateProjectRequest(String name, String theme) {
            this.name = name;
            this.theme = theme;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getTheme() {
            return theme;
        }

        public void setTheme(String theme) {
            this.theme = theme;
        }
    }

    public static class UpdateProjectRequest {
        private String name;
        private String theme;
        private String settings;
        private String blueprint;

        public UpdateProjectRequest() {}

        public UpdateProjectRequest(String name, String theme, String settings, String blueprint) {
            this.name = name;
            this.theme = theme;
            this.settings = settings;
            this.blueprint = blueprint;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getTheme() {
            return theme;
        }

        public void setTheme(String theme) {
            this.theme = theme;
        }

        public String getSettings() {
            return settings;
        }

        public void setSettings(String settings) {
            this.settings = settings;
        }

        public String getBlueprint() {
            return blueprint;
        }

        public void setBlueprint(String blueprint) {
            this.blueprint = blueprint;
        }
    }
}
