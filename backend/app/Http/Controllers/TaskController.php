<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToUser($request, $project);

        return response()->json(
            $project->tasks()->latest()->get()
        );
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToUser($request, $project);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => [
                'nullable',
                'string',
                'in:pending,in_progress,completed',
            ],
            'priority' => [
                'nullable',
                'string',
                'in:low,medium,high',
            ],
            'due_date' => ['nullable', 'date'],
        ]);

        $task = $project->tasks()->create($data);

        return response()->json($task, 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToUser($request, $task);

        return response()->json($task);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToUser($request, $task);

        $data = $request->validate([
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'status' => [
                'sometimes',
                'required',
                'string',
                'in:pending,in_progress,completed',
            ],
            'priority' => [
                'sometimes',
                'required',
                'string',
                'in:low,medium,high',
            ],
            'due_date' => [
                'sometimes',
                'nullable',
                'date',
            ],
        ]);

        $task->update($data);

        return response()->json($task);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToUser($request, $task);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
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

    private function ensureTaskBelongsToUser(
        Request $request,
        Task $task
    ): void {
        abort_unless(
            $task->project()->where(
                'user_id',
                $request->user()->id
            )->exists(),
            403,
            'You are not allowed to access this task.'
        );
    }
}
