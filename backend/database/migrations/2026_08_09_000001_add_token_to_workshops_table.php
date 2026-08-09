<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Token público e não-adivinhável do workshop, usado nos links de check-in/avaliação.
        Schema::table('workshops', function (Blueprint $table): void {
            $table->string('token', 16)->nullable()->after('id');
        });

        // Backfill dos workshops já existentes (homolog/prod) antes de exigir unicidade.
        foreach (DB::table('workshops')->whereNull('token')->pluck('id') as $id) {
            DB::table('workshops')->where('id', $id)->update(['token' => Str::random(11)]);
        }

        Schema::table('workshops', function (Blueprint $table): void {
            $table->unique('token');
        });
    }

    public function down(): void
    {
        Schema::table('workshops', function (Blueprint $table): void {
            $table->dropUnique(['token']);
            $table->dropColumn('token');
        });
    }
};
