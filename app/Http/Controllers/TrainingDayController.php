<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TrainingDayController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'days' => ['present', 'array'],
            'days.*' => ['integer', 'min:0', 'max:6'],
        ]);

        $request->user()->update([
            'training_days' => array_values(array_unique($validated['days'])),
        ]);

        return back()->with('success', 'Training days updated.');
    }
}
