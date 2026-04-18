<?php

namespace App\Http\Controllers;

use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegistrationRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'register_email' => ['required', 'email', 'max:255'],
        ]);

        $email = $validated['register_email'];

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'register_email' => __('A user with this email already exists.'),
            ]);
        }

        // Check if there's already a pending request
        if (RegistrationRequest::where('email', $email)->where('status', 'pending')->exists()) {
            throw ValidationException::withMessages([
                'register_email' => __('A registration request for this email is already pending.'),
            ]);
        }

        RegistrationRequest::create(['email' => $email]);

        return back()->with('registrationSuccess', true);
    }
}
