<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->with('tasks')
            ->latest()
            ->get();

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,completed,archived'],
        ]);

        $project = $request->user()
            ->projects()
            ->create($data);

        return response()->json($project, 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToUser($request, $project);

        return response()->json($project->load('tasks'));
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToUser($request, $project);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => [
                'sometimes',
                'required',
                'string',
                'in:active,completed,archived',
            ],
        ]);

        $project->update($data);

        return response()->json($project);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToUser($request, $project);

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }

    private function ensureProjectBelongsToUser(
        Request $request,
        Project $project
    ): void {
        abort_unless(
            $project->user_id === $request->user()->id,
            403,
            'You are not allowed to access this project.'
        );
    }
}
