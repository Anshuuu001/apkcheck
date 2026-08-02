package com.appforge.backend.repository;

import com.appforge.backend.model.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {
    List<Component> findByProjectId(Long projectId);
    void deleteByProjectId(Long projectId);
}
