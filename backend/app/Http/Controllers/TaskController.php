<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index()
   {
        $tasks = Task::with('creator')
            ->withCount('taskLists')
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
   {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);

        $task->load('creator');

        return response()->json([
            'status' => 'success',
            'message' => 'Task created successfully',
            'data' => new TaskResource($task)
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Task $task)
   {
        $task->load('creator');

        return response()->json([
            'status' => 'success',
            'data' => new TaskResource($task)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
   {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $task->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        $task->load('creator');

        return response()->json([
            'status' => 'success',
            'message' => 'Task updated successfully',
            'data' => new TaskResource($task)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Task deleted successfully'
        ]);
    }
}