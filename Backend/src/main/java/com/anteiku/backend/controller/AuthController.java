package com.anteiku.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/")
    public String notSecured() { return "Hello from not secured"; }

    @GetMapping("/secured")
    public String secured() { return "Hello from secured"; }

	@GetMapping("/test_controller")
    public String test_controller() { return "controller is working"; }

}
