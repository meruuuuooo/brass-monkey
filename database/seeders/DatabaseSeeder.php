<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            UserSeeder::class,
            ProductSeeder::class,
            SupplierAndPurchaseOrderSeeder::class,
            OrderSeeder::class,
            ServiceAndServiceOrderSeeder::class,
            TransactionAndStockSeeder::class,
            MarketingDataSeeder::class,
            NotesSeeder::class,
            ServiceOrderSeeder::class,
            BlogSeeder::class,
        ]);
    }
}
