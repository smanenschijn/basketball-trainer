<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseTest extends TestCase
{
    use RefreshDatabase;

    private function validData(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Three-Man Weave',
            'description' => 'A classic passing and layup drill.',
            'explanation' => '<p>Players form three lines...</p>',
            'youtube_url' => 'https://www.youtube.com/watch?v=abc123',
            'duration_minutes' => 15,
            'materials' => ['basketballs', 'cones'],
        ], $overrides);
    }

    public function test_guest_cannot_create_exercise(): void
    {
        $response = $this->post(route('exercises.store'), $this->validData());

        $response->assertRedirect(route('login'));
        $this->assertDatabaseCount('exercises', 0);
    }

    public function test_user_can_create_exercise(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData());

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('exercises', [
            'user_id' => $user->id,
            'title' => 'Three-Man Weave',
            'duration_minutes' => 15,
        ]);
    }

    public function test_materials_are_created_and_associated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData([
                'materials' => ['basketballs', 'cones', 'whistles'],
            ]));

        $this->assertDatabaseCount('materials', 3);
        $this->assertDatabaseHas('materials', ['name' => 'basketballs']);

        $exercise = Exercise::first();
        $this->assertCount(3, $exercise->materials);
    }

    public function test_existing_materials_are_reused(): void
    {
        $user = User::factory()->create();
        Material::create(['name' => 'basketballs']);

        $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData([
                'materials' => ['basketballs', 'cones'],
            ]));

        $this->assertDatabaseCount('materials', 2);
    }

    public function test_title_is_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData(['title' => '']));

        $response->assertSessionHasErrors('title');
    }

    public function test_description_max_500(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData([
                'description' => str_repeat('a', 501),
            ]));

        $response->assertSessionHasErrors('description');
    }

    public function test_youtube_url_must_be_youtube(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData([
                'youtube_url' => 'https://vimeo.com/12345',
            ]));

        $response->assertSessionHasErrors('youtube_url');
    }

    public function test_youtube_url_is_optional(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData([
                'youtube_url' => '',
            ]));

        $response->assertRedirect();
        $response->assertSessionDoesntHaveErrors('youtube_url');
    }

    public function test_duration_must_be_positive(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('exercises.store'), $this->validData([
                'duration_minutes' => 0,
            ]));

        $response->assertSessionHasErrors('duration_minutes');
    }
}
