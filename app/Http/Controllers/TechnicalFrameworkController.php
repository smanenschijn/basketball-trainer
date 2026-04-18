<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadTechnicalFrameworkRequest;
use App\Models\AgeGroup;
use App\Models\Exercise;
use App\Models\TechnicalFramework;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TechnicalFrameworkController extends Controller
{
    public function index()
    {
        $framework = TechnicalFramework::latest()->first();
        $ageGroups = AgeGroup::orderBy('label')->get(['id', 'label']);

        // Get exercises marked as framework, grouped by age group
        $frameworkExercises = Exercise::query()
            ->with(['materials', 'ageGroups'])
            ->whereHas('ageGroups', fn ($q) => $q->where('exercise_age_group.is_framework', true))
            ->get()
            ->groupBy(fn (Exercise $exercise) => $exercise->ageGroups
                ->where('pivot.is_framework', true)
                ->pluck('id')
                ->toArray())
            ->toArray();

        // Flatten into a map of age_group_id => exercises
        $exercisesByAgeGroup = [];
        foreach ($ageGroups as $ageGroup) {
            $exercisesByAgeGroup[$ageGroup->id] = Exercise::query()
                ->with(['materials', 'ageGroups'])
                ->whereHas('ageGroups', fn ($q) => $q
                    ->where('age_groups.id', $ageGroup->id)
                    ->where('exercise_age_group.is_framework', true))
                ->get();
        }

        return Inertia::render('TechnicalFramework/Index', [
            'framework' => $framework ? [
                'id' => $framework->id,
                'original_filename' => $framework->original_filename,
                'age_group_bookmarks' => $framework->age_group_bookmarks ?? [],
                'pdf_url' => route('technical-framework.pdf'),
            ] : null,
            'ageGroups' => $ageGroups,
            'exercisesByAgeGroup' => $exercisesByAgeGroup,
        ]);
    }

    public function upload(UploadTechnicalFrameworkRequest $request)
    {
        $file = $request->file('pdf');
        $path = $file->store('framework', 'public');

        // Delete old framework file if exists
        $old = TechnicalFramework::latest()->first();
        if ($old) {
            Storage::disk('public')->delete($old->file_path);
            $old->delete();
        }

        TechnicalFramework::create([
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'age_group_bookmarks' => $request->validated('bookmarks', []),
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Technical framework uploaded successfully.');
    }

    public function pdf()
    {
        $framework = TechnicalFramework::latest()->first();

        if (! $framework) {
            abort(404);
        }

        $path = Storage::disk('public')->path($framework->file_path);

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$framework->original_filename.'"',
        ]);
    }
}
