<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'exerciseCount' => Exercise::count(),
            'sessionCount' => $user->sessions()->count(),
            'totalTrainingMinutes' => (int) $user->sessions()->sum('duration_minutes'),
        ]);
    }
}
