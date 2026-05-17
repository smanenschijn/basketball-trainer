<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\RotationGroup;
use App\Models\Session;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RotationGroupTest extends TestCase
{
    use RefreshDatabase;

    private function createSessionForUser(User $user): Session
    {
        return Session::create([
            'user_id' => $user->id,
            'title' => 'Test Session',
            'duration_minutes' => 60,
        ]);
    }

    private function createExercise(User $user): Exercise
    {
        return Exercise::create([
            'user_id' => $user->id,
            'title' => 'Test Exercise',
            'description' => 'Description',
            'explanation' => 'Explanation',
            'duration_minutes' => 10,
        ]);
    }

    // --- CRUD ---

    public function test_can_create_rotation_group(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);

        $response = $this->actingAs($user)->post(
            route('sessions.rotation-groups.store', $session),
            [
                'title' => 'Shooting stations',
                'interval_minutes' => 5,
                'total_duration_minutes' => 20,
            ],
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('rotation_groups', [
            'session_id' => $session->id,
            'title' => 'Shooting stations',
            'interval_minutes' => 5,
            'total_duration_minutes' => 20,
        ]);
    }

    public function test_can_create_rotation_group_without_title(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);

        $this->actingAs($user)->post(
            route('sessions.rotation-groups.store', $session),
            [
                'interval_minutes' => 3,
                'total_duration_minutes' => 15,
            ],
        );

        $this->assertDatabaseHas('rotation_groups', [
            'session_id' => $session->id,
            'title' => null,
            'interval_minutes' => 3,
        ]);
    }

    public function test_can_update_rotation_group(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $group = $session->rotationGroups()->create([
            'title' => 'Old title',
            'interval_minutes' => 5,
            'total_duration_minutes' => 20,
            'sort_order' => 0,
        ]);

        $this->actingAs($user)->put(
            route('sessions.rotation-groups.update', [$session, $group]),
            [
                'title' => 'New title',
                'interval_minutes' => 4,
                'total_duration_minutes' => 16,
            ],
        );

        $group->refresh();
        $this->assertEquals('New title', $group->title);
        $this->assertEquals(4, $group->interval_minutes);
        $this->assertEquals(16, $group->total_duration_minutes);
    }

    public function test_can_delete_rotation_group(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $group = $session->rotationGroups()->create([
            'interval_minutes' => 5,
            'total_duration_minutes' => 20,
            'sort_order' => 0,
        ]);
        $exercise = $this->createExercise($user);
        $session->exercises()->attach($exercise->id, [
            'rotation_group_id' => $group->id,
            'sort_order' => 0,
        ]);

        $this->actingAs($user)->delete(
            route('sessions.rotation-groups.destroy', [$session, $group]),
        );

        $this->assertDatabaseMissing('rotation_groups', ['id' => $group->id]);
        $this->assertDatabaseMissing('session_exercises', ['rotation_group_id' => $group->id]);
    }

    // --- Exercises in rotation ---

    public function test_can_add_exercise_to_rotation(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $group = $session->rotationGroups()->create([
            'interval_minutes' => 5,
            'total_duration_minutes' => 20,
            'sort_order' => 0,
        ]);
        $exercise = $this->createExercise($user);

        $this->actingAs($user)->post(
            route('sessions.rotation-groups.exercises.add', [$session, $group]),
            ['exercise_id' => $exercise->id],
        );

        $this->assertDatabaseHas('session_exercises', [
            'session_id' => $session->id,
            'exercise_id' => $exercise->id,
            'rotation_group_id' => $group->id,
        ]);
    }

    public function test_can_remove_exercise_from_rotation(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $group = $session->rotationGroups()->create([
            'interval_minutes' => 5,
            'total_duration_minutes' => 20,
            'sort_order' => 0,
        ]);
        $exercise = $this->createExercise($user);
        $session->exercises()->attach($exercise->id, [
            'rotation_group_id' => $group->id,
            'sort_order' => 0,
        ]);
        $pivotId = $session->exercises()->first()->pivot->id;

        $this->actingAs($user)->delete(
            route('sessions.rotation-groups.exercises.remove', [$session, $group, $pivotId]),
        );

        $this->assertDatabaseMissing('session_exercises', ['id' => $pivotId]);
    }

    // --- Authorization ---

    public function test_cannot_create_rotation_group_for_other_users_session(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = $this->createSessionForUser($other);

        $response = $this->actingAs($user)->post(
            route('sessions.rotation-groups.store', $session),
            [
                'interval_minutes' => 5,
                'total_duration_minutes' => 20,
            ],
        );

        $response->assertForbidden();
    }

    // --- Duration calculation ---

    public function test_total_duration_includes_rotation_groups(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $exercise = $this->createExercise($user);

        // Add standalone exercise (10 min)
        $session->exercises()->attach($exercise->id, [
            'sort_order' => 0,
            'duration_override' => null,
        ]);

        // Add rotation group (20 min total)
        $session->rotationGroups()->create([
            'interval_minutes' => 5,
            'total_duration_minutes' => 20,
            'sort_order' => 1,
        ]);

        $session->load(['exercises', 'rotationGroups']);

        $this->assertEquals(30, $session->totalExerciseDuration());
        $this->assertEquals(30, $session->remainingMinutes());
    }

    // --- Validation ---

    public function test_interval_must_be_positive(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);

        $response = $this->actingAs($user)->post(
            route('sessions.rotation-groups.store', $session),
            [
                'interval_minutes' => 0,
                'total_duration_minutes' => 20,
            ],
        );

        $response->assertSessionHasErrors('interval_minutes');
    }

    public function test_rotation_count_is_derived(): void
    {
        $group = new RotationGroup([
            'interval_minutes' => 5,
            'total_duration_minutes' => 20,
        ]);

        $this->assertEquals(4, $group->rotationCount());
    }

    public function test_rotation_count_with_remainder(): void
    {
        $group = new RotationGroup([
            'interval_minutes' => 7,
            'total_duration_minutes' => 20,
        ]);

        $this->assertEquals(2, $group->rotationCount());
    }
}
