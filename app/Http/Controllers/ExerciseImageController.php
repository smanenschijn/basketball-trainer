<?php

namespace App\Http\Controllers;

use App\Models\ExerciseImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExerciseImageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $path = $request->file('image')->store('exercise-images', 'public');

        $image = ExerciseImage::create(['path' => $path]);

        return response()->json([
            'url' => asset('storage/'.$path),
            'image_id' => $image->id,
        ]);
    }
}
