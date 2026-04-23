<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\Play;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExercisePlayTest extends TestCase
{
    use RefreshDatabase;

    private function validCanvasData(): array
    {
        return [
            'players' => [
                ['id' => 'p-1', 'team' => 'yellow', 'x' => 100, 'y' => 200, 'label' => '1'],
            ],
            'lines' => [],
        ];
    }

    private function createPlay(User $user, array $attrs = []): Play
    {
        return Play::create([
            'user_id' => $user->id,
            'title' => 'Test Play',
            'court_type' => 'half',
            'canvas_data' => $this->validCanvasData(),
            ...$attrs,
        ]);
    }

    private function createExercise(User $user): Exercise
    {
        return Exercise::create([
            'user_id' => $user->id,
            'title' => 'Test Exercise',
            'description' => 'Desc',
            'explanation' => 'Explanation',
            'duration_minutes' => 10,
        ]);
    }

    public function test_admin_can_attach_play_to_exercise(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $exercise = $this->createExercise($admin);
        $play = $this->createPlay($admin);

        $response = $this->actingAs($admin)->post(route('exercises.plays.attach', [
            'exercise' => $exercise->slug,
            'play' => $play->id,
        ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('exercise_play', [
            'exercise_id' => $exercise->id,
            'play_id' => $play->id,
        ]);
    }

    public function test_non_admin_cannot_attach_play(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $exercise = $this->createExercise($user);
        $play = $this->createPlay($user);

        $response = $this->actingAs($user)->post(route('exercises.plays.attach', [
            'exercise' => $exercise->slug,
            'play' => $play->id,
        ]));

        $response->assertForbidden();
    }

    public function test_admin_can_detach_play_from_exercise(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $exercise = $this->createExercise($admin);
        $play = $this->createPlay($admin);
        $exercise->plays()->attach($play->id, ['sort_order' => 0]);

        $response = $this->actingAs($admin)->delete(route('exercises.plays.detach', [
            'exercise' => $exercise->slug,
            'play' => $play->id,
        ]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('exercise_play', [
            'exercise_id' => $exercise->id,
            'play_id' => $play->id,
        ]);
    }

    public function test_attaching_same_play_twice_does_not_duplicate(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $exercise = $this->createExercise($admin);
        $play = $this->createPlay($admin);

        $this->actingAs($admin)->post(route('exercises.plays.attach', [
            'exercise' => $exercise->slug,
            'play' => $play->id,
        ]));
        $this->actingAs($admin)->post(route('exercises.plays.attach', [
            'exercise' => $exercise->slug,
            'play' => $play->id,
        ]));

        $this->assertEquals(1, $exercise->plays()->count());
    }

    public function test_exercise_show_includes_plays(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $exercise = $this->createExercise($admin);
        $play = $this->createPlay($admin, ['title' => 'Fast Break']);
        $exercise->plays()->attach($play->id, ['sort_order' => 0]);

        $response = $this->actingAs($admin)->get(route('exercises.show', $exercise->slug));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Exercises/Show')
            ->has('exercise.plays', 1)
            ->where('exercise.plays.0.title', 'Fast Break')
        );
    }

    public function test_creating_play_with_exercise_id_auto_attaches(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $exercise = $this->createExercise($admin);

        $response = $this->actingAs($admin)->post(route('plays.store'), [
            'title' => 'New Play',
            'court_type' => 'half',
            'canvas_data' => $this->validCanvasData(),
            'exercise_id' => $exercise->id,
        ]);

        $response->assertRedirect(route('exercises.show', $exercise));
        $this->assertEquals(1, $exercise->plays()->count());
        $this->assertEquals('New Play', $exercise->plays()->first()->title);
    }

    public function test_creating_play_without_exercise_id_does_not_attach(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('plays.store'), [
            'title' => 'Standalone Play',
            'court_type' => 'full',
            'canvas_data' => $this->validCanvasData(),
        ]);

        $play = Play::where('title', 'Standalone Play')->first();
        $response->assertRedirect(route('plays.edit', $play));
        $this->assertEquals(0, $play->exercises()->count());
    }
}
