<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadTechnicalFrameworkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'bookmarks' => ['nullable', 'array'],
            'bookmarks.*' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
