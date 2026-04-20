<?php

namespace Tests\Feature;

use App\Models\CalendarAssignment;
use App\Models\Session;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    private function createSessionForUser(User $user, array $overrides = []): Session
    {
        return Session::create(array_merge([
            'user_id' => $user->id,
            'title' => 'Test Session',
            'duration_minutes' => 60,
        ], $overrides));
    }

    // --- Calendar index ---

    public function test_guest_cannot_access_calendar(): void
    {
        $this->get(route('calendar.index'))->assertRedirect(route('login'));
    }

    public function test_user_can_view_calendar(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('calendar.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('assignments')
                ->has('trainingDays')
                ->has('sessions')
                ->has('startDate')
            );
    }

    // --- Assign ---

    public function test_user_can_assign_session_to_date(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $date = Carbon::now()->startOfWeek(Carbon::MONDAY)->addDays(2)->toDateString();

        $this->actingAs($user)
            ->post(route('calendar.assign'), [
                'session_id' => $session->id,
                'date' => $date,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('calendar_assignments', [
            'user_id' => $user->id,
            'session_id' => $session->id,
            'date' => $date,
        ]);
    }

    public function test_user_cannot_assign_other_users_session(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = $this->createSessionForUser($other);
        $date = Carbon::now()->startOfWeek(Carbon::MONDAY)->addDays(2)->toDateString();

        $this->actingAs($user)
            ->post(route('calendar.assign'), [
                'session_id' => $session->id,
                'date' => $date,
            ])
            ->assertForbidden();
    }

    public function test_assigning_to_same_date_replaces_existing(): void
    {
        $user = User::factory()->create();
        $session1 = $this->createSessionForUser($user, ['title' => 'Session 1']);
        $session2 = $this->createSessionForUser($user, ['title' => 'Session 2']);
        $date = Carbon::now()->startOfWeek(Carbon::MONDAY)->addDays(2)->toDateString();

        $this->actingAs($user)->post(route('calendar.assign'), [
            'session_id' => $session1->id,
            'date' => $date,
        ]);

        $this->actingAs($user)->post(route('calendar.assign'), [
            'session_id' => $session2->id,
            'date' => $date,
        ]);

        $this->assertDatabaseCount('calendar_assignments', 1);
        $this->assertDatabaseHas('calendar_assignments', [
            'user_id' => $user->id,
            'session_id' => $session2->id,
            'date' => $date,
        ]);
    }

    public function test_same_session_can_be_assigned_to_multiple_dates(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $date1 = Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString();
        $date2 = Carbon::now()->startOfWeek(Carbon::MONDAY)->addDays(3)->toDateString();

        $this->actingAs($user)->post(route('calendar.assign'), [
            'session_id' => $session->id,
            'date' => $date1,
        ]);

        $this->actingAs($user)->post(route('calendar.assign'), [
            'session_id' => $session->id,
            'date' => $date2,
        ]);

        $this->assertDatabaseCount('calendar_assignments', 2);
    }

    // --- Unassign ---

    public function test_user_can_unassign_session(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $assignment = CalendarAssignment::create([
            'user_id' => $user->id,
            'session_id' => $session->id,
            'date' => Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString(),
        ]);

        $this->actingAs($user)
            ->delete(route('calendar.unassign', $assignment))
            ->assertRedirect();

        $this->assertDatabaseMissing('calendar_assignments', ['id' => $assignment->id]);
    }

    public function test_user_cannot_unassign_other_users_assignment(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = $this->createSessionForUser($other);
        $assignment = CalendarAssignment::create([
            'user_id' => $other->id,
            'session_id' => $session->id,
            'date' => Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString(),
        ]);

        $this->actingAs($user)
            ->delete(route('calendar.unassign', $assignment))
            ->assertForbidden();
    }

    // --- Move ---

    public function test_user_can_move_assignment(): void
    {
        $user = User::factory()->create();
        $session = $this->createSessionForUser($user);
        $oldDate = Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString();
        $newDate = Carbon::now()->startOfWeek(Carbon::MONDAY)->addDays(3)->toDateString();

        $assignment = CalendarAssignment::create([
            'user_id' => $user->id,
            'session_id' => $session->id,
            'date' => $oldDate,
        ]);

        $this->actingAs($user)
            ->put(route('calendar.move', $assignment), ['date' => $newDate])
            ->assertRedirect();

        $this->assertDatabaseHas('calendar_assignments', [
            'id' => $assignment->id,
            'date' => $newDate,
        ]);
    }
}
