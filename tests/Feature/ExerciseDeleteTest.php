<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseDeleteTest extends TestCase
{
    use RefreshDatabase;

    private function createExercise(User $user): Exercise
    {
        return Exercise::create([
            'user_id' => $user->id,
            'title' => 'Test Drill',
            'description' => 'A test drill.',
            'explanation' => '<p>Steps</p>',
            'duration_minutes' => 10,
        ]);
    }

    public function test_guest_cannot_delete_exercise(): void
    {
        $user = User::factory()->create();
        $exercise = $this->createExercise($user);

        $response = $this->delete(route('exercises.destroy', $exercise));

        $response->assertRedirect(route('login'));
        $this->assertDatabaseHas('exercises', ['id' => $exercise->id]);
    }

    public function test_owner_can_delete_exercise(): void
    {
        $user = User::factory()->create();
        $exercise = $this->createExercise($user);

        $response = $this->actingAs($user)->delete(route('exercises.destroy', $exercise));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('exercises', ['id' => $exercise->id]);
    }

    public function test_non_owner_cannot_delete_exercise(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $exercise = $this->createExercise($owner);

        $response = $this->actingAs($otherUser)->delete(route('exercises.destroy', $exercise));

        $response->assertForbidden();
        $this->assertDatabaseHas('exercises', ['id' => $exercise->id]);
    }
}
