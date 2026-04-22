<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class CalendarDateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                $date = Carbon::parse($this->input('date'));
                $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
                $endDate = $startOfWeek->copy()->addWeeks(4)->subDay();

                if ($date->lt($startOfWeek) || $date->gt($endDate)) {
                    $validator->errors()->add('date', 'Date must be within the next 4 weeks.');
                }

                if ($date->lt(Carbon::today())) {
                    $validator->errors()->add('date', 'Cannot assign a session to a past date.');
                }
            },
        ];
    }
}
