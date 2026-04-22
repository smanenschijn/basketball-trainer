<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ExerciseImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ExerciseImageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Exercise::class);

        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120'],
        ]);

        $path = $request->file('image')->store('exercise-images', 'public');

        $image = ExerciseImage::create(['path' => $path]);

        return response()->json([
            'url' => asset('storage/'.$path),
            'image_id' => $image->id,
        ]);
    }
}
