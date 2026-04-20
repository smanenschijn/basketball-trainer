<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingDayTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_update_training_days(): void
    {
        $this->put(route('training-days.update'), ['days' => [0, 2]])
            ->assertRedirect(route('login'));
    }

    public function test_user_can_set_training_days(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('training-days.update'), ['days' => [0, 2, 4]])
            ->assertRedirect();

        $user->refresh();
        $this->assertEquals([0, 2, 4], $user->training_days);
    }

    public function test_updating_training_days_replaces_existing(): void
    {
        $user = User::factory()->create(['training_days' => [0, 1, 2]]);

        $this->actingAs($user)->put(route('training-days.update'), ['days' => [3, 4]]);

        $user->refresh();
        $this->assertEquals([3, 4], $user->training_days);
    }

    public function test_user_can_clear_all_training_days(): void
    {
        $user = User::factory()->create(['training_days' => [0, 1]]);

        $this->actingAs($user)->put(route('training-days.update'), ['days' => []]);

        $user->refresh();
        $this->assertEquals([], $user->training_days);
    }

    public function test_invalid_day_values_are_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('training-days.update'), ['days' => [7]])
            ->assertSessionHasErrors('days.0');
    }
}
