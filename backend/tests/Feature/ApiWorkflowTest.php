<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

it('registers a user and returns an API token', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response
        ->assertCreated()
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email'],
            'token',
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});

it('logs in with valid credentials', function () {
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => 'password123',
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'login@example.com',
        'password' => 'password123',
    ]);

    $response
        ->assertOk()
        ->assertJsonStructure(['user', 'token']);
});

it('returns 401 when no token is provided', function () {
    $this->getJson('/api/projects')->assertUnauthorized();
});

it('creates a project and adds a task to it', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user, ['*']);

    $projectResponse = $this->postJson('/api/projects', [
        'name' => 'Solar Farm',
        'description' => 'A renewable energy project',
        'status' => 'active',
    ])->assertCreated();

    $projectId = $projectResponse->json('id');

    $taskResponse = $this->postJson("/api/projects/{$projectId}/tasks", [
        'title' => 'Inspect solar panels',
        'status' => 'pending',
        'priority' => 'high',
    ]);

    $taskResponse->assertCreated();
    $this->assertDatabaseHas('projects', [
        'id' => $projectId,
        'user_id' => $user->id,
        'name' => 'Solar Farm',
    ]);
    $this->assertDatabaseHas('tasks', [
        'project_id' => $projectId,
        'title' => 'Inspect solar panels',
    ]);
});

it('returns 403 when accessing another users project', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $project = $owner->projects()->create([
        'name' => 'Private Project',
        'status' => 'active',
    ]);
    Sanctum::actingAs($otherUser, ['*']);

    $this->getJson("/api/projects/{$project->id}")
        ->assertForbidden();
});
