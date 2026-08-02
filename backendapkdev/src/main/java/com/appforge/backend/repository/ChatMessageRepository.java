package com.appforge.backend.repository;

import com.appforge.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByProjectIdOrderByIdAsc(Long projectId);
    void deleteByProjectId(Long projectId);
}
