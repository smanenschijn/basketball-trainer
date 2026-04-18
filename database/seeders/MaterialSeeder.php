<?php

namespace Database\Seeders;

use App\Models\Material;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $names = ['basketball', 'cones', 'ladder', 'bibs', 'hoops'];

        foreach ($names as $name) {
            Material::firstOrCreate(['name' => $name]);
        }
    }
}
