<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlayRequest;
use App\Http\Requests\UpdatePlayRequest;
use App\Models\Play;
use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PlayController extends Controller
{
    public function index(Request $request)
    {
        $plays = Play::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(50);

        return Inertia::render('Plays/Index', [
            'plays' => $plays,
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Plays/Create', [
            'exerciseId' => $request->query('exercise_id'),
        ]);
    }

    public function store(StorePlayRequest $request)
    {
        $play = Play::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        // If created from an exercise page, auto-attach
        if ($request->filled('exercise_id')) {
            $exercise = Exercise::find($request->input('exercise_id'));
            if ($exercise) {
                $maxSort = $exercise->plays()->max('sort_order') ?? -1;
                $exercise->plays()->attach($play->id, ['sort_order' => $maxSort + 1]);

                return redirect()->route('exercises.show', $exercise)->with('success', 'Play created and attached successfully.');
            }
        }

        return redirect()->route('plays.edit', $play)->with('success', 'Play created successfully.');
    }

    public function show(Play $play)
    {
        Gate::authorize('view', $play);

        return Inertia::render('Plays/Show', [
            'play' => $play,
        ]);
    }

    public function edit(Play $play)
    {
        Gate::authorize('update', $play);

        return Inertia::render('Plays/Edit', [
            'play' => $play,
        ]);
    }

    public function update(UpdatePlayRequest $request, Play $play)
    {
        Gate::authorize('update', $play);

        $play->update($request->validated());

        return back()->with('success', 'Play updated successfully.');
    }

    public function destroy(Play $play)
    {
        Gate::authorize('delete', $play);

        $play->delete();

        return redirect()->route('plays.index')->with('success', 'Play deleted successfully.');
    }
}
