<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class RegistrationApproved extends Mailable
{
    use Queueable, SerializesModels;

    public string $setupUrl;

    public function __construct(public User $user)
    {
        $this->setupUrl = URL::temporarySignedRoute(
            'password.setup',
            now()->addDays(7),
            ['user' => $user->id]
        );
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your registration has been approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.registration-approved',
        );
    }
}
