<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'duration_minutes' => ['sometimes', 'required', 'integer', 'min:1', 'max:300'],
            'age_group_id' => ['nullable', 'integer', 'exists:age_groups,id'],
        ];
    }
}
