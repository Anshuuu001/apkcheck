import type { ApiPlan } from '../blueprint/schema';

export class SpringCompiler {
  /**
   * Compiles Spring Boot endpoints controllers, entities, and services
   */
  static compile(plan: ApiPlan): Record<string, string> {
    const files: Record<string, string> = {};

    plan.endpoints.forEach(ep => {
      const entityName = ep.tag || 'Record';
      const cleanEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);
      
      // Controller
      files[`src/main/java/com/appforge/controller/${cleanEntity}Controller.java`] = `
package com.appforge.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/${cleanEntity.toLowerCase()}s")
public class ${cleanEntity}Controller {

    @GetMapping
    public List<String> getAll() {
        return Collections.singletonList("Mock GET list response for ${cleanEntity}");
    }

    @PostMapping
    public String create(@RequestBody String body) {
        return "Created ${cleanEntity} successfully: " + body;
    }
}
`;
    });

    return files;
  }
}
