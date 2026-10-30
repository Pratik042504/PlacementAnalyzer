package com.placementanalyzer.backend;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "http://localhost:5173")
public class SkillController {

    private final SkillRepository repository;

    public SkillController(SkillRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Skill addSkill(@RequestBody Skill skill) {
        return repository.save(skill);
    }

    @GetMapping
    public List<Skill> getSkills() {
        return repository.findAll();
    }

    @PutMapping("/{id}")
    public Skill updateSkill(
            @PathVariable Long id,
            @RequestBody Skill updatedSkill) {

        return repository.findById(id)
            .map(skill -> {
                skill.setName(updatedSkill.getName());
                skill.setLevel(updatedSkill.getLevel());
                skill.setCategory(updatedSkill.getCategory());
                return repository.save(skill);
            })
            .orElseThrow(() ->
                new RuntimeException("Skill not found: " + id));
    }

    @DeleteMapping("/{id}")
    public void deleteSkill(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
