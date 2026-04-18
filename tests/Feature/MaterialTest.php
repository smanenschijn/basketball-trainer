<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaterialTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_search_materials(): void
    {
        Material::create(['name' => 'basketballs']);

        $response = $this->getJson(route('materials.index', ['search' => 'ball']));

        $response->assertUnauthorized();
    }

    public function test_returns_matching_materials(): void
    {
        $user = User::factory()->create();
        Material::create(['name' => 'basketballs']);
        Material::create(['name' => 'cones']);
        Material::create(['name' => 'baseball bat']);

        $response = $this->actingAs($user)
            ->getJson(route('materials.index', ['search' => 'ball']));

        $response->assertOk();
        $response->assertJsonCount(2);
        $this->assertContains('basketballs', $response->json());
        $this->assertContains('baseball bat', $response->json());
    }

    public function test_returns_empty_for_no_matches(): void
    {
        $user = User::factory()->create();
        Material::create(['name' => 'basketballs']);

        $response = $this->actingAs($user)
            ->getJson(route('materials.index', ['search' => 'xyz']));

        $response->assertOk();
        $response->assertJsonCount(0);
    }

    public function test_limits_results_to_10(): void
    {
        $user = User::factory()->create();
        for ($i = 0; $i < 15; $i++) {
            Material::create(['name' => "item-{$i}"]);
        }

        $response = $this->actingAs($user)
            ->getJson(route('materials.index', ['search' => 'item']));

        $response->assertOk();
        $response->assertJsonCount(10);
    }
}
