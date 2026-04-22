<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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

    /**
     * Sync materials by name, creating any that don't exist yet.
     *
     * @param  string[]  $materialNames
     */
    public function syncMaterialsByName(array $materialNames): void
    {
        if (empty($materialNames)) {
            $this->materials()->detach();

            return;
        }

        $materialIds = collect($materialNames)->map(function (string $name) {
            return Material::firstOrCreate(['name' => strtolower(trim($name))])->id;
        });

        $this->materials()->sync($materialIds);
    }

    /**
     * Sync age groups with framework pivot data.
     *
     * @param  int[]  $ageGroupIds
     * @param  int[]  $frameworkAgeGroupIds
     */
    public function syncAgeGroupsWithFramework(array $ageGroupIds, array $frameworkAgeGroupIds = []): void
    {
        if (empty($ageGroupIds)) {
            $this->ageGroups()->detach();

            return;
        }

        $syncData = [];
        foreach ($ageGroupIds as $ageGroupId) {
            $syncData[$ageGroupId] = [
                'is_framework' => in_array($ageGroupId, $frameworkAgeGroupIds),
            ];
        }
        $this->ageGroups()->sync($syncData);
    }

    /**
     * Apply common exercise filters (search, age group, duration, material).
     */
    public function scopeApplyFilters(Builder $query, array $filters): Builder
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['age_group_id'])) {
            $query->whereHas('ageGroups', fn ($q) => $q->where('age_groups.id', $filters['age_group_id']));
        }

        if (! empty($filters['duration'])) {
            $query->where('duration_minutes', '<=', (int) $filters['duration']);
        }

        if (! empty($filters['material_id'])) {
            $query->whereHas('materials', fn ($q) => $q->where('materials.id', $filters['material_id']));
        }

        if (! empty($filters['is_framework'])) {
            $query->whereHas('ageGroups', fn ($q) => $q->where('exercise_age_group.is_framework', true));
        }

        return $query;
    }
}
