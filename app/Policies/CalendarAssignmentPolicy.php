<?php

namespace App\Policies;

use App\Models\CalendarAssignment;
use App\Models\User;

class CalendarAssignmentPolicy
{
    public function view(User $user, CalendarAssignment $assignment): bool
    {
        return $user->id === $assignment->user_id;
    }

    public function update(User $user, CalendarAssignment $assignment): bool
    {
        return $user->id === $assignment->user_id;
    }

    public function delete(User $user, CalendarAssignment $assignment): bool
    {
        return $user->id === $assignment->user_id;
    }
}
