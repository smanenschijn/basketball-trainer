<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Exercise extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'explanation',
        'youtube_url',
        'duration_minutes',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        static::creating(function (Exercise $exercise) {
            if (empty($exercise->slug)) {
                $exercise->slug = static::generateUniqueSlug($exercise->title);
            }
        });

        static::updating(function (Exercise $exercise) {
            if ($exercise->isDirty('title')) {
                $exercise->slug = static::generateUniqueSlug($exercise->title, $exercise->id);
            }
        });
    }

    public static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $slug = "{$original}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(Material::class);
    }

    public function ageGroups(): BelongsToMany
    {
        return $this->belongsToMany(AgeGroup::class, 'exercise_age_group')
            ->withPivot('is_framework');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ExerciseImage::class);
    }
}
