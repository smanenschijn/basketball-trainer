<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SetupPasswordController extends Controller
{
    public function create(Request $request, User $user)
    {
        return Inertia::render('Auth/SetupPassword', [
            'email' => $user->email,
            'userId' => $user->id,
        ]);
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user->update([
            'password' => $validated['password'],
        ]);

        return redirect()->route('login')->with('status', 'Your password has been set. You can now log in.');
    }
}
