<?php

namespace App\Policies;

use App\Models\Play;
use App\Models\User;

class PlayPolicy
{
    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Play $play): bool
    {
        return $user->id === $play->user_id || $user->is_admin;
    }

    public function update(User $user, Play $play): bool
    {
        return $user->id === $play->user_id || $user->is_admin;
    }

    public function delete(User $user, Play $play): bool
    {
        return $user->id === $play->user_id || $user->is_admin;
    }
}
