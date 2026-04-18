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
            ->with(['materials', 'ageGroups' => fn ($q) => $q->withPivot('is_framework')]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($ageGroupId = $request->input('age_group_id')) {
            $query->whereHas('ageGroups', fn ($q) => $q->where('age_groups.id', $ageGroupId));
        }

        if ($duration = $request->input('duration')) {
            $query->where('duration_minutes', '<=', (int) $duration);
        }

        if ($materialId = $request->input('material_id')) {
            $query->whereHas('materials', fn ($q) => $q->where('materials.id', $materialId));
        }

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
        $exercise = Exercise::create([
            ...$request->safe()->except(['materials', 'age_groups']),
            'user_id' => $request->user()?->id,
        ]);

        if ($materials = $request->validated('materials', [])) {
            $materialIds = collect($materials)->map(function (string $name) {
                return Material::firstOrCreate(['name' => strtolower(trim($name))])->id;
            });

            $exercise->materials()->sync($materialIds);
        }

        if ($ageGroups = $request->validated('age_groups', [])) {
            $frameworkAgeGroups = $request->validated('framework_age_groups', []);
            $syncData = [];
            foreach ($ageGroups as $ageGroupId) {
                $syncData[$ageGroupId] = [
                    'is_framework' => in_array($ageGroupId, $frameworkAgeGroups),
                ];
            }
            $exercise->ageGroups()->sync($syncData);
        }

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

        $exercise->update($request->safe()->except(['materials', 'age_groups']));

        if ($materials = $request->validated('materials', [])) {
            $materialIds = collect($materials)->map(function (string $name) {
                return Material::firstOrCreate(['name' => strtolower(trim($name))])->id;
            });

            $exercise->materials()->sync($materialIds);
        } else {
            $exercise->materials()->detach();
        }

        if ($ageGroups = $request->validated('age_groups', [])) {
            $frameworkAgeGroups = $request->validated('framework_age_groups', []);
            $syncData = [];
            foreach ($ageGroups as $ageGroupId) {
                $syncData[$ageGroupId] = [
                    'is_framework' => in_array($ageGroupId, $frameworkAgeGroups),
                ];
            }
            $exercise->ageGroups()->sync($syncData);
        } else {
            $exercise->ageGroups()->detach();
        }

        return back()->with('success', 'Exercise updated successfully.');
    }
}
