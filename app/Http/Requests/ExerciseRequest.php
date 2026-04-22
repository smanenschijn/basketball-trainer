<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class ExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:500'],
            'explanation' => ['required', 'string'],
            'youtube_url' => ['nullable', 'url', 'regex:/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'materials' => ['array'],
            'materials.*' => ['string', 'max:255'],
            'age_groups' => ['array'],
            'age_groups.*' => ['integer', 'exists:age_groups,id'],
            'framework_age_groups' => ['array'],
            'framework_age_groups.*' => ['integer', 'exists:age_groups,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'youtube_url.regex' => 'The URL must be a valid YouTube link.',
        ];
    }
}
