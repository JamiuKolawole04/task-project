<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $tasks = Task::all();

        $listItems = [
            // Website Redesign Project lists
            [
                'title' => 'Create wireframes for homepage',
                'description' => 'Design low-fidelity wireframes for the new homepage layout',
                'completed' => true,
            ],
            [
                'title' => 'Design color palette',
                'description' => 'Choose primary and secondary colors for the new design',
                'completed' => true,
            ],
            [
                'title' => 'Implement responsive navigation',
                'description' => 'Code the responsive navigation menu using CSS and JavaScript',
                'completed' => false,
            ],
            
            // Mobile App Development lists
            [
                'title' => 'Set up development environment',
                'description' => 'Install and configure React Native development tools',
                'completed' => true,
            ],
            [
                'title' => 'Create user authentication flow',
                'description' => 'Implement login, register, and password reset functionality',
                'completed' => false,
            ],
            [
                'title' => 'Design app icons and splash screen',
                'description' => 'Create app icons for different screen sizes and loading screen',
                'completed' => false,
            ],

            // Database Optimization lists
            [
                'title' => 'Analyze slow queries',
                'description' => 'Identify and document all queries taking longer than 1 second',
                'completed' => true,
            ],
            [
                'title' => 'Add database indexes',
                'description' => 'Create appropriate indexes for frequently queried columns',
                'completed' => false,
            ],

            // API Documentation lists
            [
                'title' => 'Document authentication endpoints',
                'description' => 'Write documentation for login, register, and logout endpoints',
                'completed' => false,
            ],
            [
                'title' => 'Create Postman collection',
                'description' => 'Set up Postman collection with all API endpoints and examples',
                'completed' => false,
            ],
        ];

        foreach ($users as $user) {
            foreach ($tasks->take(3) as $taskIndex => $task) {
                // Create 2-4 lists per user per task
                $listsForThisTask = array_slice($listItems, $taskIndex * 3, 3);
                
                foreach ($listsForThisTask as $listData) {
                    TaskList::create([
                        'title' => $listData['title'],
                        'description' => $listData['description'],
                        'task_id' => $task->id,
                        'user_id' => $user->id,
                        'completed' => $listData['completed'],
                    ]);
                }
            }
        }
    }
}