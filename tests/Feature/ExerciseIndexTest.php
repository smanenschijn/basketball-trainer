<?php

namespace Tests\Feature;

use App\Models\AgeGroup;
use App\Models\Exercise;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseIndexTest extends TestCase
{
    use RefreshDatabase;

    private function createExercise(User $user, array $overrides = []): Exercise
    {
        return Exercise::create(array_merge([
            'user_id' => $user->id,
            'title' => 'Test Drill',
            'description' => 'A test drill description.',
            'explanation' => '<p>Steps here</p>',
            'duration_minutes' => 15,
        ], $overrides));
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('exercises.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_see_exercise_list(): void
    {
        $user = User::factory()->create();
        $this->createExercise($user);

        $response = $this->actingAs($user)->get(route('exercises.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Exercises/Index')
            ->has('exercises.data', 1)
            ->where('totalCount', 1)
        );
    }

    public function test_user_sees_all_exercises(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $this->createExercise($user, ['title' => 'My Drill']);
        $this->createExercise($otherUser, ['title' => 'Other Drill']);

        $response = $this->actingAs($user)->get(route('exercises.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('exercises.data', 2)
        );
    }

    public function test_search_filter(): void
    {
        $user = User::factory()->create();
        $this->createExercise($user, ['title' => 'Dribbling Skills']);
        $this->createExercise($user, ['title' => 'Shooting Practice']);

        $response = $this->actingAs($user)->get(route('exercises.index', ['search' => 'dribbling']));

        $response->assertInertia(fn ($page) => $page
            ->has('exercises.data', 1)
            ->where('exercises.data.0.title', 'Dribbling Skills')
        );
    }

    public function test_age_group_filter(): void
    {
        $user = User::factory()->create();
        $u8 = AgeGroup::create(['label' => 'U8']);
        $u14 = AgeGroup::create(['label' => 'U14']);

        $drill1 = $this->createExercise($user, ['title' => 'Young Drill']);
        $drill1->ageGroups()->attach($u8);

        $drill2 = $this->createExercise($user, ['title' => 'Teen Drill']);
        $drill2->ageGroups()->attach($u14);

        $response = $this->actingAs($user)->get(route('exercises.index', ['age_group_id' => $u8->id]));

        $response->assertInertia(fn ($page) => $page
            ->has('exercises.data', 1)
            ->where('exercises.data.0.title', 'Young Drill')
        );
    }

    public function test_duration_filter(): void
    {
        $user = User::factory()->create();
        $this->createExercise($user, ['title' => 'Quick Drill', 'duration_minutes' => 5]);
        $this->createExercise($user, ['title' => 'Long Drill', 'duration_minutes' => 30]);

        $response = $this->actingAs($user)->get(route('exercises.index', ['duration' => 10]));

        $response->assertInertia(fn ($page) => $page
            ->has('exercises.data', 1)
            ->where('exercises.data.0.title', 'Quick Drill')
        );
    }

    public function test_material_filter(): void
    {
        $user = User::factory()->create();
        $basketball = Material::create(['name' => 'basketball']);
        $cones = Material::create(['name' => 'cones']);

        $drill1 = $this->createExercise($user, ['title' => 'Ball Drill']);
        $drill1->materials()->attach($basketball);

        $drill2 = $this->createExercise($user, ['title' => 'Cone Drill']);
        $drill2->materials()->attach($cones);

        $response = $this->actingAs($user)->get(route('exercises.index', ['material_id' => $basketball->id]));

        $response->assertInertia(fn ($page) => $page
            ->has('exercises.data', 1)
            ->where('exercises.data.0.title', 'Ball Drill')
        );
    }

    public function test_empty_state(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('exercises.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('exercises.data', 0)
            ->where('totalCount', 0)
        );
    }

    public function test_age_groups_and_materials_passed_as_filter_options(): void
    {
        $user = User::factory()->create();
        AgeGroup::create(['label' => 'U10']);
        Material::create(['name' => 'ladder']);

        $response = $this->actingAs($user)->get(route('exercises.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('ageGroups', 1)
            ->has('materials', 1)
        );
    }
}
