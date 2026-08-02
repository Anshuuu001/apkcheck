package com.appforge.backend.controller;

import com.appforge.backend.model.ChatMessage;
import com.appforge.backend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @GetMapping("/history/{projectId}")
    public List<ChatMessage> getChatHistory(@PathVariable Long projectId) {
        return chatMessageRepository.findByProjectIdOrderByIdAsc(projectId);
    }

    @PostMapping("/message")
    public ResponseEntity<?> addChatMessage(@RequestBody AddMessageRequest request) {
        if (request.getProjectId() == null || request.getRole() == null || request.getContent() == null) {
            return ResponseEntity.badRequest().body("Error: Project ID, Role and Content are required");
        }

        // Call constructor instead of builder pattern
        ChatMessage message = new ChatMessage(
                request.getProjectId(),
                request.getRole(),
                request.getContent(),
                request.getImagePath()
        );

        chatMessageRepository.save(message);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/history/{projectId}")
    @Transactional
    public ResponseEntity<?> clearChatHistory(@PathVariable Long projectId) {
        chatMessageRepository.deleteByProjectId(projectId);
        return ResponseEntity.ok().body("{\"success\":true}");
    }

    // Explicit requests/responses helper classes (replaces Lombok)
    public static class AddMessageRequest {
        private Long projectId;
        private String role;
        private String content;
        private String imagePath;

        public AddMessageRequest() {}

        public AddMessageRequest(Long projectId, String role, String content, String imagePath) {
            this.projectId = projectId;
            this.role = role;
            this.content = content;
            this.imagePath = imagePath;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getImagePath() {
            return imagePath;
        }

        public void setImagePath(String imagePath) {
            this.imagePath = imagePath;
        }
    }
}
