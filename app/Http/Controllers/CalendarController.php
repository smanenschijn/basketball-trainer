<?php

namespace App\Http\Controllers;

use App\Models\CalendarAssignment;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Http\Request;
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

    public function assign(Request $request)
    {
        $validated = $request->validate([
            'session_id' => ['required', 'integer', 'exists:training_sessions,id'],
            'date' => ['required', 'date'],
        ]);

        $user = $request->user();

        // Verify user owns the session
        $session = Session::findOrFail($validated['session_id']);
        if ($session->user_id !== $user->id) {
            abort(403);
        }

        // Enforce 4-week window
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $endDate = $startOfWeek->copy()->addWeeks(4)->subDay();
        $date = Carbon::parse($validated['date']);

        if ($date->lt($startOfWeek) || $date->gt($endDate)) {
            abort(422, 'Date must be within the next 4 weeks.');
        }

        if ($date->lt(Carbon::today())) {
            abort(422, 'Cannot assign a session to a past date.');
        }

        $user->calendarAssignments()->updateOrCreate(
            ['date' => $validated['date']],
            ['session_id' => $validated['session_id']],
        );

        return back()->with('success', 'Session assigned.');
    }

    public function unassign(Request $request, CalendarAssignment $assignment)
    {
        if ($assignment->user_id !== $request->user()->id) {
            abort(403);
        }

        $assignment->delete();

        return back()->with('success', 'Session unassigned.');
    }

    public function move(Request $request, CalendarAssignment $assignment)
    {
        if ($assignment->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
        ]);

        // Enforce 4-week window
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $endDate = $startOfWeek->copy()->addWeeks(4)->subDay();
        $date = Carbon::parse($validated['date']);

        if ($date->lt($startOfWeek) || $date->gt($endDate)) {
            abort(422, 'Date must be within the next 4 weeks.');
        }

        if ($date->lt(Carbon::today())) {
            abort(422, 'Cannot move a session to a past date.');
        }

        // Check no existing assignment on target date
        $existing = CalendarAssignment::where('user_id', $request->user()->id)
            ->where('date', $validated['date'])
            ->where('id', '!=', $assignment->id)
            ->exists();

        if ($existing) {
            abort(422, 'A session is already assigned to that date.');
        }

        $assignment->update(['date' => $validated['date']]);

        return back()->with('success', 'Session moved.');
    }
}
