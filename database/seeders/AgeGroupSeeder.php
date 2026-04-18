<?php

namespace Database\Seeders;

use App\Models\AgeGroup;
use Illuminate\Database\Seeder;

class AgeGroupSeeder extends Seeder
{
    public function run(): void
    {
        $labels = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18+'];

        foreach ($labels as $label) {
            AgeGroup::firstOrCreate(['label' => $label]);
        }
    }
}
