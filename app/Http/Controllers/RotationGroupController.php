<?php

namespace App\Http\Controllers;

use App\Models\RotationGroup;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class RotationGroupController extends Controller
{
    public function store(Request $request, Session $session)
    {
        Gate::authorize('update', $session);

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'interval_minutes' => ['required', 'integer', 'min:1'],
            'total_duration_minutes' => ['required', 'integer', 'min:1'],
        ]);

        $maxOrder = max(
            $session->exercises()->whereNull('rotation_group_id')->max('session_exercises.sort_order') ?? -1,
            $session->rotationGroups()->max('sort_order') ?? -1,
        );

        $session->rotationGroups()->create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Rotation group created.');
    }

    public function update(Request $request, Session $session, RotationGroup $rotationGroup)
    {
        Gate::authorize('update', $session);

        abort_unless($rotationGroup->session_id === $session->id, 404);

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'interval_minutes' => ['required', 'integer', 'min:1'],
            'total_duration_minutes' => ['required', 'integer', 'min:1'],
        ]);

        $rotationGroup->update($validated);

        return back()->with('success', 'Rotation group updated.');
    }

    public function destroy(Session $session, RotationGroup $rotationGroup)
    {
        Gate::authorize('update', $session);

        abort_unless($rotationGroup->session_id === $session->id, 404);

        // Detach exercises from the rotation group (remove them from the session entirely)
        DB::table('session_exercises')
            ->where('rotation_group_id', $rotationGroup->id)
            ->delete();

        $rotationGroup->delete();

        return back()->with('success', 'Rotation group deleted.');
    }

    public function addExercise(Request $request, Session $session, RotationGroup $rotationGroup)
    {
        Gate::authorize('update', $session);

        abort_unless($rotationGroup->session_id === $session->id, 404);

        $validated = $request->validate([
            'exercise_id' => ['required', 'integer', 'exists:exercises,id'],
        ]);

        $maxOrder = DB::table('session_exercises')
            ->where('rotation_group_id', $rotationGroup->id)
            ->max('sort_order') ?? -1;

        $session->exercises()->attach($validated['exercise_id'], [
            'rotation_group_id' => $rotationGroup->id,
            'sort_order' => $maxOrder + 1,
            'duration_override' => null,
        ]);

        return back()->with('success', 'Exercise added to rotation.');
    }

    public function removeExercise(Session $session, RotationGroup $rotationGroup, int $pivotId)
    {
        Gate::authorize('update', $session);

        abort_unless($rotationGroup->session_id === $session->id, 404);

        DB::table('session_exercises')
            ->where('id', $pivotId)
            ->where('session_id', $session->id)
            ->where('rotation_group_id', $rotationGroup->id)
            ->delete();

        return back()->with('success', 'Exercise removed from rotation.');
    }

    public function reorderExercises(Request $request, Session $session, RotationGroup $rotationGroup)
    {
        Gate::authorize('update', $session);

        abort_unless($rotationGroup->session_id === $session->id, 404);

        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*.id' => ['required', 'integer'],
            'order.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['order'] as $item) {
            DB::table('session_exercises')
                ->where('id', $item['id'])
                ->where('session_id', $session->id)
                ->where('rotation_group_id', $rotationGroup->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Rotation exercises reordered.');
    }
}
