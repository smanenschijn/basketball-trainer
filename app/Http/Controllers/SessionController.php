<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSessionRequest;
use App\Http\Requests\UpdateSessionRequest;
use App\Models\AgeGroup;
use App\Models\Exercise;
use App\Models\Material;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SessionController extends Controller
{
    public function index(Request $request)
    {
        $sessions = $request->user()
            ->sessions()
            ->with(['ageGroup', 'exercises.materials', 'exercises.ageGroups'])
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Sessions/Index', [
            'sessions' => $sessions,
            'ageGroups' => AgeGroup::orderBy('label')->get(['id', 'label']),
        ]);
    }

    public function store(StoreSessionRequest $request)
    {
        $session = $request->user()->sessions()->create(
            $request->validated()
        );

        return redirect()->route('sessions.show', $session)
            ->with('success', 'Training session created.');
    }

    public function show(Session $session, Request $request)
    {
        Gate::authorize('view', $session);

        $session->load(['ageGroup', 'exercises.materials', 'exercises.ageGroups']);

        // Exercise library for the builder — pre-filtered by age group
        $filters = $request->only(['search', 'age_group_id', 'duration', 'material_id', 'is_framework']);
        if (! isset($filters['age_group_id']) && $session->age_group_id) {
            $filters['age_group_id'] = (string) $session->age_group_id;
        }

        $exercises = Exercise::query()
            ->with(['materials', 'ageGroups'])
            ->applyFilters($filters)
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Sessions/Show', [
            'session' => $session,
            'exercises' => $exercises,
            'filters' => $filters,
            'ageGroups' => AgeGroup::orderBy('label')->get(['id', 'label']),
            'materials' => Material::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateSessionRequest $request, Session $session)
    {
        Gate::authorize('update', $session);

        $session->update($request->validated());

        return back()->with('success', 'Training session updated.');
    }

    public function destroy(Session $session)
    {
        Gate::authorize('delete', $session);

        $session->delete();

        return redirect()->route('sessions.index')->with('success', 'Training session deleted.');
    }

    public function addExercise(Request $request, Session $session)
    {
        Gate::authorize('update', $session);

        $validated = $request->validate([
            'exercise_id' => ['required', 'integer', 'exists:exercises,id'],
            'duration_override' => ['nullable', 'integer', 'min:1'],
        ]);

        $maxOrder = $session->exercises()->max('session_exercises.sort_order') ?? -1;

        $session->exercises()->attach($validated['exercise_id'], [
            'sort_order' => $maxOrder + 1,
            'duration_override' => $validated['duration_override'] ?? null,
        ]);

        return back()->with('success', 'Exercise added to session.');
    }

    public function removeExercise(Session $session, int $pivotId)
    {
        Gate::authorize('update', $session);

        DB::table('session_exercises')
            ->where('id', $pivotId)
            ->where('session_id', $session->id)
            ->delete();

        return back()->with('success', 'Exercise removed from session.');
    }

    public function reorderExercises(Request $request, Session $session)
    {
        Gate::authorize('update', $session);

        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*.id' => ['required', 'integer'],
            'order.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['order'] as $item) {
            DB::table('session_exercises')
                ->where('id', $item['id'])
                ->where('session_id', $session->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Exercises reordered.');
    }
}
