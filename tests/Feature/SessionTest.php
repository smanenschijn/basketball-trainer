<?php

namespace Tests\Feature;

use App\Models\AgeGroup;
use App\Models\Exercise;
use App\Models\Session;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    private function validData(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Monday Practice',
            'duration_minutes' => 60,
        ], $overrides);
    }

    private function createSessionForUser(User $user, array $overrides = []): Session
    {
        return Session::create(array_merge([
            'user_id' => $user->id,
            'title' => 'Test Session',
            'duration_minutes' => 60,
        ], $overrides));
    }

    // --- CRUD ---

    public function test_guest_cannot_access_sessions(): void
    {
        $this->get(route('sessions.index'))->assertRedirect(route('login'));
        $this->post(route('sessions.store'), $this->validData())->assertRedirect(route('login'));
    }

    public function test_user_can_view_session_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('sessions.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Sessions/Index'));
    }

    public function test_user_can_create_session_without_date(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('sessions.store'), $this->validData());

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('training_sessions', [
            'user_id' => $user->id,
            'title' => 'Monday Practice',
            'duration_minutes' => 60,
        ]);
    }

    public function test_user_can_create_session_with_age_group(): void
    {
        $user = User::factory()->create();
        $ageGroup = AgeGroup::create(['label' => 'U12']);

        $response = $this->actingAs($user)
            ->post(route('sessions.store'), $this->validData([
                'age_group_id' => $ageGroup->id,
            ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('training_sessions', [
            'age_group_id' => $ageGroup->id,
        ]);
    }

    public function test_create_session_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('sessions.store'), []);

        $response->assertSessionHasErrors(['title', 'duration_minutes']);
    }

    public function test_user_can_view_own_session(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);

        $this->actingAs($user)
            ->get(route('sessions.show', $session))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Sessions/Show'));
    }

    public function test_user_cannot_view_other_users_session(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = $this->createSessionForUser($other);

        $this->actingAs($user)
            ->get(route('sessions.show', $session))
            ->assertForbidden();
    }

    public function test_user_can_delete_own_session(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);

        $this->actingAs($user)
            ->delete(route('sessions.destroy', $session))
            ->assertRedirect(route('sessions.index'));

        $this->assertDatabaseMissing('training_sessions', ['id' => $session->id]);
    }

    public function test_user_cannot_delete_other_users_session(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = $this->createSessionForUser($other);

        $this->actingAs($user)
            ->delete(route('sessions.destroy', $session))
            ->assertForbidden();
    }

    // --- Exercise pivot management ---

    public function test_user_can_add_exercise_to_session(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $exercise = Exercise::create([
            'user_id' => $user->id,
            'title' => 'Layup Drill',
            'description' => 'Basic layups',
            'explanation' => 'Do layups',
            'duration_minutes' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('sessions.exercises.add', $session), [
                'exercise_id' => $exercise->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('session_exercises', [
            'session_id' => $session->id,
            'exercise_id' => $exercise->id,
            'sort_order' => 0,
        ]);
    }

    public function test_user_can_remove_exercise_from_session(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $exercise = Exercise::create([
            'user_id' => $user->id,
            'title' => 'Layup Drill',
            'description' => 'Basic layups',
            'explanation' => 'Do layups',
            'duration_minutes' => 10,
        ]);

        $session->exercises()->attach($exercise->id, ['sort_order' => 0]);
        $pivotId = $session->exercises()->first()->pivot->id;

        $this->actingAs($user)
            ->delete(route('sessions.exercises.remove', [$session, $pivotId]))
            ->assertRedirect();

        $this->assertDatabaseMissing('session_exercises', ['id' => $pivotId]);
    }

    public function test_user_can_reorder_exercises(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);

        $ex1 = Exercise::create([
            'user_id' => $user->id, 'title' => 'Drill A',
            'description' => 'A', 'explanation' => 'A', 'duration_minutes' => 10,
        ]);
        $ex2 = Exercise::create([
            'user_id' => $user->id, 'title' => 'Drill B',
            'description' => 'B', 'explanation' => 'B', 'duration_minutes' => 10,
        ]);

        $session->exercises()->attach($ex1->id, ['sort_order' => 0]);
        $session->exercises()->attach($ex2->id, ['sort_order' => 1]);

        $session->load('exercises');
        $pivot1 = $session->exercises[0]->pivot->id;
        $pivot2 = $session->exercises[1]->pivot->id;

        $this->actingAs($user)
            ->put(route('sessions.exercises.reorder', $session), [
                'order' => [
                    ['id' => $pivot1, 'sort_order' => 1],
                    ['id' => $pivot2, 'sort_order' => 0],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('session_exercises', ['id' => $pivot1, 'sort_order' => 1]);
        $this->assertDatabaseHas('session_exercises', ['id' => $pivot2, 'sort_order' => 0]);
    }

    public function test_user_cannot_modify_other_users_session_exercises(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = $this->createSessionForUser($other);
        $exercise = Exercise::create([
            'user_id' => $other->id, 'title' => 'Drill',
            'description' => 'D', 'explanation' => 'D', 'duration_minutes' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('sessions.exercises.add', $session), [
                'exercise_id' => $exercise->id,
            ])
            ->assertForbidden();
    }

    public function test_index_only_shows_own_sessions(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->createSessionForUser($user, ['title' => 'My Session']);
        $this->createSessionForUser($other, ['title' => 'Other Session']);

        $this->actingAs($user)
            ->get(route('sessions.index'))
            ->assertInertia(fn ($page) => $page
                ->component('Sessions/Index')
                ->has('sessions.data', 1)
                ->where('sessions.data.0.title', 'My Session')
            );
    }
}
