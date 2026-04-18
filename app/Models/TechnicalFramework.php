<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnicalFramework extends Model
{
    protected $fillable = [
        'file_path',
        'original_filename',
        'age_group_bookmarks',
        'uploaded_by',
    ];

    protected $casts = [
        'age_group_bookmarks' => 'array',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
