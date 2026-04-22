<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExerciseRequest;
use App\Http\Requests\UpdateExerciseRequest;
use App\Models\AgeGroup;
use App\Models\Exercise;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ExerciseController extends Controller
{
    public function index(Request $request)
    {
        $query = Exercise::query()
            ->with(['materials', 'ageGroups' => fn ($q) => $q->withPivot('is_framework')])
            ->applyFilters($request->only(['search', 'age_group_id', 'duration', 'material_id']));

        $exercises = $query->latest()->paginate(50)->withQueryString();

        return Inertia::render('Exercises/Index', [
            'exercises' => $exercises,
            'totalCount' => Exercise::count(),
            'filters' => $request->only(['search', 'age_group_id', 'duration', 'material_id']),
            'ageGroups' => AgeGroup::orderBy('label')->get(['id', 'label']),
            'materials' => Material::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreExerciseRequest $request)
    {
        Gate::authorize('create', Exercise::class);

        $exercise = Exercise::create([
            ...$request->safe()->except(['materials', 'age_groups', 'framework_age_groups']),
            'user_id' => $request->user()?->id,
        ]);

        $exercise->syncMaterialsByName($request->validated('materials', []));
        $exercise->syncAgeGroupsWithFramework(
            $request->validated('age_groups', []),
            $request->validated('framework_age_groups', []),
        );

        return back()->with('success', 'Exercise created successfully.');
    }

    public function show(Exercise $exercise)
    {
        $exercise->load(['materials', 'ageGroups' => fn ($q) => $q->withPivot('is_framework')]);

        return Inertia::render('Exercises/Show', [
            'exercise' => $exercise,
            'ageGroups' => AgeGroup::orderBy('label')->get(['id', 'label']),
        ]);
    }

    public function destroy(Exercise $exercise)
    {
        Gate::authorize('delete', $exercise);

        $exercise->delete();

        return redirect()->route('exercises.index')->with('success', 'Exercise deleted successfully.');
    }

    public function update(UpdateExerciseRequest $request, Exercise $exercise)
    {
        Gate::authorize('update', $exercise);

        $exercise->update($request->safe()->except(['materials', 'age_groups', 'framework_age_groups']));

        $exercise->syncMaterialsByName($request->validated('materials', []));
        $exercise->syncAgeGroupsWithFramework(
            $request->validated('age_groups', []),
            $request->validated('framework_age_groups', []),
        );

        return back()->with('success', 'Exercise updated successfully.');
    }
}
