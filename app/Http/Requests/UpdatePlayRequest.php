<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'court_type' => ['sometimes', 'required', Rule::in(['half', 'full'])],
            'canvas_data' => ['sometimes', 'required', 'array'],
            'canvas_data.players' => ['present_with:canvas_data', 'array'],
            'canvas_data.players.*.id' => ['required', 'string'],
            'canvas_data.players.*.team' => ['required', Rule::in(['yellow', 'red'])],
            'canvas_data.players.*.x' => ['required', 'numeric'],
            'canvas_data.players.*.y' => ['required', 'numeric'],
            'canvas_data.players.*.label' => ['required', 'string', 'max:3'],
            'canvas_data.lines' => ['present_with:canvas_data', 'array'],
            'canvas_data.lines.*.id' => ['required', 'string'],
            'canvas_data.lines.*.points' => ['required', 'array', 'min:4'],
            'canvas_data.lines.*.points.*' => ['required', 'numeric'],
            'canvas_data.lines.*.dashed' => ['boolean'],
        ];
    }
}
