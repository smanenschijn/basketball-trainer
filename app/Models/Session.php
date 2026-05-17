<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Session extends Model
{
    protected $table = 'training_sessions';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'duration_minutes',
        'age_group_id',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ageGroup(): BelongsTo
    {
        return $this->belongsTo(AgeGroup::class);
    }

    public function exercises(): BelongsToMany
    {
        return $this->belongsToMany(Exercise::class, 'session_exercises')
            ->withPivot('id', 'sort_order', 'duration_override', 'notes', 'rotation_group_id')
            ->orderByPivot('sort_order');
    }

    public function rotationGroups(): HasMany
    {
        return $this->hasMany(RotationGroup::class)->orderBy('sort_order');
    }

    public function calendarAssignments(): HasMany
    {
        return $this->hasMany(CalendarAssignment::class);
    }

    /**
     * Get standalone exercises (not in any rotation group).
     */
    public function standaloneExercises(): Collection
    {
        return $this->exercises->filter(fn ($ex) => $ex->pivot->rotation_group_id === null);
    }

    public function totalExerciseDuration(): int
    {
        // Standalone exercises contribute their individual duration
        $standaloneDuration = $this->exercises
            ->filter(fn ($ex) => $ex->pivot->rotation_group_id === null)
            ->sum(fn ($ex) => $ex->pivot->duration_override ?? $ex->duration_minutes);

        // Rotation groups contribute their total_duration_minutes
        $rotationDuration = $this->rotationGroups->sum('total_duration_minutes');

        return $standaloneDuration + $rotationDuration;
    }

    public function remainingMinutes(): int
    {
        return $this->duration_minutes - $this->totalExerciseDuration();
    }

    /**
     * Count exercises that are marked as framework for this session's age group.
     */
    public function frameworkExerciseCount(): int
    {
        if (! $this->age_group_id) {
            return 0;
        }

        return $this->exercises->filter(function ($exercise) {
            return $exercise->ageGroups->contains(function ($ag) {
                return $ag->id === $this->age_group_id && $ag->pivot->is_framework;
            });
        })->count();
    }
}
