<?php

namespace App\Http\Controllers;

use App\Http\Resources\ListResource;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ListController extends Controller
{
    
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $taskId = $request->query('task_id');
        
        $query = TaskList::with(['task', 'user'])
            ->where('user_id', $request->user()->id);
        
        if ($taskId) {
            $query->where('task_id', $taskId);
        }
        
        $lists = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => ListResource::collection($lists),
            'meta' => [
                'current_page' => $lists->currentPage(),
                'last_page' => $lists->lastPage(),
                'per_page' => $lists->perPage(),
                'total' => $lists->total(),
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
            'description' => 'nullable|string',
            'task_id' => 'required|exists:tasks,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $list = TaskList::create([
            'title' => $request->title,
            'description' => $request->description,
            'task_id' => $request->task_id,
            'user_id' => $request->user()->id,
            'completed' => false,
        ]);

        $list->load(['task', 'user']);

        return response()->json([
            'status' => 'success',
            'message' => 'List created successfully',
            'data' => new ListResource($list)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskList $list)
    {
       
        if ($list->user_id !== request()->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $list->load(['task', 'user']);

        return response()->json([
            'status' => 'success',
            'data' => new ListResource($list)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaskList $list)
   {
        if ($list->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $list->update([
            'title' => $request->title,
            'description' => $request->description,
            'completed' => $request->boolean('completed'),
        ]);

        $list->load(['task', 'user']);

        return response()->json([
            'status' => 'success',
            'message' => 'List updated successfully',
            'data' => new ListResource($list)
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskList $list)
   {
        if ($list->user_id !== request()->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $list->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'List deleted successfully'
        ]);
    }
}