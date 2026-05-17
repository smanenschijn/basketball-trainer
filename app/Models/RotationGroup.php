<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RotationGroup extends Model
{
    protected $fillable = [
        'session_id',
        'title',
        'interval_minutes',
        'total_duration_minutes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'interval_minutes' => 'integer',
            'total_duration_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }

    public function exercises(): BelongsToMany
    {
        return $this->belongsToMany(Exercise::class, 'session_exercises')
            ->withPivot('id', 'sort_order', 'duration_override', 'notes')
            ->orderByPivot('sort_order');
    }

    public function rotationCount(): int
    {
        if ($this->interval_minutes <= 0) {
            return 0;
        }

        return (int) floor($this->total_duration_minutes / $this->interval_minutes);
    }
}
