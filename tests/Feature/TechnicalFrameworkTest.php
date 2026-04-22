<?php

namespace Tests\Feature;

use App\Models\AgeGroup;
use App\Models\Exercise;
use App\Models\TechnicalFramework;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TechnicalFrameworkTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_framework_page(): void
    {
        $response = $this->get(route('technical-framework.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_view_framework_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get(route('technical-framework.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('TechnicalFramework/Index')
            ->has('ageGroups')
            ->has('exercisesByAgeGroup')
            ->where('framework', null));
    }

    public function test_user_can_upload_framework_pdf(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->post(route('technical-framework.upload'), [
                'pdf' => UploadedFile::fake()->create('framework.pdf', 1024, 'application/pdf'),
                'bookmarks' => ['1' => 5, '2' => 12],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('technical_frameworks', [
            'original_filename' => 'framework.pdf',
            'uploaded_by' => $user->id,
        ]);

        $framework = TechnicalFramework::first();
        Storage::disk('public')->assertExists($framework->file_path);
        $this->assertEquals(['1' => 5, '2' => 12], $framework->age_group_bookmarks);
    }

    public function test_upload_replaces_existing_framework(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['is_admin' => true]);

        // Upload first
        $this->actingAs($user)
            ->post(route('technical-framework.upload'), [
                'pdf' => UploadedFile::fake()->create('old.pdf', 1024, 'application/pdf'),
            ]);

        $oldPath = TechnicalFramework::first()->file_path;

        // Upload replacement
        $this->actingAs($user)
            ->post(route('technical-framework.upload'), [
                'pdf' => UploadedFile::fake()->create('new.pdf', 1024, 'application/pdf'),
            ]);

        $this->assertDatabaseCount('technical_frameworks', 1);
        $this->assertDatabaseHas('technical_frameworks', ['original_filename' => 'new.pdf']);
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_upload_requires_pdf_file(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->post(route('technical-framework.upload'), [
                'pdf' => UploadedFile::fake()->create('document.txt', 100, 'text/plain'),
            ]);

        $response->assertSessionHasErrors('pdf');
    }

    public function test_framework_pdf_endpoint_returns_file(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['is_admin' => true]);

        $this->actingAs($user)
            ->post(route('technical-framework.upload'), [
                'pdf' => UploadedFile::fake()->create('framework.pdf', 1024, 'application/pdf'),
            ]);

        $response = $this->actingAs($user)
            ->get(route('technical-framework.pdf'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_framework_pdf_returns_404_when_no_document(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get(route('technical-framework.pdf'));

        $response->assertNotFound();
    }

    public function test_framework_exercises_appear_by_age_group(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $ageGroup = AgeGroup::create(['label' => 'U12']);
        $ageGroup2 = AgeGroup::create(['label' => 'U14']);

        $exercise = Exercise::create([
            'user_id' => $user->id,
            'title' => 'Framework Drill',
            'description' => 'A drill',
            'explanation' => '<p>Do the drill</p>',
            'duration_minutes' => 10,
        ]);

        $exercise->ageGroups()->attach($ageGroup->id, ['is_framework' => true]);
        $exercise->ageGroups()->attach($ageGroup2->id, ['is_framework' => false]);

        $response = $this->actingAs($user)
            ->get(route('technical-framework.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('TechnicalFramework/Index')
            ->has("exercisesByAgeGroup.{$ageGroup->id}", 1)
            ->has("exercisesByAgeGroup.{$ageGroup2->id}", 0));
    }

    public function test_exercise_can_be_marked_as_framework_on_create(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $ageGroup = AgeGroup::create(['label' => 'U12']);

        $response = $this->actingAs($user)
            ->post(route('exercises.store'), [
                'title' => 'Framework Drill',
                'description' => 'A drill',
                'explanation' => '<p>Do it</p>',
                'duration_minutes' => 10,
                'age_groups' => [$ageGroup->id],
                'framework_age_groups' => [$ageGroup->id],
            ]);

        $response->assertRedirect();

        $exercise = Exercise::first();
        $pivot = $exercise->ageGroups()->first()->pivot;
        $this->assertTrue((bool) $pivot->is_framework);
    }
}
