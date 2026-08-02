package com.appforge.backend.repository;

import com.appforge.backend.model.Screen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScreenRepository extends JpaRepository<Screen, Long> {
    List<Screen> findByProjectId(Long projectId);
    void deleteByProjectId(Long projectId);
}
