<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $tasks = [
            [
                'title' => 'Website Redesign Project',
                'description' => 'Complete redesign of the company website with modern UI/UX principles. This includes creating wireframes, design mockups, and implementing responsive design.',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Mobile App Development',
                'description' => 'Develop a mobile application for both iOS and Android platforms. The app should include user authentication, real-time notifications, and offline capability.',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Database Optimization',
                'description' => 'Optimize database queries and improve overall database performance. This includes indexing, query optimization, and implementing caching strategies.',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'API Documentation',
                'description' => 'Create comprehensive API documentation for all endpoints. Include examples, request/response formats, and authentication details.',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Security Audit',
                'description' => 'Conduct a thorough security audit of the application. Identify vulnerabilities and implement security best practices.',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}