<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignCalendarRequest;
use App\Http\Requests\CalendarDateRequest;
use App\Models\CalendarAssignment;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 4 weeks starting from this Monday
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $endDate = $startOfWeek->copy()->addWeeks(4)->subDay();

        $assignments = $user->calendarAssignments()
            ->with(['session.ageGroup', 'session.exercises.ageGroups'])
            ->whereBetween('date', [$startOfWeek->toDateString(), $endDate->toDateString()])
            ->orderBy('date')
            ->get()
            ->map(function (CalendarAssignment $assignment) {
                return [
                    'id' => $assignment->id,
                    'date' => $assignment->date->format('Y-m-d'),
                    'session' => [
                        'id' => $assignment->session->id,
                        'title' => $assignment->session->title,
                        'duration_minutes' => $assignment->session->duration_minutes,
                        'age_group' => $assignment->session->ageGroup,
                        'exercise_count' => $assignment->session->exercises->count(),
                        'framework_exercise_count' => $assignment->session->frameworkExerciseCount(),
                    ],
                ];
            });

        $trainingDays = $user->training_days ?? [];

        // All sessions for the sidebar picker
        $sessions = $user->sessions()
            ->with(['ageGroup', 'exercises.ageGroups'])
            ->latest()
            ->get()
            ->map(function (Session $session) {
                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'duration_minutes' => $session->duration_minutes,
                    'age_group' => $session->ageGroup,
                    'exercise_count' => $session->exercises->count(),
                    'framework_exercise_count' => $session->frameworkExerciseCount(),
                ];
            });

        return Inertia::render('Calendar/Index', [
            'assignments' => $assignments,
            'trainingDays' => $trainingDays,
            'sessions' => $sessions,
            'startDate' => $startOfWeek->toDateString(),
        ]);
    }

    public function assign(AssignCalendarRequest $request)
    {
        $user = $request->user();

        // Verify user owns the session
        $session = Session::findOrFail($request->validated('session_id'));
        if ($session->user_id !== $user->id) {
            abort(403);
        }

        $user->calendarAssignments()->updateOrCreate(
            ['date' => $request->validated('date')],
            ['session_id' => $request->validated('session_id')],
        );

        return back()->with('success', 'Session assigned.');
    }

    public function unassign(Request $request, CalendarAssignment $assignment)
    {
        Gate::authorize('delete', $assignment);

        $assignment->delete();

        return back()->with('success', 'Session unassigned.');
    }

    public function move(CalendarDateRequest $request, CalendarAssignment $assignment)
    {
        Gate::authorize('update', $assignment);

        // Check no existing assignment on target date
        $existing = CalendarAssignment::where('user_id', $request->user()->id)
            ->where('date', $request->validated('date'))
            ->where('id', '!=', $assignment->id)
            ->exists();

        if ($existing) {
            abort(422, 'A session is already assigned to that date.');
        }

        $assignment->update(['date' => $request->validated('date')]);

        return back()->with('success', 'Session moved.');
    }
}
