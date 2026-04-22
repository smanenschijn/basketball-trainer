<?php

namespace App\Http\Requests;

class AssignCalendarRequest extends CalendarDateRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'session_id' => ['required', 'integer', 'exists:training_sessions,id'],
        ];
    }
}
