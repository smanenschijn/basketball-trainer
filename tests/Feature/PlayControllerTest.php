<?php

namespace Tests\Feature;

use App\Models\Play;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayControllerTest extends TestCase
{
    use RefreshDatabase;

    private function validCanvasData(): array
    {
        return [
            'players' => [
                ['id' => 'p-1', 'team' => 'yellow', 'x' => 100, 'y' => 200, 'label' => '1'],
                ['id' => 'p-2', 'team' => 'red', 'x' => 300, 'y' => 200, 'label' => '1'],
            ],
            'lines' => [
                ['id' => 'l-1', 'points' => [100, 200, 300, 200], 'dashed' => false],
            ],
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

    public function test_guest_cannot_access_plays(): void
    {
        $this->get(route('plays.index'))->assertRedirect(route('login'));
    }

    public function test_user_can_view_own_plays(): void
    {
        $user = User::factory()->create();
        $this->createPlay($user);
        $this->createPlay($user, ['title' => 'Second Play']);

        $response = $this->actingAs($user)->get(route('plays.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Plays/Index')
            ->has('plays.data', 2)
        );
    }

    public function test_user_cannot_see_other_users_plays(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->createPlay($other);

        $response = $this->actingAs($user)->get(route('plays.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('plays.data', 0));
    }

    public function test_user_can_create_play(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('plays.store'), [
            'title' => 'Fast Break',
            'court_type' => 'half',
            'canvas_data' => $this->validCanvasData(),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('plays', [
            'user_id' => $user->id,
            'title' => 'Fast Break',
            'court_type' => 'half',
        ]);
    }

    public function test_create_play_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('plays.store'), []);

        $response->assertSessionHasErrors(['title', 'court_type', 'canvas_data']);
    }

    public function test_create_play_validates_court_type(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('plays.store'), [
            'title' => 'Test',
            'court_type' => 'invalid',
            'canvas_data' => $this->validCanvasData(),
        ]);

        $response->assertSessionHasErrors(['court_type']);
    }

    public function test_user_can_update_own_play(): void
    {
        $user = User::factory()->create();
        $play = $this->createPlay($user);

        $response = $this->actingAs($user)->put(route('plays.update', $play), [
            'title' => 'Updated Play',
            'court_type' => 'full',
            'canvas_data' => $this->validCanvasData(),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('plays', [
            'id' => $play->id,
            'title' => 'Updated Play',
            'court_type' => 'full',
        ]);
    }

    public function test_user_cannot_update_other_users_play(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $play = $this->createPlay($other);

        $response = $this->actingAs($user)->put(route('plays.update', $play), [
            'title' => 'Hacked',
        ]);

        $response->assertForbidden();
    }

    public function test_user_can_delete_own_play(): void
    {
        $user = User::factory()->create();
        $play = $this->createPlay($user);

        $response = $this->actingAs($user)->delete(route('plays.destroy', $play));

        $response->assertRedirect(route('plays.index'));
        $this->assertDatabaseMissing('plays', ['id' => $play->id]);
    }

    public function test_user_cannot_delete_other_users_play(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $play = $this->createPlay($other);

        $response = $this->actingAs($user)->delete(route('plays.destroy', $play));

        $response->assertForbidden();
    }

    public function test_admin_can_update_any_play(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();
        $play = $this->createPlay($user);

        $response = $this->actingAs($admin)->put(route('plays.update', $play), [
            'title' => 'Admin Edit',
            'canvas_data' => $this->validCanvasData(),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('plays', ['id' => $play->id, 'title' => 'Admin Edit']);
    }

    public function test_user_can_view_create_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('plays.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Plays/Create'));
    }

    public function test_user_can_view_edit_page_for_own_play(): void
    {
        $user = User::factory()->create();
        $play = $this->createPlay($user);

        $response = $this->actingAs($user)->get(route('plays.edit', $play));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Plays/Edit')
            ->has('play')
        );
    }
}
