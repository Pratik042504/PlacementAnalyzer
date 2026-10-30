package com.placementanalyzer.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class LearningGoalController {
    private final LearningGoalRepository repository;

    public LearningGoalController(LearningGoalRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<LearningGoal> getGoals() {
        return repository.findAll();
    }

    @PostMapping
    public LearningGoal addGoal(@RequestBody LearningGoal goal) {
        return repository.save(goal);
    }

    @PutMapping("/{id}")
    public LearningGoal updateGoal(@PathVariable Long id, @RequestBody LearningGoal updatedGoal) {
        return repository.findById(id)
            .map(goal -> {
                goal.setName(updatedGoal.getName());
                goal.setSkill(updatedGoal.getSkill());
                goal.setEstimatedTime(updatedGoal.getEstimatedTime());
                goal.setDone(updatedGoal.isDone());
                return repository.save(goal);
            })
            .orElseThrow(() -> new RuntimeException("Learning goal not found: " + id));
    }

    @DeleteMapping("/{id}")
    public void deleteGoal(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
