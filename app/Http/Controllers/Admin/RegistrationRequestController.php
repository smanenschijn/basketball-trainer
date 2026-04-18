<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Mail\RegistrationApproved;
use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RegistrationRequestController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/RegistrationRequests', [
            'requests' => RegistrationRequest::with('approvedBy:id,name')
                ->latest()
                ->paginate(50)
                ->through(fn (RegistrationRequest $request) => [
                    'id' => $request->id,
                    'email' => $request->email,
                    'status' => $request->status->value,
                    'approved_by' => $request->approvedBy?->name,
                    'approved_at' => $request->approved_at?->toDateTimeString(),
                    'created_at' => $request->created_at->toDateTimeString(),
                ]),
        ]);
    }

    public function approve(Request $request, RegistrationRequest $registrationRequest)
    {
        if (! $registrationRequest->isPending()) {
            return back()->withErrors(['message' => 'This request has already been processed.']);
        }

        // Create the user without a password
        $user = User::create([
            'name' => explode('@', $registrationRequest->email)[0],
            'email' => $registrationRequest->email,
            'password' => Str::random(64),
        ]);

        $registrationRequest->update([
            'status' => RegistrationStatus::Approved,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        Mail::to($user->email)->send(new RegistrationApproved($user));

        return back();
    }

    public function reject(Request $request, RegistrationRequest $registrationRequest)
    {
        if (! $registrationRequest->isPending()) {
            return back()->withErrors(['message' => 'This request has already been processed.']);
        }

        $registrationRequest->update([
            'status' => RegistrationStatus::Rejected,
        ]);

        return back();
    }
}
