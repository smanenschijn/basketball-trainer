<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationRequest extends Model
{
    protected $fillable = ['email', 'status', 'approved_by', 'approved_at'];

    protected function casts(): array
    {
        return [
            'status' => RegistrationStatus::class,
            'approved_at' => 'datetime',
        ];
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPending(): bool
    {
        return $this->status === RegistrationStatus::Pending;
    }
}
