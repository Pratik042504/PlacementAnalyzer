
package com.placementanalyzer.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://placement-analyzer-byx627127-hh-868b.vercel.app"
})
public class StudentController {

    private final StudentRepository repository;

    public StudentController(StudentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return repository.save(student);
    }

    @GetMapping
    public List<Student> getStudents() {
        return repository.findAll();
    }

    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student updatedStudent) {
        return repository.findById(id)
            .map(student -> {
                student.setName(updatedStudent.getName());
                student.setCourse(updatedStudent.getCourse());
                student.setTargetCareer(updatedStudent.getTargetCareer());
                student.setYear(updatedStudent.getYear());
                return repository.save(student);
            })
            .orElseThrow(() -> new RuntimeException("Student not found: " + id));
    }

    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
